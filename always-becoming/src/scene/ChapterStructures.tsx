import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type PropsWithChildren,
  type RefObject,
} from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  clamp,
  frameGeometry,
  lineSegmentsFromPoints,
  morphFrame,
  ribbonGeometry,
  smooth,
  TAU,
} from "./geometry";
import {
  JOURNEY_COLUMNS,
  JOURNEY_POINT_COUNT,
  JOURNEY_ROWS,
  journeyOrientation,
  mathematicalSurfaceGeometry,
  sampleJourneyPoint,
  sceneColor,
  sceneEnvelope,
  updateMathematicalSurface,
} from "./journeyGeometry";

interface ChapterProps {
  progress: number;
  mobile: boolean;
  elapsed: RefObject<number>;
  structure: number;
}

/** Every chapter enters and exits on a scroll-addressed, reversible camera beat. */
function SceneStage({
  chapter,
  progress,
  children,
  rotation = [0, 0, 0],
}: PropsWithChildren<{
  chapter: number;
  progress: number;
  rotation?: [number, number, number];
}>) {
  const group = useRef<THREE.Group>(null);
  const materials = useRef<
    { material: THREE.Material; opacity: number; depthWrite: boolean }[]
  >([]);
  useLayoutEffect(() => {
    const seen = new Set<THREE.Material>();
    const records: typeof materials.current = [];
    group.current?.traverse((object) => {
      if (!("material" in object)) return;
      const values = (object as THREE.Mesh).material;
      const list = Array.isArray(values) ? values : [values];
      for (const material of list) {
        if (!material || seen.has(material)) continue;
        seen.add(material);
        records.push({
          material,
          opacity: material.opacity,
          depthWrite: material.depthWrite,
        });
        if (!material.transparent) {
          material.transparent = true;
          material.needsUpdate = true;
        }
      }
    });
    materials.current = records;
  }, [chapter]);
  useFrame(() => {
    if (!group.current) return;
    const opacity = sceneEnvelope(progress, chapter);
    group.current.visible = opacity > 0.001;
    if (opacity < 0.001) return;
    const approach = clamp(progress - chapter, -0.9, 0.9);
    group.current.position.z = approach < 0 ? approach * 1.45 : approach * 0.7;
    group.current.rotation.set(
      rotation[0] + approach * 0.07,
      rotation[1] + approach * 0.2,
      rotation[2],
    );
    group.current.scale.setScalar(1 + approach * 0.035);
    for (const record of materials.current) {
      record.material.opacity = record.opacity * opacity;
      record.material.depthWrite = record.depthWrite && opacity > 0.98;
    }
  });
  return <group ref={group}>{children}</group>;
}

function WireBox({
  size,
  color = "#8fa9b6",
  opacity = 0.35,
}: {
  size: [number, number, number];
  color?: string;
  opacity?: number;
}) {
  const [x, y, z] = size;
  const geometry = useMemo(() => {
    const box = new THREE.BoxGeometry(x, y, z);
    const edges = new THREE.EdgesGeometry(box);
    box.dispose();
    return edges;
  }, [x, y, z]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </lineSegments>
  );
}

function MetalFrame({
  width,
  height,
  color = "#8fa9b6",
  opacity = 0.85,
}: {
  width: number;
  height: number;
  color?: string;
  opacity?: number;
}) {
  const geometry = useMemo(() => {
    const shape = frameGeometry(72);
    morphFrame(shape, 0, width, height, 72);
    return shape;
  }, [width, height]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={color}
        roughness={0.3}
        metalness={0.83}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Path({
  points,
  color = "#a2c9d1",
  opacity = 0.45,
}: {
  points: [number, number, number][];
  color?: string;
  opacity?: number;
}) {
  const key = JSON.stringify(points);
  const geometry = useMemo(
    () =>
      lineSegmentsFromPoints(
        points.map((point) => new THREE.Vector3(...point)),
      ),
    [key],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </lineSegments>
  );
}

function CurvedPath({
  from,
  to,
  bow = 0.3,
  color = "#b7c9d6",
  opacity = 0.45,
}: {
  from: [number, number, number];
  to: [number, number, number];
  bow?: number;
  color?: string;
  opacity?: number;
}) {
  const key = `${from.join(",")}:${to.join(",")}:${bow}`;
  const geometry = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const middle = a
      .clone()
      .lerp(b, 0.5)
      .add(new THREE.Vector3(0, bow, Math.abs(bow) * 0.7));
    const curve = new THREE.QuadraticBezierCurve3(a, middle, b);
    return lineSegmentsFromPoints(curve.getPoints(48));
  }, [key]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </lineSegments>
  );
}

