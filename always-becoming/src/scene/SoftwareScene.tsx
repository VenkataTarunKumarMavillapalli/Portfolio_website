import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  clamp,
  geographicPoint,
  lerp,
  morphFrame,
  smooth,
  TAU,
} from "./geometry";
import { LAND_POINTS, LAND_RINGS } from "./geography";
import { LOCATION_POINTS } from "./locations";
import {
  circlePoints,
  createSoftwareAssets,
  FRAME_POSES,
  projectSoftwarePoint,
  softwareMatrix,
  type Point3,
  type SoftwareAssets,
  type SoftwareMesh,
} from "./softwareGeometry";

export interface SoftwareSceneProps {
  progress: number;
  motionEnabled: boolean;
  globeRotation?: number;
  selectedLocation?: string;
  structure?: number;
  onSelectLocation?: (id: string) => void;
  onError?: () => void;
}
type Line = {
  points: Point3[];
  color: string;
  opacity: number;
  width?: number;
  matrix?: THREE.Matrix4;
  globe?: boolean;
};
type DrawFace = {
  points: Point3[];
  z: number;
  color: string;
  opacity: number;
  wire: boolean;
};
type Marker = { id: string; x: number; y: number };
const BRASS: Point3 = [180, 145, 91];
const CYAN: Point3 = [79, 133, 148];
const lerpPoint = (
  a: readonly number[],
  b: readonly number[],
  t: number,
): Point3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const transform = (point: Point3, matrix: THREE.Matrix4): Point3 =>
  new THREE.Vector3(...point).applyMatrix4(matrix).toArray();
const layer = (p: number, chapter: number) =>
  smooth(chapter - 0.85, chapter - 0.05, p) *
  (1 - smooth(chapter + 0.08, chapter + 0.88, p));
const tint = (a: Point3, b: Point3, t: number): Point3 => lerpPoint(a, b, t);

