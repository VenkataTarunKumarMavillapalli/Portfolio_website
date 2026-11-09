import * as THREE from "three";
import { LAND_POINTS, LAND_RINGS } from "./geography";

export const TAU = Math.PI * 2;
export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
export const smooth = (from: number, to: number, value: number) => {
  const t = clamp((value - from) / (to - from));
  return t * t * (3 - 2 * t);
};
export const lerp = THREE.MathUtils.lerp;

export function lineSegmentsFromPoints(points: THREE.Vector3[]) {
  const positions: number[] = [];
  for (let i = 1; i < points.length; i++)
    positions.push(...points[i - 1].toArray(), ...points[i].toArray());
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  return geometry;
}

export function geographicPoint(
  latitude: number,
  longitude: number,
  radius = 1.7,
) {
  const lat = THREE.MathUtils.degToRad(latitude);
  const lon = THREE.MathUtils.degToRad(longitude);
  return new THREE.Vector3(
    radius * Math.cos(lat) * Math.sin(lon),
    radius * Math.sin(lat),
    radius * Math.cos(lat) * Math.cos(lon),
  );
}

/** A sculpted, open, half-twist ribbon. No assets or generated textures. */
export function ribbonGeometry(segments = 240, across = 12) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const u = (i / segments) * TAU * 1.055 - 0.35;
    const radius = 1.43 + 0.065 * Math.sin(u * 3 + 0.8);
    const twist = u * 0.52 + 0.43;
    for (let j = 0; j <= across; j++) {
      const v = (j / across - 0.5) * 0.68;
      const radial = radius + v * Math.cos(twist);
      positions.push(
        Math.cos(u) * radial,
        Math.sin(u) * radial * 1.13,
        0.22 * Math.sin(u * 2) + v * Math.sin(twist),
      );
      uvs.push(i / segments, j / across);
      if (i < segments && j < across) {
        const a = i * (across + 1) + j;
        const b = a + across + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function ribbonEdge(side = 1) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 240; i++) {
    const u = (i / 240) * TAU * 1.055 - 0.35;
    const v = side * 0.34;
    const radius =
      1.43 + 0.065 * Math.sin(u * 3 + 0.8) + v * Math.cos(u * 0.52 + 0.43);
    points.push(
      new THREE.Vector3(
        Math.cos(u) * radius,
        Math.sin(u) * radius * 1.13,
        0.22 * Math.sin(u * 2) + v * Math.sin(u * 0.52 + 0.43),
      ),
    );
  }
  return lineSegmentsFromPoints(points);
}

export function frameGeometry(segments = 96) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      new Float32Array((segments + 1) * 4 * 3),
      3,
    ).setUsage(THREE.DynamicDrawUsage),
  );
  const indices: number[] = [];
  for (let i = 0; i < segments; i++) {
    const a = i * 4;
    const b = a + 4;
    // Front, back, inner and outer walls create a genuinely solid metal frame.
    indices.push(a, a + 1, b, a + 1, b + 1, b);
    indices.push(a + 2, b + 2, a + 3, a + 3, b + 2, b + 3);
    indices.push(a, b, a + 2, a + 2, b, b + 2);
    indices.push(a + 1, a + 3, b + 1, a + 3, b + 3, b + 1);
  }
  geometry.setIndex(indices);
  return geometry;
}

/** The same six frames turn continuously into the globe's six meridians. */
export function morphFrame(
  geometry: THREE.BufferGeometry,
  mix: number,
  width: number,
  height: number,
  segments = 96,
) {
  const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
  const band = lerp(0.034, 0.011, mix);
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * TAU;
    const cx = Math.cos(theta);
    const sy = Math.sin(theta);
    const x = lerp(
      (Math.sign(cx) * Math.pow(Math.abs(cx), 0.22) * width) / 2,
      cx * 1.755,
      mix,
    );
    const y = lerp(
      (Math.sign(sy) * Math.pow(Math.abs(sy), 0.22) * height) / 2,
      sy * 1.755,
      mix,
    );
    const outward = new THREE.Vector2(
      x / (width * width),
      y / (height * height),
    ).normalize();
    for (let j = 0; j < 4; j++) {
      const edge = j % 2 === 0 ? 1 : -1;
      pos.setXYZ(
        i * 4 + j,
        x + outward.x * band * edge,
        y + outward.y * band * edge,
        j < 2 ? 0.019 : -0.019,
      );
    }
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
}

export function coastlineGeometry() {
  const positions: number[] = [];
  for (const ring of LAND_RINGS) {
    for (let i = 1; i < ring.length; i++) {
      const a = geographicPoint(ring[i - 1][1], ring[i - 1][0], 1.708);
      const b = geographicPoint(ring[i][1], ring[i][0], 1.708);
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  return geometry;
}

export function landPointGeometry(mobile: boolean) {
  const positions: number[] = [];
  for (let i = 0; i < LAND_POINTS.length; i += mobile ? 2 : 1) {
    const [longitude, latitude] = LAND_POINTS[i];
    const point = geographicPoint(latitude, longitude, 1.712);
    positions.push(point.x, point.y, point.z);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  return geometry;
}

export function latitudeGeometry() {
  const positions: number[] = [];
  for (let latitude = -60; latitude <= 60; latitude += 30) {
    for (let longitude = 0; longitude < 360; longitude += 3) {
      const a = geographicPoint(latitude, longitude, 1.718);
      const b = geographicPoint(latitude, longitude + 3, 1.718);
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  return geometry;
}

export function associationArc(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
) {
  const a = geographicPoint(from.latitude, from.longitude, 1).normalize();
  const b = geographicPoint(to.latitude, to.longitude, 1).normalize();
  const angle = a.angleTo(b);
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 80; i++) {
    const t = i / 80;
    const point =
      Math.abs(Math.sin(angle)) > 0.0001
        ? a
            .clone()
            .multiplyScalar(Math.sin((1 - t) * angle) / Math.sin(angle))
            .add(
              b.clone().multiplyScalar(Math.sin(t * angle) / Math.sin(angle)),
            )
        : a.clone().lerp(b, t).normalize();
    point.multiplyScalar(
      1.73 + Math.sin(t * Math.PI) * Math.min(0.55, angle * 0.27),
    );
    points.push(point);
  }
  return lineSegmentsFromPoints(points);
}

export function dustGeometry(count: number) {
  const positions: number[] = [];
  // Fixed deterministic positions make backward scrolling reproduce the same world.
  for (let i = 0; i < count; i++) {
    const rand = (seed: number) => {
      const value = Math.sin((i + 1) * seed) * 43758.5453;
      return value - Math.floor(value);
    };
    positions.push(
      (rand(12.9898) - 0.5) * 16,
      (rand(78.233) - 0.5) * 11,
      -2 - rand(39.425) * 8,
    );
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  return geometry;
}