/** The globe's coordinates become a system, a surface, data, and finally a ribbon. */
function JourneyLattice({
  progress,
  structure,
  mobile,
}: Pick<ChapterProps, "progress" | "structure" | "mobile">) {
  const group = useRef<THREE.Group>(null);
  const lineMaterial = useRef<THREE.LineBasicMaterial>(null);
  const pointMaterial = useRef<THREE.PointsMaterial>(null);
  const last = useRef({ progress: -1, structure: -1 });
  const pairIndices = useMemo(() => {
    const pairs: [number, number][] = [];
    for (let row = 0; row < JOURNEY_ROWS; row++)
      for (let column = 0; column < JOURNEY_COLUMNS; column++) {
        const index = row * JOURNEY_COLUMNS + column;
        if (column < JOURNEY_COLUMNS - 1) pairs.push([index, index + 1]);
        if (row < JOURNEY_ROWS - 1 && (!mobile || column % 2 === 0))
          pairs.push([index, index + JOURNEY_COLUMNS]);
      }
    return pairs;
  }, [mobile]);
  const nodes = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array(JOURNEY_POINT_COUNT * 3),
        3,
      ).setUsage(THREE.DynamicDrawUsage),
    );
    return geometry;
  }, []);
  const lines = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array(pairIndices.length * 6),
        3,
      ).setUsage(THREE.DynamicDrawUsage),
    );
    return geometry;
  }, [pairIndices]);
  useEffect(() => () => nodes.dispose(), [nodes]);
  useEffect(() => () => lines.dispose(), [lines]);
  useFrame(() => {
    const show = smooth(2.3, 2.83, progress);
    if (group.current) {
      group.current.visible = show > 0.001;
      group.current.rotation.set(...journeyOrientation(progress));
    }
    if (show < 0.001) return;
    if (
      last.current.progress !== progress ||
      last.current.structure !== structure
    ) {
      const position = nodes.getAttribute("position") as THREE.BufferAttribute;
      const links = lines.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < JOURNEY_POINT_COUNT; i++)
        position.setXYZ(i, ...sampleJourneyPoint(i, progress, structure));
      for (let i = 0; i < pairIndices.length; i++) {
        const [a, b] = pairIndices[i];
        links.setXYZ(
          i * 2,
          position.getX(a),
          position.getY(a),
          position.getZ(a),
        );
        links.setXYZ(
          i * 2 + 1,
          position.getX(b),
          position.getY(b),
          position.getZ(b),
        );
      }
      position.needsUpdate = true;
      links.needsUpdate = true;
      nodes.computeBoundingSphere();
      lines.computeBoundingSphere();
      last.current = { progress, structure };
    }
    const human =
      smooth(7.4, 7.95, progress) * (1 - smooth(8.1, 8.7, progress));
    const final = smooth(8.3, 8.9, progress);
    if (lineMaterial.current) {
      sceneColor(progress, "line", lineMaterial.current.color);
      lineMaterial.current.opacity =
        show * (0.18 - human * 0.11 - final * 0.08);
    }
    if (pointMaterial.current) {
      sceneColor(progress, "line", pointMaterial.current.color);
      pointMaterial.current.opacity =
        show * (0.57 - human * 0.35 - final * 0.3);
    }
  });
  return (
    <group ref={group}>
      <lineSegments geometry={lines}>
        <lineBasicMaterial
          ref={lineMaterial}
          color="#9dc8d7"
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </lineSegments>
      <points geometry={nodes}>
        <pointsMaterial
          ref={pointMaterial}
          color="#c2d9e4"
          size={mobile ? 0.023 : 0.017}
          transparent
          opacity={0.57}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

function Enterprise({ progress, mobile, elapsed }: ChapterProps) {
  const packets = useRef<THREE.InstancedMesh>(null);
  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const ports = mobile ? 4 : 7;
  useFrame(() => {
    if (!packets.current || sceneEnvelope(progress, 3) < 0.001) return;
    for (let i = 0; i < 9; i++) {
      const t = (elapsed.current * 0.1 + i / 9) % 1;
      const x = -1.52 + t * 3.04;
      const y = -1.18 + (i % 3) * 0.5;
      matrix.makeTranslation(x, y, 0.84 - Math.floor(i / 3) * 0.44);
      packets.current.setMatrixAt(i, matrix);
    }
    packets.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <SceneStage chapter={3} progress={progress} rotation={[0.08, -0.33, 0]}>
      {Array.from({ length: 6 }, (_, index) => {
        const x = ((index % 3) - 1) * 1.05;
        const z = (Math.floor(index / 3) - 0.5) * 0.95;
        return (
          <group key={index} position={[x, 0, z]}>
            <mesh position={[0, 0, -0.06]}>
              <boxGeometry args={[0.71, 2.47, 0.22]} />
              <meshStandardMaterial
                color="#15222b"
                metalness={0.62}
                roughness={0.43}
                transparent
                opacity={0.7}
              />
            </mesh>
            <WireBox size={[0.76, 2.52, 0.27]} color="#77949e" opacity={0.52} />
            {Array.from({ length: ports }, (_, slot) => (
              <group
                key={slot}
                position={[0, -0.89 + (slot * 1.78) / (ports - 1), 0.095]}
              >
                <mesh>
                  <boxGeometry args={[0.59, 0.13, 0.1]} />
                  <meshStandardMaterial
                    color="#4a6470"
                    metalness={0.85}
                    roughness={0.34}
                  />
                </mesh>
                <mesh position={[-0.22, 0, 0.057]}>
                  <boxGeometry args={[0.024, 0.024, 0.012]} />
                  <meshBasicMaterial
                    color={slot % 3 === 0 ? "#d9d2af" : "#9dd2d8"}
                  />
                </mesh>
                <Path
                  points={[
                    [-0.14, 0, 0.06],
                    [0.2, 0, 0.06],
                  ]}
                  color="#92acb4"
                  opacity={0.46}
                />
              </group>
            ))}
          </group>
        );
      })}
      {[-1.16, -0.64, -0.12].map((y, index) => (
        <Path
          key={y}
          points={[
            [-1.6, y, 0.85 - index * 0.43],
            [1.6, y, 0.85 - index * 0.43],
            [1.6, y, -0.72],
          ]}
          color="#9dccd0"
          opacity={0.44}
        />
      ))}
      <mesh position={[0, -1.36, 0]}>
        <boxGeometry args={[3.55, 0.035, 1.65]} />
        <meshStandardMaterial
          color="#24313b"
          metalness={0.74}
          roughness={0.38}
          transparent
          opacity={0.68}
        />
      </mesh>
      <group position={[0, -1.36, 0]}>
        <WireBox size={[3.55, 0.035, 1.65]} color="#6d8e9c" opacity={0.45} />
      </group>
      <instancedMesh ref={packets} args={[undefined, undefined, 9]}>
        <sphereGeometry args={[0.025, 8, 6]} />
        <meshBasicMaterial color="#dcf8f0" />
      </instancedMesh>
    </SceneStage>
  );
}

function Research({ progress, structure, mobile }: ChapterProps) {
  const columns = mobile ? 42 : 72;
  const rows = mobile ? 10 : 18;
  const geometry = useMemo(
    () => mathematicalSurfaceGeometry(columns, rows),
    [columns, rows],
  );
  useEffect(() => {
    updateMathematicalSurface(geometry, structure, columns, rows);
  }, [geometry, structure, columns, rows]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <SceneStage chapter={4} progress={progress} rotation={[0.23, -0.25, -0.1]}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color="#9990b2"
          metalness={0.75}
          roughness={0.29}
          clearcoat={0.28}
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh geometry={geometry} scale={1.003}>
        <meshBasicMaterial
          color="#d4c5eb"
          wireframe
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>
      <Path
        points={[
          [-1.94, -1.69, -0.2],
          [1.94, -1.69, -0.2],
        ]}
        color="#d1bfdc"
        opacity={0.32}
      />
      <Path
        points={[
          [-1.94, -1.69, -0.2],
          [-1.94, 1.5, -0.2],
        ]}
        color="#d1bfdc"
        opacity={0.21}
      />
      <Path
        points={[
          [-1.94, -1.69, -0.2],
          [-1.94, -1.69, 1.0],
        ]}
        color="#d1bfdc"
        opacity={0.21}
      />
      {Array.from({ length: 13 }, (_, index) => (
        <Path
          key={index}
          points={[
            [-1.8 + index * 0.3, -1.69, -0.2],
            [-1.8 + index * 0.3, -1.65, -0.2],
          ]}
          color="#d1bfdc"
          opacity={0.5}
        />
      ))}
      <mesh position={[0, 0, -0.75]} rotation={[0.38, 0.3, 0.15]}>
        <torusGeometry args={[1.85, 0.006, 5, 120, Math.PI * 1.5]} />
        <meshBasicMaterial color="#ada1c2" transparent opacity={0.3} />
      </mesh>
    </SceneStage>
  );
}

function QualityColumns({ progress, elapsed }: ChapterProps) {
  const scanning = useRef<THREE.Group>(null);
  useFrame(() => {
    if (scanning.current && sceneEnvelope(progress, 5) > 0.001)
      scanning.current.position.y =
        -0.62 + Math.sin(elapsed.current * 0.22) * 0.54;
  });
  return (
    <SceneStage chapter={5} progress={progress} rotation={[0.12, -0.42, 0]}>
      {Array.from({ length: 15 }, (_, index) => {
        const column = index % 5;
        const row = Math.floor(index / 5);
        const height = 1.3 + column * 0.22 + row * 0.14;
        return (
          <group
            key={index}
            position={[
              (column - 2) * 0.6,
              -1.42 + height / 2,
              (row - 1) * 0.58,
            ]}
          >
            <mesh>
              <boxGeometry args={[0.29, height, 0.29]} />
              <meshPhysicalMaterial
                color={index % 4 === 0 ? "#668b7a" : "#9bb9aa"}
                metalness={0.22}
                roughness={0.28}
                transparent
                opacity={0.28}
                clearcoat={0.5}
              />
            </mesh>
            <WireBox size={[0.3, height, 0.3]} color="#b1d7c5" opacity={0.43} />
            <mesh position={[0, height / 2, 0]}>
              <boxGeometry args={[0.31, 0.018, 0.31]} />
              <meshStandardMaterial
                color="#d4e4d5"
                metalness={0.45}
                roughness={0.35}
              />
            </mesh>
            {[0.3, 0.6, 0.9].map((fraction) => (
              <Path
                key={fraction}
                points={[
                  [-0.15, -height / 2 + height * fraction, 0.151],
                  [0.15, -height / 2 + height * fraction, 0.151],
                ]}
                color="#d1e7d8"
                opacity={0.38}
              />
            ))}
          </group>
        );
      })}
      <mesh position={[0, -1.46, 0]}>
        <boxGeometry args={[3.22, 0.045, 1.74]} />
        <meshStandardMaterial
          color="#53675f"
          roughness={0.4}
          metalness={0.55}
        />
      </mesh>
      <group position={[0, -1.46, 0]}>
        <WireBox size={[3.22, 0.045, 1.74]} color="#bed6c6" opacity={0.38} />
      </group>
      <group ref={scanning}>
        <Path
          points={[
            [-1.65, 0, -0.92],
            [-1.65, 0, 0.92],
            [1.65, 0, 0.92],
            [1.65, 0, -0.92],
          ]}
          color="#e1e4c7"
          opacity={0.65}
        />
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.3, 1.84]} />
          <meshBasicMaterial
            color="#bbd9c3"
            transparent
            opacity={0.035}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    </SceneStage>
  );
}