/** Demand-rendered perspective meshes, with depth sorting and directional metal lighting. */
function paintMeshes(
  ctx: CanvasRenderingContext2D,
  meshes: SoftwareMesh[],
  root: THREE.Matrix4,
  cx: number,
  cy: number,
  unit: number,
) {
  const faces: DrawFace[] = [];
  const light = new THREE.Vector3(-0.48, 0.75, 0.68).normalize();
  const half = light
    .clone()
    .add(new THREE.Vector3(0, 0, 1))
    .normalize();
  const normal = new THREE.Vector3();
  const edgeA = new THREE.Vector3();
  const edgeB = new THREE.Vector3();
  for (const mesh of meshes) {
    const opacity = mesh.opacity ?? 1;
    if (opacity < 0.004) continue;
    const matrix = root
      .clone()
      .multiply(
        mesh.matrix ?? softwareMatrix(mesh.position, mesh.rotation, mesh.scale),
      );
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(matrix);
    const positions = mesh.geometry.getAttribute("position");
    const normals = mesh.geometry.getAttribute("normal");
    const indices = mesh.geometry.index;
    const vertices: Point3[] = Array.from({ length: positions.count }, (_, i) =>
      transform(
        [positions.getX(i), positions.getY(i), positions.getZ(i)],
        matrix,
      ),
    );
    const count = indices?.count ?? positions.count;
    for (let i = 0; i < count; i += 3) {
      const ia = indices?.getX(i) ?? i,
        ib = indices?.getX(i + 1) ?? i + 1,
        ic = indices?.getX(i + 2) ?? i + 2;
      const a = vertices[ia],
        b = vertices[ib],
        c = vertices[ic];
      if (a[2] > 6.5 || b[2] > 6.5 || c[2] > 6.5) continue;
      if (normals) {
        normal
          .set(
            normals.getX(ia) + normals.getX(ib) + normals.getX(ic),
            normals.getY(ia) + normals.getY(ib) + normals.getY(ic),
            normals.getZ(ia) + normals.getZ(ib) + normals.getZ(ic),
          )
          .applyMatrix3(normalMatrix)
          .normalize();
      } else {
        edgeA.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
        edgeB.set(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
        normal.copy(edgeA).cross(edgeB).normalize();
      }
      if (normal.z < 0) normal.negate();
      const diffuse = Math.max(0, normal.dot(light));
      const metal = mesh.metallic ?? 0.4;
      const reflection =
        Math.pow(Math.max(0, normal.dot(half)), 24) * (0.2 + metal * 1.5);
      const rim = Math.pow(1 - Math.abs(normal.z), 3) * metal * 0.2;
      const rgb = mesh.color.map((channel, index) =>
        Math.round(
          clamp(
            channel * (0.22 + diffuse * 0.8 + rim) +
              reflection * [190, 171, 133][index],
            0,
            255,
          ),
        ),
      );
      faces.push({
        points: [a, b, c].map((point) =>
          projectSoftwarePoint(point, cx, cy, unit),
        ),
        z: (a[2] + b[2] + c[2]) / 3,
        color: `rgb(${rgb.join(",")})`,
        opacity,
        wire: !!mesh.wire,
      });
    }
  }
  faces.sort((a, b) => a.z - b.z);
  for (const face of faces) {
    ctx.globalAlpha = face.opacity;
    ctx.beginPath();
    face.points.forEach(([x, y], index) =>
      index ? ctx.lineTo(x, y) : ctx.moveTo(x, y),
    );
    ctx.closePath();
    ctx.fillStyle = face.color;
    ctx.fill();
    // Subpixel same-color seams avoid dark gaps between adjacent tessellated triangles.
    ctx.strokeStyle = face.color;
    ctx.lineWidth = face.wire ? 0.7 : 0.45;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function paintLines(
  ctx: CanvasRenderingContext2D,
  lines: Line[],
  root: THREE.Matrix4,
  cx: number,
  cy: number,
  unit: number,
) {
  for (const line of lines) {
    if (line.opacity < 0.003) continue;
    const matrix = root.clone().multiply(line.matrix ?? new THREE.Matrix4());
    ctx.strokeStyle = line.color;
    ctx.globalAlpha = line.opacity;
    ctx.lineWidth = line.width ?? 0.75;
    ctx.beginPath();
    let pen = false;
    for (const point of line.points) {
      const world = transform(point, matrix);
      // The front hemisphere's horizon follows the perspective camera, not a flat map mask.
      if (line.globe && world[2] < 0.43) {
        pen = false;
        continue;
      }
      const [x, y] = projectSoftwarePoint(world, cx, cy, unit);
      if (pen) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
      pen = true;
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function archiveMeshes(
  assets: SoftwareAssets,
  p: number,
  meshes: SoftwareMesh[],
  lines: Line[],
  globeAngle: number,
) {
  const arrive = smooth(0.35, 0.98, p);
  const morph = smooth(1.08, 1.94, p);
  const depart = 1 - smooth(2.12, 2.82, p);
  const opacity = arrive * depart;
  if (opacity < 0.004) return;
  const globalRotation: Point3 = [
    lerp(-0.025, 0.14, morph),
    lerp(0.06, globeAngle, morph),
    lerp(-0.025, -0.05, morph),
  ];
  const archiveMatrix = softwareMatrix(
    [0, 0, lerp(-2.3, 0, arrive)],
    globalRotation,
  );
  for (let index = 0; index < 6; index++) {
    const pose = FRAME_POSES[index];
    morphFrame(assets.frames[index], morph, pose.width, pose.height, 20);
    const position = lerpPoint(pose.position, [0, 0, 0], morph);
    const rotation = lerpPoint(
      pose.rotation,
      [0, (index * Math.PI) / 6, 0],
      morph,
    );
    const local = archiveMatrix
      .clone()
      .multiply(softwareMatrix(position, rotation));
    const worldPosition = new THREE.Vector3()
      .setFromMatrixPosition(local)
      .toArray();
    const euler = new THREE.Euler().setFromRotationMatrix(local);
    const orientation: Point3 = [euler.x, euler.y, euler.z];
    meshes.push({
      geometry: assets.frames[index],
      position: worldPosition,
      rotation: orientation,
      color: tint(BRASS, CYAN, morph),
      opacity: opacity * lerp(1, 0.24, morph),
      metallic: 0.8,
    });
    const paper = opacity * (1 - smooth(1.08, 1.52, p));
    if (paper > 0.004) {
      meshes.push({
        geometry: assets.plane,
        position: worldPosition,
        rotation: orientation,
        scale: [pose.width * 0.92, pose.height * 0.92, 1],
        color: index % 2 ? [60, 49, 37] : [78, 59, 38],
        opacity: paper * 0.8,
        metallic: 0,
      });
      // Empty abstract archival plates, never fabricated photographs or memories.
      for (let row = 0; row < 5; row++)
        lines.push({
          points: [
            [-pose.width * 0.32, -pose.height * 0.29 + row * 0.045, 0.028],
            [
              pose.width * (row === 0 ? 0.28 : 0.08),
              -pose.height * 0.29 + row * 0.045,
              0.028,
            ],
          ],
          color: "#b9a482",
          opacity: paper * 0.35,
          matrix: local,
        });
      lines.push({
        points: [
          [-pose.width * 0.32, pose.height * 0.32, 0.028],
          [-pose.width * 0.15, pose.height * 0.32, 0.028],
        ],
        color: "#b9a482",
        opacity: paper * 0.7,
        matrix: local,
      });
    }
  }
}

export function renderSoftwareScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  props: SoftwareSceneProps,
  assets: SoftwareAssets,
  pointer: Point3,
  drag: number,
): Marker[] {
  const mobile = width < 760;
  const p = props.motionEnabled
    ? clamp(props.progress, 0, 9)
    : Math.round(clamp(props.progress, 0, 9));
  const cx = width * (mobile ? 0.5 : 0.735),
    cy = height * (mobile ? 0.29 : 0.49);
  const unit = mobile
    ? Math.min(width * 0.16, height * 0.07)
    : Math.min(width * 0.117, height * 0.205);
  const palette: Point3[] = [
    [43, 31, 18],
    [47, 31, 18],
    [12, 37, 53],
    [15, 35, 39],
    [37, 25, 49],
    [23, 40, 33],
    [15, 27, 43],
    [19, 35, 45],
    [42, 34, 25],
    [44, 33, 21],
  ];
  const base = Math.min(8, Math.floor(p)),
    amount = p - base;
  const halo = tint(palette[base], palette[base + 1], smooth(0, 1, amount));
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#070a0d";
  ctx.fillRect(0, 0, width, height);
  const glow = ctx.createRadialGradient(
    cx - unit * 0.3,
    cy - unit * 0.4,
    0,
    cx,
    cy,
    unit * 3.7,
  );
  glow.addColorStop(0, `rgba(${halo.join(",")},0.8)`);
  glow.addColorStop(1, "rgba(7,10,13,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < (mobile ? 28 : 58); i++) {
    const a = Math.sin((i + 1) * 12.9898) * 43758.5453,
      b = Math.sin((i + 1) * 78.233) * 43758.5453;
    ctx.fillStyle = `rgba(190,183,160,${0.08 + (i % 5) * 0.022})`;
    ctx.fillRect(
      (a - Math.floor(a)) * width,
      (b - Math.floor(b)) * height,
      0.9,
      0.9,
    );
  }
  const parallax = props.motionEnabled ? 1 : 0;
  const root = softwareMatrix(
    [0, 0, 0],
    [pointer[1] * 0.045 * parallax, pointer[0] * 0.065 * parallax, 0],
  );
  const meshes: SoftwareMesh[] = [];
  const lines: Line[] = [];
  const selected = LOCATION_POINTS.find(
    (location) => location.id === props.selectedLocation,
  );
  const angle =
    (-(selected?.longitude ?? 48) * Math.PI) / 180 +
    (props.globeRotation ?? 0) +
    drag;
  const depart = smooth(0.08, 0.94, p),
    hero = 1 - smooth(0.41, 0.92, p);
  if (hero > 0.004) {
    const scale = lerp(1.12, 2.25, depart);
    meshes.push({
      geometry: assets.ribbon,
      position: [0, 0, depart * 2.25],
      rotation: [
        lerp(0.16, 0, depart),
        lerp(-0.36, 0.04, depart),
        lerp(-0.17, 0.03, depart),
      ],
      scale: [scale, scale, scale],
      color: BRASS,
      opacity: hero,
      metallic: 0.95,
    });
    const orbit = Array.from({ length: 85 }, (_, i): Point3 => {
      const a = (i / 84) * Math.PI * 1.48 - 0.64;
      return [Math.cos(a) * 2.02, Math.sin(a) * 2.02, -0.3];
    });
    lines.push({
      points: orbit,
      color: "#ac9470",
      opacity: hero * 0.22,
      matrix: softwareMatrix([0, 0, depart * 1.3], [0.1, -0.32, -0.17]),
    });
  }
  archiveMeshes(assets, p, meshes, lines, angle);
  const globeOpacity = smooth(1.27, 1.92, p) * (1 - smooth(2.08, 2.83, p));
  const globeMatrix = softwareMatrix([0, 0, 0], [0.14, angle, -0.05]);
  if (globeOpacity > 0.004) {
    meshes.push({
      geometry: assets.sphere,
      rotation: [0.14, angle, -0.05],
      color: [15, 40, 58],
      opacity: globeOpacity,
      metallic: 0.14,
    });
    for (const ring of LAND_RINGS)
      lines.push({
        points: ring.map(([longitude, latitude]) =>
          geographicPoint(latitude, longitude, 1.714).toArray(),
        ),
        color: "#8db1ba",
        opacity: globeOpacity * 0.72,
        width: mobile ? 0.65 : 0.8,
        matrix: globeMatrix,
        globe: true,
      });
    for (let latitude = -60; latitude <= 60; latitude += 30)
      lines.push({
        points: Array.from({ length: 73 }, (_, i) =>
          geographicPoint(latitude, i * 5, 1.72).toArray(),
        ),
        color: "#5b8499",
        opacity: globeOpacity * 0.24,
        matrix: globeMatrix,
        globe: true,
      });
    for (const [from, to] of [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 4],
      [4, 5],
      [5, 6],
    ]) {
      const a = geographicPoint(
          LOCATION_POINTS[from].latitude,
          LOCATION_POINTS[from].longitude,
          1,
        ),
        b = geographicPoint(
          LOCATION_POINTS[to].latitude,
          LOCATION_POINTS[to].longitude,
          1,
        );
      const arcAngle = a.angleTo(b);
      const points = Array.from({ length: 35 }, (_, i): Point3 => {
        const t = i / 34;
        return a
          .clone()
          .multiplyScalar(Math.sin((1 - t) * arcAngle) / Math.sin(arcAngle))
          .add(
            b
              .clone()
              .multiplyScalar(Math.sin(t * arcAngle) / Math.sin(arcAngle)),
          )
          .multiplyScalar(
            1.74 + Math.sin(t * Math.PI) * Math.min(0.44, arcAngle * 0.25),
          )
          .toArray();
      });
      const active =
        LOCATION_POINTS[from].id === props.selectedLocation ||
        LOCATION_POINTS[to].id === props.selectedLocation;
      lines.push({
        points,
        color: active ? "#d7b77f" : "#7096a3",
        opacity: globeOpacity * (active ? 0.7 : 0.21),
        matrix: globeMatrix,
        globe: true,
      });
    }
  }
  addLaterChapters(assets, p, props.structure ?? 0.5, meshes, lines);
  paintMeshes(ctx, meshes, root, cx, cy, unit);
  paintLines(ctx, lines, root, cx, cy, unit);
  const markers: Marker[] = [];
  if (globeOpacity > 0.01) {
    const matrix = root.clone().multiply(globeMatrix);
    // Actual land points reinforce continents at a small size without introducing map textures.
    for (let i = 0; i < LAND_POINTS.length; i += mobile ? 3 : 2) {
      const [longitude, latitude] = LAND_POINTS[i];
      const world = transform(
        geographicPoint(latitude, longitude, 1.721).toArray(),
        matrix,
      );
      if (world[2] < 0.43) continue;
      const [x, y] = projectSoftwarePoint(world, cx, cy, unit);
      ctx.fillStyle = `rgba(112,151,157,${globeOpacity * 0.3})`;
      ctx.fillRect(x, y, mobile ? 0.8 : 1.1, mobile ? 0.8 : 1.1);
    }
    for (const location of LOCATION_POINTS) {
      const world = transform(
        geographicPoint(location.latitude, location.longitude, 1.752).toArray(),
        matrix,
      );
      if (world[2] < 0.43) continue;
      const [x, y] = projectSoftwarePoint(world, cx, cy, unit);
      const active = location.id === props.selectedLocation;
      ctx.globalAlpha = globeOpacity;
      ctx.strokeStyle = active ? "#e6c087" : "#a7cbd3";
      ctx.fillStyle = active ? "#ffe3ad" : "#c2dbe0";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(x, y, active ? 6.5 : 4, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, active ? 2.8 : 1.7, 0, TAU);
      ctx.fill();
      markers.push({ id: location.id, x, y });
    }
    ctx.globalAlpha = 1;
  }
  return markers;
}

function addLaterChapters(
  assets: SoftwareAssets,
  p: number,
  structure: number,
  meshes: SoftwareMesh[],
  lines: Line[],
) {
  const put = (
    geometry: THREE.BufferGeometry,
    color: Point3,
    opacity: number,
    matrix: THREE.Matrix4,
    position: Point3 = [0, 0, 0],
    scale: Point3 = [1, 1, 1],
    rotation: Point3 = [0, 0, 0],
    metallic = 0.4,
  ) => {
    meshes.push({
      geometry,
      color,
      opacity,
      matrix: matrix
        .clone()
        .multiply(softwareMatrix(position, rotation, scale)),
      metallic,
    });
  };
  const line = (
    points: Point3[],
    color: string,
    opacity: number,
    matrix: THREE.Matrix4,
    width = 0.8,
  ) => lines.push({ points, color, opacity, matrix, width });

  // 03: a service lattice with visible shelves, rails, data packets and depth.
  const engineering = layer(p, 3);
  if (engineering > 0.003) {
    const matrix = softwareMatrix(
      [0, -0.03, 0],
      [0.2, -0.48 + (p - 3) * 0.24, -0.015],
    );
    for (let rack = 0; rack < 3; rack++) {
      const x = (rack - 1) * 1.18,
        z = (rack - 1) * -0.36;
      for (const side of [-1, 1]) {
        put(
          assets.box,
          [69, 104, 111],
          engineering,
          matrix,
          [x + side * 0.4, 0, z],
          [0.055, 2.65, 0.11],
        );
        put(
          assets.box,
          [33, 59, 69],
          engineering,
          matrix,
          [x + side * 0.4, 0, z - 0.55],
          [0.045, 2.65, 0.09],
        );
      }
      for (let level = 0; level < 6; level++) {
        const y = -1.22 + level * 0.48;
        put(
          assets.box,
          level === 2 ? [114, 158, 162] : [46, 71, 81],
          engineering * 0.9,
          matrix,
          [x, y, z - 0.26],
          [0.86, 0.045, 0.72],
        );
        if ((rack + level) % 2 === 0)
          put(
            assets.box,
            [135, 189, 195],
            engineering,
            matrix,
            [x - 0.15, y + 0.13, z + 0.02],
            [0.13, 0.17, 0.13],
            [0, 0.14, 0],
          );
      }
    }
    for (let axis = -3; axis <= 3; axis++) {
      line(
        [
          [-2, -1.34, axis * 0.6],
          [2, -1.34, axis * 0.6],
        ],
        "#5a8d99",
        engineering * 0.18,
        matrix,
      );
      line(
        [
          [axis * 0.6, -1.34, -2],
          [axis * 0.6, -1.34, 2],
        ],
        "#5a8d99",
        engineering * 0.18,
        matrix,
      );
    }
    line(
      [
        [-1.25, 0.42, 0.45],
        [-0.5, 0.42, 0.45],
        [-0.5, -0.53, 0.45],
        [0.55, -0.53, 0.45],
        [0.55, 0.88, 0.45],
        [1.3, 0.88, 0.45],
      ],
      "#b9d9d8",
      engineering * 0.7,
      matrix,
      1.1,
    );
  }

  // 04: a parameter-driven mathematical knot, a surface rather than decorative flat loops.
  const research = layer(p, 4);
  if (research > 0.003) {
    const matrix = softwareMatrix(
      [0, 0, 0],
      [0.18 + (p - 4) * 0.26, 0.35, -0.16],
    );
    const position = assets.research.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    const parameter = clamp(structure);
    const surface = (u: number, v: number): Point3 => {
      const r =
        1.15 + 0.43 * Math.cos(3 * u) + v * Math.cos(u * 1.5 + parameter);
      return [
        r * Math.cos(2 * u),
        r * Math.sin(2 * u),
        0.57 * Math.sin(3 * u) + v * Math.sin(u * 1.5 + parameter),
      ];
    };
    for (let i = 0; i <= 80; i++)
      for (let j = 0; j <= 4; j++)
        position.setXYZ(
          i * 5 + j,
          ...surface((i / 80) * TAU, (j / 4 - 0.5) * (0.35 + parameter * 0.3)),
        );
    position.needsUpdate = true;
    assets.research.computeVertexNormals();
    put(
      assets.research,
      [170, 153, 195],
      research,
      matrix,
      [0, 0, 0],
      [1.15, 1.15, 1.15],
      [0, 0, 0],
      0.7,
    );
    for (const edge of [-1, 1])
      line(
        Array.from(
          { length: 121 },
          (_, i) =>
            surface((i / 120) * TAU, (edge * (0.35 + parameter * 0.3)) / 2).map(
              (value) => value * 1.15,
            ) as Point3,
        ),
        "#d5c5e5",
        research * 0.55,
        matrix,
      );
    for (let i = 0; i < 32; i++)
      line(
        [surface((i / 32) * TAU, -0.3), surface((i / 32) * TAU, 0.3)].map(
          (point) => point.map((value) => value * 1.15) as Point3,
        ),
        "#aa9fbf",
        research * 0.2,
        matrix,
      );
    line(
      [
        [-2, -1.7, 0],
        [2, -1.7, 0],
      ],
      "#8a7b9c",
      research * 0.25,
      matrix,
    );
  }

  // 05: translucent-looking ordered data columns. Amber gaps mark the deliberately fictional sample.
  const quality = layer(p, 5);
  if (quality > 0.003) {
    const matrix = softwareMatrix(
      [0, -0.2, 0],
      [0.15, -0.53 + (p - 5) * 0.2, 0],
    );
    for (let row = 0; row < 3; row++)
      for (let column = 0; column < 5; column++) {
        const x = (column - 2) * 0.64,
          z = (row - 1) * -0.71;
        const height = 1.12 + ((column * 3 + row * 2) % 5) * 0.27;
        const flagged = row === 0 && (column === 1 || column === 4);
        put(
          assets.box,
          flagged ? [145, 117, 77] : [109, 157, 141],
          quality * 0.82,
          matrix,
          [x, height / 2 - 1.25, z],
          [0.35, height, 0.35],
          [0, 0, 0],
          0.1,
        );
        for (let step = 0; step < 4; step++)
          line(
            [
              [x - 0.175, -1.15 + step * 0.35, z + 0.182],
              [x + 0.175, -1.15 + step * 0.35, z + 0.182],
            ],
            flagged && step === 2 ? "#dcb376" : "#bed2c1",
            quality * 0.48,
            matrix,
          );
      }
    put(
      assets.box,
      [51, 76, 68],
      quality * 0.7,
      matrix,
      [0, -1.3, 0],
      [3.4, 0.07, 2.2],
    );
    line(
      [
        [-1.8, -1.15, 0.9],
        [1.8, -1.15, 0.9],
      ],
      "#b3cfb8",
      quality * 0.55,
      matrix,
    );
  }

  // 06: receding source portals around a human-review aperture, no institutional reconstruction.
  const intelligence = layer(p, 6);
  if (intelligence > 0.003) {
    const matrix = softwareMatrix(
      [0, 0, -0.15],
      [0.08, -0.3 + (p - 6) * 0.16, 0],
    );
    for (let portal = 0; portal < 6; portal++) {
      const z = 1.15 - portal * 0.66,
        scale = 1 - portal * 0.075;
      for (const side of [-1, 1])
        put(
          assets.box,
          portal === 0 ? [119, 131, 143] : [65, 84, 106],
          intelligence,
          matrix,
          [side * 1.35 * scale, 0, z],
          [0.055, 2.6 * scale, 0.1],
        );
      for (const side of [-1, 1])
        put(
          assets.box,
          [99, 114, 128],
          intelligence,
          matrix,
          [0, side * 1.3 * scale, z],
          [2.72 * scale, 0.05, 0.1],
        );
    }
    put(
      assets.ring,
      [203, 193, 162],
      intelligence,
      matrix,
      [0, 0, -2.45],
      [0.64, 0.64, 0.64],
      [0, 0, 0],
      0.75,
    );
    for (const x of [-1.15, -0.4, 0.4, 1.15])
      line(
        [
          [x, -1.32, 1.3],
          [x * 0.25, -0.63, -1.6],
          [0, 0, -2.36],
        ],
        "#ccbea0",
        intelligence * (Math.abs(x) < 1 ? 0.7 : 0.4),
        matrix,
        1.05,
      );
    for (const side of [-1, 1])
      for (let k = 0; k < 4; k++)
        put(
          assets.box,
          [128, 163, 177],
          intelligence,
          matrix,
          [side * (0.42 + k * 0.22), (k - 1.5) * 0.38, -0.3 - k * 0.3],
          [0.07, 0.07, 0.07],
        );
  }

  // 07: six distinct, connected systems arranged around a review ring.
  const laboratory = layer(p, 7);
  if (laboratory > 0.003) {
    const matrix = softwareMatrix(
      [0, 0, 0],
      [0.48, 0.2 + (p - 7) * 0.16, -0.04],
    );
    put(
      assets.ring,
      [146, 178, 183],
      laboratory,
      matrix,
      [0, -0.2, 0],
      [1.08, 1.08, 1.08],
      [Math.PI / 2, 0, 0],
      0.65,
    );
    for (let system = 0; system < 6; system++) {
      const angle = (system / 6) * TAU;
      const x = Math.cos(angle) * 1.65,
        z = Math.sin(angle) * 1.65;
      const color: Point3 =
        system % 3 === 0
          ? [167, 157, 125]
          : system % 3 === 1
            ? [104, 157, 163]
            : [126, 135, 169];
      put(
        assets.box,
        [50, 73, 82],
        laboratory,
        matrix,
        [x, -0.54, z],
        [0.62, 0.06, 0.62],
        [0, -angle, 0],
      );
      if (system % 3 === 0) {
        for (let k = 0; k < 3; k++)
          put(
            assets.box,
            color,
            laboratory,
            matrix,
            [x, -0.32 + k * 0.24, z],
            [0.4, 0.075, 0.4],
            [0, -angle, 0],
          );
      } else if (system % 3 === 1) {
        for (let k = 0; k < 3; k++)
          put(
            assets.box,
            color,
            laboratory,
            matrix,
            [x + (k - 1) * 0.17, -0.18 + k * 0.1, z],
            [0.085, 0.55 + k * 0.17, 0.18],
            [0, -angle, 0],
          );
      } else {
        for (const side of [-1, 1])
          put(
            assets.box,
            color,
            laboratory,
            matrix,
            [x + side * 0.23, -0.08, z],
            [0.045, 0.85, 0.06],
          );
        put(
          assets.box,
          color,
          laboratory,
          matrix,
          [x, 0.34, z],
          [0.5, 0.045, 0.06],
        );
      }
      line(
        [
          [x, -0.44, z],
          [x * 0.62, -0.2, z * 0.62],
        ],
        "#a8c4c5",
        laboratory * 0.62,
        matrix,
      );
    }
    line(circlePoints(0.48, -0.2, 48), "#d5c5a0", laboratory * 0.7, matrix);
  }

  // 08–09: the same archive plates gather around a final open ribbon.
  const calm = smooth(7.12, 7.98, p);
  if (calm > 0.003) {
    const converge = smooth(8.08, 9, p);
    const matrix = softwareMatrix(
      [0, 0, -0.2],
      [0.02, lerp(-0.16, 0.2, converge), 0.025],
    );
    for (let index = 0; index < 6; index++) {
      const pose = FRAME_POSES[index];
      morphFrame(assets.frames[index], 0, pose.width, pose.height, 20);
      const angle = (index / 6) * TAU;
      const position = lerpPoint(
        [
          pose.position[0] * 1.1,
          pose.position[1] * 0.85,
          pose.position[2] * 0.5,
        ],
        [Math.cos(angle) * 1.85, Math.sin(angle) * 1.85, -1.1],
        converge,
      );
      const scale = lerp(0.9, 0.33, converge);
      const rotation = lerpPoint(
        pose.rotation,
        [0.08, -angle * 0.08, angle + Math.PI / 2],
        converge,
      );
      put(
        assets.frames[index],
        [173, 151, 116],
        calm * lerp(0.82, 0.34, converge),
        matrix,
        position,
        [scale, scale, scale],
        rotation,
        0.65,
      );
      put(
        assets.plane,
        [72, 65, 52],
        calm * (1 - converge) * 0.85,
        matrix,
        position,
        [pose.width * scale * 0.92, pose.height * scale * 0.92, 1],
        rotation,
        0,
      );
    }
    if (converge > 0.003)
      put(
        assets.ribbon,
        BRASS,
        converge,
        matrix,
        [0, 0, 0.35],
        [0.93, 0.93, 0.93],
        [0.14, -0.24, -0.12],
        0.95,
      );
    line(
      circlePoints(1.92, -1.55, 64),
      "#ac9876",
      calm * (1 - converge) * 0.15,
      matrix,
    );
  }
}

export default function SoftwareScene(props: SoftwareSceneProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef(props);
  propsRef.current = props;
  const assets = useMemo(createSoftwareAssets, []);
  const requestDraw = useRef<() => void>(() => {});
  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext("2d", { alpha: false });
    if (!element || !ctx) {
      propsRef.current.onError?.();
      return;
    }
    let frame = 0,
      width = 1,
      height = 1,
      drag = 0;
    let markers: Marker[] = [];
    const pointer: Point3 = [0, 0, 0];
    let start: { x: number; y: number; drag: number; id: number } | null = null;
    const draw = () => {
      frame = 0;
      if (!document.hidden)
        markers = renderSoftwareScene(
          ctx,
          width,
          height,
          propsRef.current,
          assets,
          pointer,
          drag,
        );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    requestDraw.current = schedule;
    const resize = () => {
      const bounds = element.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        width < 760 ? 1.25 : 1.5,
      );
      element.width = Math.round(width * dpr);
      element.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      schedule();
    };
    const down = (event: PointerEvent) => {
      if (propsRef.current.progress > 1.65 && propsRef.current.progress < 2.65)
        start = {
          x: event.clientX,
          y: event.clientY,
          drag,
          id: event.pointerId,
        };
    };
    const move = (event: PointerEvent) => {
      if (
        start?.id === event.pointerId &&
        Math.abs(event.clientX - start.x) >
          Math.abs(event.clientY - start.y) * 1.2
      ) {
        drag = start.drag + (event.clientX - start.x) * 0.006;
        schedule();
      }
      if (!propsRef.current.motionEnabled || event.pointerType !== "mouse")
        return;
      pointer[0] = (event.clientX / width) * 2 - 1;
      pointer[1] = 1 - (event.clientY / height) * 2;
      schedule();
    };
    const up = (event: PointerEvent) => {
      if (
        start &&
        Math.hypot(event.clientX - start.x, event.clientY - start.y) < 7
      ) {
        const bounds = element.getBoundingClientRect();
        const marker = markers.find(
          (point) =>
            Math.hypot(
              point.x - event.clientX + bounds.left,
              point.y - event.clientY + bounds.top,
            ) < 13,
        );
        if (marker) propsRef.current.onSelectLocation?.(marker.id);
      }
      start = null;
    };
    const cancel = () => {
      start = null;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    element.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("pointercancel", cancel, { passive: true });
    document.addEventListener("visibilitychange", schedule);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      requestDraw.current = () => {};
      element.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [assets]);
  useEffect(() => {
    requestDraw.current();
  }, [
    props.progress,
    props.motionEnabled,
    props.globeRotation,
    props.selectedLocation,
    props.structure,
  ]);
  useEffect(() => () => assets.dispose(), [assets]);
  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      data-renderer="software-3d"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        touchAction: "pan-y",
      }}
    />
  );
}