function ReviewAperture({
  radius = 0.64,
  color = "#c7b68e",
}: {
  radius?: number;
  color?: string;
}) {
  return (
    <group>
      <mesh>
        <torusGeometry args={[radius, 0.046, 10, 72]} />
        <meshStandardMaterial color={color} roughness={0.29} metalness={0.89} />
      </mesh>
      <mesh position={[0, 0, -0.07]}>
        <torusGeometry args={[radius + 0.1, 0.012, 6, 72]} />
        <meshStandardMaterial
          color="#91a5b1"
          roughness={0.3}
          metalness={0.86}
          transparent
          opacity={0.72}
        />
      </mesh>
      <mesh position={[0, 0, 0.015]}>
        <circleGeometry args={[radius - 0.05, 64]} />
        <meshPhysicalMaterial
          color="#8dabad"
          metalness={0.15}
          roughness={0.2}
          clearcoat={0.65}
          transparent
          opacity={0.055}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {Array.from({ length: 16 }, (_, index) => {
        const angle = (index / 16) * TAU;
        return (
          <mesh
            key={index}
            position={[
              Math.cos(angle) * (radius + 0.16),
              Math.sin(angle) * (radius + 0.16),
              0,
            ]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry args={[0.043, 0.008, 0.008]} />
            <meshBasicMaterial color="#b8c6cc" transparent opacity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

function IntelligenceChamber({ progress, mobile }: ChapterProps) {
  return (
    <SceneStage chapter={6} progress={progress} rotation={[0.075, -0.29, 0]}>
      {[-1, 1].map((side) => (
        <group key={side}>
          {[0, 1, 2].map((depth) => (
            <group
              key={depth}
              position={[side * (1.43 - depth * 0.12), 0, 0.46 - depth * 0.86]}
            >
              <mesh>
                <boxGeometry args={[0.105, 2.88 - depth * 0.2, 0.2]} />
                <meshStandardMaterial
                  color="#7e8c93"
                  metalness={0.75}
                  roughness={0.37}
                />
              </mesh>
              <Path
                points={[
                  [side * 0.065, -1.3, 0.12],
                  [side * 0.065, 1.3, 0.12],
                ]}
                color="#d4c8ad"
                opacity={0.7}
              />
              {!mobile && (
                <mesh position={[-side * 0.11, 0, -0.04]}>
                  <boxGeometry args={[0.025, 2.5, 0.4]} />
                  <meshStandardMaterial
                    color="#374a5d"
                    metalness={0.56}
                    roughness={0.49}
                  />
                </mesh>
              )}
            </group>
          ))}
        </group>
      ))}
      {[0, 1, 2].map((depth) => (
        <group
          key={depth}
          position={[0, 1.46 - depth * 0.1, 0.46 - depth * 0.86]}
        >
          <mesh>
            <boxGeometry args={[2.96 - depth * 0.24, 0.06, 0.2]} />
            <meshStandardMaterial
              color="#9c9e97"
              metalness={0.8}
              roughness={0.32}
            />
          </mesh>
        </group>
      ))}
      <group position={[0, 0.1, 0.42]}>
        <ReviewAperture radius={0.62} />
      </group>
      {Array.from({ length: 8 }, (_, index) => {
        const side = index % 2 === 0 ? -1 : 1;
        const level = Math.floor(index / 2);
        const y = 1.02 - level * 0.67;
        const x = side * 1.15;
        const z = -0.45 - (level % 2) * 0.44;
        return (
          <group key={index}>
            <group position={[x, y, z]} rotation={[0, -side * 0.25, 0]}>
              <MetalFrame
                width={0.38}
                height={0.42}
                color="#93a9b9"
                opacity={0.76}
              />
              <mesh position={[0, 0, -0.015]}>
                <planeGeometry args={[0.32, 0.36]} />
                <meshStandardMaterial
                  color="#506779"
                  transparent
                  opacity={0.21}
                  side={THREE.DoubleSide}
                />
              </mesh>
              <Path
                points={[
                  [-0.1, 0.06, 0.02],
                  [0.1, 0.06, 0.02],
                  [0.1, -0.05, 0.02],
                  [-0.04, -0.05, 0.02],
                ]}
                color="#c3d2d8"
                opacity={0.4}
              />
            </group>
            <CurvedPath
              from={[x, y, z + 0.1]}
              to={[side * 0.43, y * 0.35 + 0.1, 0.42]}
              bow={side * 0.14}
              color={level % 2 === 0 ? "#ddd0ae" : "#93b9d2"}
              opacity={0.62}
            />
          </group>
        );
      })}
      <mesh position={[0, -1.49, -0.3]}>
        <boxGeometry args={[3.16, 0.04, 2.12]} />
        <meshStandardMaterial
          color="#283a4b"
          roughness={0.53}
          metalness={0.4}
        />
      </mesh>
      {[-0.7, 0, 0.7].map((x) => (
        <Path
          key={x}
          points={[
            [x, -1.46, 1.1],
            [x, -1.46, -1.5],
          ]}
          color="#b5b5a6"
          opacity={0.32}
        />
      ))}
    </SceneStage>
  );
}

function LabSystem({ index }: { index: number }) {
  const colors = [
    "#98bcc6",
    "#baa7d1",
    "#cbb893",
    "#b2c7b4",
    "#8fa9c4",
    "#c6cbd0",
  ];
  const color = colors[index];
  if (index === 0)
    return (
      <group rotation={[0.08, -0.3, 0]}>
        {[0, 1, 2].map((layer) => (
          <group
            key={layer}
            position={[layer * 0.06, layer * 0.04, -layer * 0.18]}
          >
            <MetalFrame width={0.56} height={0.64} color={color} />
            <Path
              points={[
                [-0.16, 0.09, 0.01],
                [0.16, 0.09, 0.01],
              ]}
              color={color}
              opacity={0.8}
            />
          </group>
        ))}
      </group>
    );
  if (index === 1) {
    const points: [number, number, number][] = [
      [0, 0.36, 0],
      [-0.3, -0.2, 0.2],
      [0.3, -0.2, 0.2],
      [0, -0.17, -0.3],
    ];
    return (
      <group>
        {points.map((point, i) => (
          <group key={i}>
            <mesh position={point}>
              <sphereGeometry args={[0.045, 12, 8]} />
              <meshStandardMaterial
                color={color}
                metalness={0.55}
                roughness={0.25}
              />
            </mesh>
            {points.slice(i + 1).map((other, j) => (
              <Path
                key={j}
                points={[point, other]}
                color={color}
                opacity={0.74}
              />
            ))}
          </group>
        ))}
      </group>
    );
  }
  if (index === 2)
    return (
      <group>
        <mesh rotation={[0.2, -0.2, 0.3]}>
          <torusGeometry args={[0.31, 0.025, 8, 48, Math.PI * 1.65]} />
          <meshStandardMaterial
            color={color}
            metalness={0.82}
            roughness={0.3}
          />
        </mesh>
        {[-0.18, 0, 0.18].map((y, i) => (
          <group key={y}>
            <mesh position={[-0.14 + i * 0.1, y, 0.1]}>
              <sphereGeometry args={[0.031, 8, 6]} />
              <meshBasicMaterial color={color} />
            </mesh>
            <Path
              points={[
                [-0.14 + i * 0.1, y, 0.1],
                [0.28, y, 0.1],
              ]}
              color={color}
              opacity={0.7}
            />
          </group>
        ))}
      </group>
    );
  if (index === 3)
    return (
      <group rotation={[0.12, -0.35, -0.1]}>
        {[0, 1, 2].map((page) => (
          <group key={page} position={[page * 0.1, page * 0.07, -page * 0.1]}>
            <mesh>
              <boxGeometry args={[0.45, 0.61, 0.016]} />
              <meshStandardMaterial
                color={color}
                roughness={0.65}
                metalness={0.15}
                transparent
                opacity={0.62}
              />
            </mesh>
            {[0.1, 0, -0.1].map((y) => (
              <Path
                key={y}
                points={[
                  [-0.12, y, 0.013],
                  [0.13, y, 0.013],
                ]}
                color="#e6e7da"
                opacity={0.62}
              />
            ))}
          </group>
        ))}
      </group>
    );
  if (index === 4)
    return (
      <group rotation={[0.2, -0.15, -0.3]}>
        {[-0.25, 0, 0.25].map((x, i) => (
          <group key={x} position={[x, i % 2 === 0 ? 0.12 : -0.12, 0]}>
            <mesh>
              <torusGeometry args={[0.14, 0.022, 8, 32]} />
              <meshStandardMaterial
                color={color}
                metalness={0.87}
                roughness={0.28}
              />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.04, 10, 8]} />
              <meshBasicMaterial color="#d4e1e5" />
            </mesh>
          </group>
        ))}
        <Path
          points={[
            [-0.25, 0.12, 0],
            [0, -0.12, 0],
            [0.25, 0.12, 0],
          ]}
          color={color}
          opacity={0.8}
        />
      </group>
    );
  return (
    <group rotation={[0.36, 0.4, 0.15]}>
      <WireBox size={[0.49, 0.49, 0.49]} color={color} opacity={0.88} />
      <mesh>
        <octahedronGeometry args={[0.23]} />
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.26} />
      </mesh>
    </group>
  );
}

function SystemsLab({ progress }: ChapterProps) {
  return (
    <SceneStage chapter={7} progress={progress} rotation={[0.04, -0.12, 0]}>
      <group rotation={[0.08, 0.12, 0]}>
        <ReviewAperture radius={0.47} color="#a9b6c9" />
      </group>
      <mesh rotation={[0.15, 0, 0]} position={[0, 0, -0.25]}>
        <torusGeometry args={[1.56, 0.007, 5, 128]} />
        <meshBasicMaterial color="#a0a4bc" transparent opacity={0.31} />
      </mesh>
      {Array.from({ length: 6 }, (_, index) => {
        const angle = (index / 6) * TAU + Math.PI / 6;
        const x = Math.cos(angle) * 1.6;
        const y = Math.sin(angle) * 1.34;
        const z = Math.sin(angle) * 0.3;
        return (
          <group key={index}>
            <group position={[x, y, z]}>
              <LabSystem index={index} />
            </group>
            <CurvedPath
              from={[Math.cos(angle) * 0.57, Math.sin(angle) * 0.57, 0]}
              to={[x * 0.8, y * 0.8, z]}
              bow={index % 2 === 0 ? 0.1 : -0.1}
              color="#bcc5d3"
              opacity={0.58}
            />
            <mesh
              position={[Math.cos(angle) * 0.64, Math.sin(angle) * 0.64, 0]}
            >
              <sphereGeometry args={[0.023, 8, 6]} />
              <meshBasicMaterial color="#eee3cc" />
            </mesh>
          </group>
        );
      })}
    </SceneStage>
  );
}

function HumanArchive({ progress }: ChapterProps) {
  const poses = [
    { x: -1.1, y: 0.35, z: -0.5, w: 1.03, h: 1.36, r: -0.12 },
    { x: 0, y: 0.04, z: 0.35, w: 1.22, h: 1.62, r: 0.045 },
    { x: 1.19, y: -0.36, z: -0.35, w: 0.95, h: 1.26, r: 0.1 },
    { x: 0.85, y: 1.2, z: -1.1, w: 0.91, h: 0.74, r: -0.06 },
    { x: -0.92, y: -1.0, z: -1.2, w: 1.1, h: 0.68, r: 0.06 },
  ];
  return (
    <SceneStage chapter={8} progress={progress} rotation={[0.03, -0.12, 0]}>
      {poses.map((pose, index) => (
        <group
          key={index}
          position={[pose.x, pose.y, pose.z]}
          rotation={[0.04, index % 2 === 0 ? 0.1 : -0.1, pose.r]}
        >
          <MetalFrame
            width={pose.w}
            height={pose.h}
            color={index === 1 ? "#c5ad87" : "#8f8170"}
          />
          <mesh position={[0, 0, -0.027]}>
            <planeGeometry args={[pose.w * 0.93, pose.h * 0.95]} />
            <meshStandardMaterial
              color={index === 1 ? "#a49277" : "#716451"}
              roughness={0.96}
              transparent
              opacity={0.29}
              side={THREE.DoubleSide}
            />
          </mesh>
          <Path
            points={[
              [-pose.w * 0.35, pose.h * 0.32, 0.01],
              [-pose.w * 0.35, pose.h * 0.38, 0.01],
              [-pose.w * 0.25, pose.h * 0.38, 0.01],
            ]}
            color="#d8c5a4"
            opacity={0.52}
          />
          <Path
            points={[
              [pose.w * 0.35, -pose.h * 0.32, 0.01],
              [pose.w * 0.35, -pose.h * 0.38, 0.01],
              [pose.w * 0.25, -pose.h * 0.38, 0.01],
            ]}
            color="#d8c5a4"
            opacity={0.52}
          />
          {[-0.22, -0.27].map((fraction) => (
            <Path
              key={fraction}
              points={[
                [-pose.w * 0.22, pose.h * fraction, 0.01],
                [pose.w * 0.22, pose.h * fraction, 0.01],
              ]}
              color="#d7c2a1"
              opacity={0.33}
            />
          ))}
        </group>
      ))}
      <CurvedPath
        from={[-1.67, -1.44, 0.2]}
        to={[1.7, -1.2, -0.5]}
        bow={-0.22}
        color="#bfa782"
        opacity={0.55}
      />
      <mesh position={[0.1, -1.75, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.9, 64]} />
        <meshStandardMaterial
          color="#655b4c"
          roughness={0.95}
          transparent
          opacity={0.09}
        />
      </mesh>
    </SceneStage>
  );
}

function FinalAperture({ progress, mobile }: ChapterProps) {
  const ribbon = useMemo(
    () => ribbonGeometry(mobile ? 140 : 240, mobile ? 7 : 12),
    [mobile],
  );
  useEffect(() => () => ribbon.dispose(), [ribbon]);
  return (
    <SceneStage chapter={9} progress={progress} rotation={[0.09, -0.27, -0.12]}>
      <mesh geometry={ribbon}>
        <meshPhysicalMaterial
          color="#b69b6e"
          metalness={0.96}
          roughness={0.25}
          clearcoat={0.32}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0, -0.36]} rotation={[0.12, -0.15, -0.3]}>
        <torusGeometry args={[1.91, 0.005, 5, 128, Math.PI * 1.63]} />
        <meshBasicMaterial color="#d5c096" transparent opacity={0.36} />
      </mesh>
      <mesh position={[0, 0, -0.54]} rotation={[0, 0.72, 0.3]}>
        <torusGeometry args={[1.98, 0.005, 5, 128, Math.PI * 1.34]} />
        <meshBasicMaterial color="#94aab5" transparent opacity={0.22} />
      </mesh>
      {Array.from({ length: 6 }, (_, index) => {
        const angle = (index / 6) * TAU + 0.1;
        return (
          <group
            key={index}
            position={[Math.cos(angle) * 1.95, Math.sin(angle) * 1.95, -0.3]}
            rotation={[0, 0, angle]}
          >
            <mesh>
              <sphereGeometry args={[0.021, 8, 6]} />
              <meshBasicMaterial color="#e2c99a" />
            </mesh>
            <Path
              points={[
                [0.08, 0, 0],
                [0.22, 0, 0],
              ]}
              color="#c2a77d"
              opacity={0.4}
            />
          </group>
        );
      })}
    </SceneStage>
  );
}

export function SceneLighting({ progress }: { progress: number }) {
  const key = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.DirectionalLight>(null);
  const low = useRef<THREE.PointLight>(null);
  const ambient = useRef<THREE.AmbientLight>(null);
  useFrame(() => {
    const daylight = sceneEnvelope(progress, 5);
    if (key.current) {
      sceneColor(progress, "key", key.current.color);
      key.current.intensity = 3.7 + daylight * 0.9;
    }
    if (fill.current) {
      sceneColor(progress, "fill", fill.current.color);
      fill.current.intensity = 3.2 - daylight * 0.6;
    }
    if (low.current) {
      sceneColor(progress, "line", low.current.color);
      low.current.intensity = 15 + daylight * 5;
    }
    if (ambient.current) ambient.current.intensity = 0.32 + daylight * 0.2;
  });
  return (
    <>
      <ambientLight ref={ambient} intensity={0.32} color="#c4cddd" />
      <directionalLight
        ref={key}
        position={[-4, 6, 5]}
        color="#ffedd2"
        intensity={3.7}
      />
      <directionalLight
        ref={fill}
        position={[5, 0, -2]}
        color="#80b9de"
        intensity={3.2}
      />
      <pointLight
        ref={low}
        position={[2, -3, 4]}
        intensity={18}
        color="#dca76d"
        distance={15}
        decay={2}
      />
    </>
  );
}

export default function ChapterStructures(props: ChapterProps) {
  return (
    <>
      <JourneyLattice
        progress={props.progress}
        structure={props.structure}
        mobile={props.mobile}
      />
      <Enterprise {...props} />
      <Research {...props} />
      <QualityColumns {...props} />
      <IntelligenceChamber {...props} />
      <SystemsLab {...props} />
      <HumanArchive {...props} />
      <FinalAperture {...props} />
    </>
  );
}
