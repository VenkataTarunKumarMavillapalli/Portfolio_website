import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import {
  Canvas,
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import * as THREE from "three";
import {
  associationArc,
  clamp,
  coastlineGeometry,
  dustGeometry,
  frameGeometry,
  geographicPoint,
  landPointGeometry,
  latitudeGeometry,
  lerp,
  lineSegmentsFromPoints,
  morphFrame,
  ribbonEdge,
  ribbonGeometry,
  smooth,
  TAU,
} from "./geometry";
import { LOCATION_POINTS } from "./locations";
import ChapterStructures, { SceneLighting } from "./ChapterStructures";
import { cameraDistance, sceneColor } from "./journeyGeometry";

export { LOCATION_POINTS } from "./locations";

export interface SceneWorldProps {
  /** Continuous, reversible chapter position. Prologue is 0. */
  progress: number;
  motionEnabled: boolean;
  selectedLocation: string;
  onSelectLocation: (id: string) => void;
  structure: number;
  onReady: () => void;
  onError: () => void;
  /** Additive radians for accessible HTML rotation controls. */
  globeRotation?: number;
}

class SceneBoundary extends Component<
  PropsWithChildren<{ onError: () => void }>,
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** A bundled procedural studio provides broad, controlled reflections on the metal. */
function StudioEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const studio = new THREE.Scene();
    studio.background = new THREE.Color("#111418");
    const panelGeometry = new THREE.PlaneGeometry(1, 1);
    const materials: THREE.MeshBasicMaterial[] = [];
    const addPanel = (
      color: string,
      intensity: number,
      position: [number, number, number],
      scale: [number, number, number],
    ) => {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).multiplyScalar(intensity),
        side: THREE.DoubleSide,
      });
      materials.push(material);
      const mesh = new THREE.Mesh(panelGeometry, material);
      mesh.position.set(...position);
      mesh.scale.set(...scale);
      mesh.lookAt(0, 0, 0);
      studio.add(mesh);
    };
    addPanel("#fff2da", 6, [-4, 5, 3], [2.5, 7, 1]);
    addPanel("#bfd6e7", 3.5, [5, 1, -1], [1.1, 7, 1]);
    addPanel("#ffffff", 2.5, [0, 6, -3], [7, 1.2, 1]);
    addPanel("#bb7943", 1.7, [-4, -2, -4], [4, 2, 1]);
    const pmrem = new THREE.PMREMGenerator(gl);
    const target = pmrem.fromScene(studio, 0.06, 0.1, 40);
    const previous = scene.environment;
    scene.environment = target.texture;
    pmrem.dispose();
    panelGeometry.dispose();
    materials.forEach((material) => material.dispose());
    return () => {
      scene.environment = previous;
      target.dispose();
    };
  }, [gl, scene]);
  return null;
}

const backdropVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 1.0, 1.0);
  }
`;
const backdropFragment = `
  varying vec2 vUv;
  uniform float uOcean;
  uniform float uArchive;
  uniform float uMobile;
  uniform float uExtended;
  uniform vec3 uExtendedTint;
  void main() {
    vec2 center = mix(vec2(0.72, 0.52), vec2(0.5, 0.73), uMobile);
    vec2 q = (vUv - center) * vec2(mix(1.15, 0.7, uMobile), 1.0);
    float halo = exp(-dot(q, q) * 12.0);
    float inner = exp(-dot(q, q) * 35.0);
    vec3 warm = vec3(0.073, 0.052, 0.032);
    vec3 ocean = vec3(0.018, 0.052, 0.078);
    vec3 tint = mix(mix(warm, ocean, uOcean), uExtendedTint, uExtended);
    vec3 base = vec3(0.016, 0.021, 0.026);
    vec3 color = base + tint * halo * (0.7 + uArchive * 0.65) + tint * inner * 0.27;
    float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    color += (grain - 0.5) * 0.003;
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function Backdrop({ progress, mobile }: { progress: number; mobile: boolean }) {
  const uniforms = useMemo(
    () => ({
      uOcean: { value: 0 },
      uArchive: { value: 0 },
      uMobile: { value: 0 },
      uExtended: { value: 0 },
      uExtendedTint: { value: new THREE.Color("#123648") },
    }),
    [],
  );
  useFrame(() => {
    uniforms.uOcean.value = smooth(1.15, 1.92, progress);
    uniforms.uArchive.value =
      smooth(0.5, 1, progress) * (1 - smooth(1.15, 1.9, progress));
    uniforms.uMobile.value = mobile ? 1 : 0;
    uniforms.uExtended.value = smooth(2.05, 2.8, progress);
    sceneColor(progress, "glow", uniforms.uExtendedTint.value);
  });
  return (
    <mesh renderOrder={-1000} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={backdropVertex}
        fragmentShader={backdropFragment}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

function Aperture({
  progress,
  elapsed,
  mobile,
}: {
  progress: number;
  elapsed: React.RefObject<number>;
  mobile: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const metal = useRef<THREE.MeshPhysicalMaterial>(null);
  const outlines = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const detail = useRef<THREE.LineBasicMaterial>(null);
  const orbit = useRef<THREE.MeshBasicMaterial>(null);
  const ribbon = useMemo(
    () => ribbonGeometry(mobile ? 140 : 240, mobile ? 7 : 12),
    [mobile],
  );
  const edges = useMemo(() => [ribbonEdge(-1), ribbonEdge(1)], []);
  const arc = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 180; i++) {
      const t = (i / 180) * Math.PI * 1.48 - 0.64;
      points.push(
        new THREE.Vector3(Math.cos(t) * 2.01, Math.sin(t) * 2.01, -0.26),
      );
    }
    return lineSegmentsFromPoints(points);
  }, []);
  useEffect(
    () => () => {
      ribbon.dispose();
    },
    [ribbon],
  );
  useEffect(
    () => () => {
      edges.forEach((edge) => edge.dispose());
      arc.dispose();
    },
    [edges, arc],
  );
  useFrame(() => {
    if (!group.current) return;
    const depart = smooth(0.12, 0.94, progress);
    const opacity = 1 - smooth(0.47, 0.91, progress);
    group.current.visible = opacity > 0.002;
    group.current.position.z = depart * 4.4;
    group.current.scale.setScalar(lerp(1, 2.7, depart));
    group.current.rotation.set(
      lerp(0.16, 0, depart),
      lerp(-0.36, 0.04, depart) + Math.sin(elapsed.current * 0.14) * 0.035,
      -0.17 + depart * 0.2,
    );
    if (metal.current) metal.current.opacity = opacity;
    outlines.current.forEach((outline) => {
      if (outline) outline.opacity = opacity * 0.7;
    });
    if (detail.current) detail.current.opacity = opacity * 0.24;
    if (orbit.current) orbit.current.opacity = opacity * 0.22;
  });
  return (
    <group ref={group}>
      <mesh geometry={ribbon}>
        <meshPhysicalMaterial
          ref={metal}
          color="#b99a66"
          metalness={0.96}
          roughness={0.27}
          clearcoat={0.22}
          clearcoatRoughness={0.24}
          side={THREE.DoubleSide}
          transparent
          envMapIntensity={1.15}
        />
      </mesh>
      {edges.map((edge, index) => (
        <lineSegments key={index} geometry={edge}>
          <lineBasicMaterial
            ref={(material) => {
              outlines.current[index] = material;
            }}
            color="#e2c291"
            transparent
            opacity={0.5}
          />
        </lineSegments>
      ))}
      <lineSegments geometry={arc}>
        <lineBasicMaterial
          ref={detail}
          color="#c3ad8b"
          transparent
          opacity={0.22}
        />
      </lineSegments>
      <mesh rotation={[Math.PI / 2 + 0.23, 0.1, 0]} position={[0, 0, -0.38]}>
        <torusGeometry args={[1.95, 0.006, 5, 120, Math.PI * 1.55]} />
        <meshBasicMaterial
          ref={orbit}
          color="#8b7859"
          transparent
          opacity={0.22}
        />
      </mesh>
    </group>
  );
}

const FRAME_POSES = [
  {
    position: [-1.12, 0.39, -0.85],
    rotation: [-0.08, 0.18, -0.11],
    width: 1.24,
    height: 1.7,
  },
  {
    position: [-0.39, -0.57, 0.65],
    rotation: [0.04, -0.14, 0.055],
    width: 1.13,
    height: 1.47,
  },
  {
    position: [0.56, 0.52, 0.25],
    rotation: [0.07, -0.22, 0.045],
    width: 1.23,
    height: 1.78,
  },
  {
    position: [1.3, -0.46, -0.8],
    rotation: [-0.1, -0.3, 0.12],
    width: 1.12,
    height: 1.46,
  },
  {
    position: [-0.08, 1.34, -1.75],
    rotation: [0.14, 0.16, -0.09],
    width: 1.0,
    height: 1.28,
  },
  {
    position: [1.27, 1.05, -2.0],
    rotation: [0.08, -0.3, 0.15],
    width: 1.12,
    height: 1.48,
  },
];

function ArchiveFrame({
  index,
  progress,
}: {
  index: number;
  progress: number;
}) {
  const pose = FRAME_POSES[index];
  const group = useRef<THREE.Group>(null);
  const paper = useRef<THREE.Group>(null);
  const metal = useRef<THREE.MeshStandardMaterial>(null);
  const backing = useRef<THREE.MeshStandardMaterial>(null);
  const etching = useRef<THREE.LineBasicMaterial>(null);
  const frame = useMemo(() => frameGeometry(), []);
  const frameColors = useMemo(
    () => [new THREE.Color("#b79a6d"), new THREE.Color("#6392a8")],
    [],
  );
  const lastMorph = useRef({ shape: -1, width: 0, height: 0 });
  const marks = useMemo(() => {
    const coordinates: number[] = [];
    const w = pose.width * 0.38;
    const h = pose.height * 0.39;
    // Abstract archival markings, deliberately not personal photographs.
    for (let row = 0; row < 6; row++) {
      const y = -h * 0.9 + row * 0.045;
      coordinates.push(
        -w * 0.78,
        y,
        0.013,
        w * (row % 3 === 0 ? 0.62 : 0.2),
        y,
        0.013,
      );
    }
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * TAU;
      const b = ((i + 1) / 64) * TAU;
      coordinates.push(
        Math.cos(a) * w * 0.58,
        Math.sin(a) * w * 0.58 + h * 0.22,
        0.013,
        Math.cos(b) * w * 0.58,
        Math.sin(b) * w * 0.58 + h * 0.22,
        0.013,
      );
    }
    coordinates.push(-w * 0.8, h * 0.83, 0.013, -w * 0.4, h * 0.83, 0.013);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(coordinates, 3),
    );
    return geometry;
  }, [pose]);
  useEffect(
    () => () => {
      frame.dispose();
      marks.dispose();
    },
    [frame, marks],
  );
  useFrame(() => {
    if (!group.current) return;
    const arrive = smooth(0.43, 1.0, progress);
    const morph = smooth(1.1, 1.94, progress);
    const engineering = smooth(2.08, 2.86, progress);
    const departing = 1 - smooth(3.14, 3.73, progress);
    const shape = morph * (1 - engineering);
    const width = lerp(pose.width, 0.76, engineering);
    const height = lerp(pose.height, 2.52, engineering);
    const paperOpacity = arrive * (1 - smooth(1.08, 1.54, progress));
    if (
      lastMorph.current.shape !== shape ||
      lastMorph.current.width !== width ||
      lastMorph.current.height !== height
    ) {
      morphFrame(frame, shape, width, height);
      lastMorph.current = { shape, width, height };
    }
    group.current.visible = arrive * departing > 0.002;
    group.current.position.set(
      lerp(pose.position[0], 0, morph) + ((index % 3) - 1) * 1.05 * engineering,
      lerp(pose.position[1], 0, morph),
      lerp(pose.position[2], 0, morph) +
        (Math.floor(index / 3) - 0.5) * 0.95 * engineering,
    );
    group.current.rotation.set(
      lerp(pose.rotation[0], 0, morph),
      lerp(pose.rotation[1], (index * Math.PI) / 6, morph) * (1 - engineering),
      lerp(pose.rotation[2], 0, morph),
    );
    if (metal.current) {
      metal.current.opacity =
        arrive * lerp(0.97, 0.27 + engineering * 0.15, morph) * departing;
      metal.current.color.lerpColors(frameColors[0], frameColors[1], morph);
    }
    if (paper.current) paper.current.visible = paperOpacity > 0.004;
    if (backing.current) backing.current.opacity = paperOpacity * 0.53;
    if (etching.current) etching.current.opacity = paperOpacity * 0.53;
  });
  return (
    <group ref={group}>
      <mesh geometry={frame}>
        <meshStandardMaterial
          ref={metal}
          color="#b79a6d"
          roughness={0.36}
          metalness={0.86}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <group ref={paper}>
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[pose.width * 0.95, pose.height * 0.95]} />
          <meshStandardMaterial
            ref={backing}
            color={index % 2 === 0 ? "#5e4935" : "#423b32"}
            roughness={1}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        <lineSegments geometry={marks}>
          <lineBasicMaterial
            ref={etching}
            color="#c8af83"
            transparent
            depthWrite={false}
          />
        </lineSegments>
      </group>
    </group>
  );
}

const atmosphereVertex = `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;
const atmosphereFragment = `
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float fresnel = pow(1.0 - max(0.0, dot(normalize(vNormal), normalize(vView))), 4.2);
    float light = 0.38 + 0.62 * max(0.0, dot(normalize(vNormal), normalize(vec3(-1.0, 1.0, 1.0))));
    gl_FragColor = vec4(vec3(0.26, 0.56, 0.73), fresnel * light * uOpacity * 0.48);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function LocationMarker({
  location,
  selected,
  opacity,
  onSelect,
}: {
  location: (typeof LOCATION_POINTS)[number];
  selected: boolean;
  opacity: React.RefObject<number>;
  onSelect: (id: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const fill = useRef<THREE.MeshBasicMaterial>(null);
  const ring = useRef<THREE.MeshBasicMaterial>(null);
  const { gl } = useThree();
  const position = useMemo(
    () => geographicPoint(location.latitude, location.longitude, 1.746),
    [location],
  );
  const quaternion = useMemo(
    () =>
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        position.clone().normalize(),
      ),
    [position],
  );
  const pointerStart = useRef<[number, number]>([0, 0]);
  useFrame(() => {
    if (group.current) group.current.visible = opacity.current > 0.2;
    if (fill.current) fill.current.opacity = opacity.current;
    if (ring.current)
      ring.current.opacity = opacity.current * (selected ? 0.8 : 0.32);
  });
  useEffect(
    () => () => {
      gl.domElement.style.cursor = "";
    },
    [gl],
  );
  return (
    <group ref={group} position={position} quaternion={quaternion}>
      <mesh>
        <sphereGeometry args={[selected ? 0.033 : 0.022, 12, 8]} />
        <meshBasicMaterial
          ref={fill}
          color={selected ? "#ffe4ac" : "#c0d9dd"}
          transparent
        />
      </mesh>
      <mesh>
        <ringGeometry
          args={[selected ? 0.068 : 0.043, selected ? 0.075 : 0.048, 32]}
        />
        <meshBasicMaterial
          ref={ring}
          color={selected ? "#e8ba77" : "#93bdca"}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh
        onPointerOver={(event) => {
          if (opacity.current < 0.2) return;
          event.stopPropagation();
          gl.domElement.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          gl.domElement.style.cursor = "";
        }}
        onPointerDown={(event) => {
          pointerStart.current = [event.clientX, event.clientY];
        }}
        onClick={(event) => {
          if (opacity.current < 0.2) return;
          event.stopPropagation();
          if (
            Math.hypot(
              event.clientX - pointerStart.current[0],
              event.clientY - pointerStart.current[1],
            ) < 7
          )
            onSelect(location.id);
        }}
      >
        <sphereGeometry args={[0.085, 8, 6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Globe({
  progress,
  mobile,
  selectedLocation,
  onSelectLocation,
  drag,
}: {
  progress: number;
  mobile: boolean;
  selectedLocation: string;
  onSelectLocation: (id: string) => void;
  drag: React.RefObject<number>;
}) {
  const group = useRef<THREE.Group>(null);
  const sea = useRef<THREE.MeshStandardMaterial>(null);
  const land = useRef<THREE.PointsMaterial>(null);
  const coast = useRef<THREE.LineBasicMaterial>(null);
  const grid = useRef<THREE.LineBasicMaterial>(null);
  const arcMaterials = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const opacity = useRef(0);
  const coastGeometry = useMemo(() => coastlineGeometry(), []);
  const points = useMemo(() => landPointGeometry(mobile), [mobile]);
  const latitudes = useMemo(() => latitudeGeometry(), []);
  const routes = useMemo(
    () =>
      [
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 4],
        [4, 5],
        [5, 6],
      ].map(([from, to]) => ({
        from,
        to,
        geometry: associationArc(LOCATION_POINTS[from], LOCATION_POINTS[to]),
      })),
    [],
  );
  const atmosphere = useMemo(() => ({ uOpacity: { value: 0 } }), []);
  const { gl, invalidate } = useThree();
  const start = useRef<{
    x: number;
    y: number;
    rotation: number;
    id: number;
  } | null>(null);
  useEffect(
    () => () => {
      coastGeometry.dispose();
      latitudes.dispose();
      routes.forEach((route) => route.geometry.dispose());
    },
    [coastGeometry, latitudes, routes],
  );
  useEffect(
    () => () => {
      points.dispose();
    },
    [points],
  );
  useFrame(() => {
    const amount =
      smooth(1.25, 1.88, progress) * (1 - smooth(2.04, 2.7, progress));
    opacity.current = amount;
    if (group.current) group.current.visible = amount > 0.002;
    if (sea.current) sea.current.opacity = amount;
    if (land.current) land.current.opacity = amount * 0.66;
    if (coast.current) coast.current.opacity = amount * 0.72;
    if (grid.current) grid.current.opacity = amount * 0.19;
    atmosphere.uOpacity.value = amount;
    arcMaterials.current.forEach((material, i) => {
      if (!material) return;
      const route = routes[i];
      const selected =
        LOCATION_POINTS[route.from].id === selectedLocation ||
        LOCATION_POINTS[route.to].id === selectedLocation;
      material.opacity = amount * (selected ? 0.74 : 0.2);
      material.color.set(selected ? "#d7b77f" : "#6f9ca9");
    });
  });
  const release = () => {
    start.current = null;
    gl.domElement.style.cursor = "";
  };
  // Pointer listeners are passive. Native vertical touch scrolling is never intercepted.
  useEffect(() => {
    const move = (event: PointerEvent) => {
      const current = start.current;
      if (!current || current.id !== event.pointerId) return;
      const dx = event.clientX - current.x;
      const dy = event.clientY - current.y;
      if (Math.abs(dx) < Math.abs(dy) * 1.2 && event.pointerType !== "mouse")
        return;
      drag.current = current.rotation + dx * 0.006;
      invalidate();
    };
    const end = () => {
      start.current = null;
      gl.domElement.style.cursor = "";
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", end, { passive: true });
    window.addEventListener("pointercancel", end, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      gl.domElement.style.cursor = "";
    };
  }, [drag, gl, invalidate]);
  const begin = (event: ThreeEvent<PointerEvent>) => {
    if (progress < 1.8 || progress > 2.7) return;
    event.stopPropagation();
    start.current = {
      x: event.clientX,
      y: event.clientY,
      rotation: drag.current,
      id: event.pointerId,
    };
    gl.domElement.style.cursor = "grab";
  };
  return (
    <group ref={group}>
      <mesh
        onPointerDown={begin}
        onPointerUp={release}
        onClick={(event) => {
          if (opacity.current > 0.2) event.stopPropagation();
        }}
      >
        <sphereGeometry args={[1.7, mobile ? 48 : 80, mobile ? 32 : 56]} />
        <meshStandardMaterial
          ref={sea}
          color="#071621"
          metalness={0.24}
          roughness={0.66}
          transparent
          depthWrite
          envMapIntensity={0.55}
        />
      </mesh>
      <points geometry={points}>
        <pointsMaterial
          ref={land}
          size={mobile ? 0.021 : 0.016}
          color="#789fa2"
          transparent
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      <lineSegments geometry={coastGeometry}>
        <lineBasicMaterial
          ref={coast}
          color="#8ab8c3"
          transparent
          depthWrite={false}
        />
      </lineSegments>
      <lineSegments geometry={latitudes}>
        <lineBasicMaterial
          ref={grid}
          color="#6597b1"
          transparent
          depthWrite={false}
        />
      </lineSegments>
      {routes.map((route, index) => (
        <lineSegments key={index} geometry={route.geometry}>
          <lineBasicMaterial
            ref={(material) => {
              arcMaterials.current[index] = material;
            }}
            color="#d7b77f"
            transparent
            depthWrite={false}
          />
        </lineSegments>
      ))}
      {LOCATION_POINTS.map((location) => (
        <LocationMarker
          key={location.id}
          location={location}
          selected={selectedLocation === location.id}
          opacity={opacity}
          onSelect={onSelectLocation}
        />
      ))}
      <mesh raycast={() => {}} scale={1.035}>
        <sphereGeometry args={[1.7, mobile ? 40 : 64, mobile ? 28 : 48]} />
        <shaderMaterial
          vertexShader={atmosphereVertex}
          fragmentShader={atmosphereFragment}
          uniforms={atmosphere}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function World(props: SceneWorldProps) {
  const {
    progress,
    motionEnabled,
    selectedLocation,
    onSelectLocation,
    globeRotation = 0,
    onReady,
    onError,
    structure,
  } = props;
  const { size, gl, camera, invalidate } = useThree();
  const mobile = size.width < 760;
  const p = motionEnabled
    ? clamp(progress, 0, 9)
    : Math.round(clamp(progress, 0, 9));
  const root = useRef<THREE.Group>(null);
  const archive = useRef<THREE.Group>(null);
  const dust = useRef<THREE.Points>(null);
  const elapsed = useRef(0);
  const ready = useRef(false);
  const drag = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const angle = useRef(-0.85);
  const selected = LOCATION_POINTS.find(
    (location) => location.id === selectedLocation,
  );
  const targetAngle = selected
    ? -THREE.MathUtils.degToRad(selected.longitude)
    : -0.85;
  const particles = useMemo(() => dustGeometry(mobile ? 42 : 95), [mobile]);
  useEffect(
    () => () => {
      particles.dispose();
    },
    [particles],
  );

  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onError();
    };
    const previousShaderError = gl.debug.onShaderError;
    gl.debug.onShaderError = () => {
      queueMicrotask(onError);
    };
    canvas.addEventListener("webglcontextlost", lost, false);
    return () => {
      canvas.removeEventListener("webglcontextlost", lost, false);
      gl.debug.onShaderError = previousShaderError;
    };
  }, [gl, onError]);

  useEffect(() => {
    // Demand mode only receives a capped ambient heartbeat while visible and enabled.
    // Static / reduced-motion poses have no recurring animation work.
    let timer: ReturnType<typeof setInterval> | undefined;
    const update = () => {
      if (timer) clearInterval(timer);
      if (motionEnabled && !document.hidden)
        timer = setInterval(invalidate, 1000 / (mobile ? 24 : 30));
      invalidate();
    };
    update();
    document.addEventListener("visibilitychange", update);
    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, [invalidate, mobile, motionEnabled]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (!motionEnabled || event.pointerType !== "mouse") return;
      pointer.current.x = (event.clientX / size.width - 0.5) * 2;
      pointer.current.y = -(event.clientY / size.height - 0.5) * 2;
      invalidate();
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [invalidate, motionEnabled, size.width, size.height]);

  useEffect(() => {
    invalidate();
  }, [invalidate, p, selectedLocation, globeRotation, structure]);
  useFrame((_state, delta) => {
    if (!ready.current) {
      ready.current = true;
      onReady();
    }
    const dt = Math.min(delta, 0.08);
    if (motionEnabled) elapsed.current += dt;
    const morph = smooth(1.1, 1.94, p);
    const engineering = smooth(2.08, 2.86, p);
    angle.current = motionEnabled
      ? THREE.MathUtils.damp(
          angle.current,
          targetAngle + globeRotation + drag.current,
          5,
          dt,
        )
      : targetAngle + globeRotation + drag.current;
    if (root.current) {
      root.current.position.set(mobile ? 0 : 1.84, mobile ? 1.7 : 0.02, 0);
      root.current.scale.setScalar(mobile ? 0.75 : 1);
      const parallax = motionEnabled ? 1 : 0;
      root.current.rotation.x = pointer.current.y * 0.035 * parallax;
      root.current.rotation.y = pointer.current.x * 0.045 * parallax;
    }
    if (archive.current) {
      archive.current.position.z = lerp(-4.0, 0, smooth(0.4, 1, p));
      archive.current.rotation.set(
        lerp(lerp(-0.025, 0.14, morph), 0.08, engineering),
        lerp(lerp(0.06, angle.current, morph), -0.33, engineering),
        lerp(-0.025, -0.05, morph) * (1 - engineering),
      );
    }
    if (dust.current) {
      dust.current.rotation.z = motionEnabled
        ? Math.sin(elapsed.current * 0.016) * 0.025
        : 0;
    }
    const perspective = camera as THREE.PerspectiveCamera;
    perspective.fov = mobile ? 42 : 36;
    perspective.position.set(0, 0, cameraDistance(p, mobile));
    perspective.lookAt(0, 0, 0);
    perspective.updateProjectionMatrix();
  });

  return (
    <>
      <Backdrop progress={p} mobile={mobile} />
      <StudioEnvironment />
      <SceneLighting progress={p} />
      <points ref={dust} geometry={particles} raycast={() => {}}>
        <pointsMaterial
          size={mobile ? 0.015 : 0.01}
          color="#b9b1a0"
          transparent
          opacity={0.32}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      <group ref={root}>
        <Aperture progress={p} elapsed={elapsed} mobile={mobile} />
        <group ref={archive}>
          {FRAME_POSES.map((_pose, index) => (
            <ArchiveFrame key={index} index={index} progress={p} />
          ))}
          <Globe
            progress={p}
            mobile={mobile}
            selectedLocation={selectedLocation}
            onSelectLocation={onSelectLocation}
            drag={drag}
          />
        </group>
        <ChapterStructures
          key={mobile ? "mobile" : "desktop"}
          progress={p}
          mobile={mobile}
          elapsed={elapsed}
          structure={clamp(structure)}
        />
      </group>
    </>
  );
}

export default function SceneWorld(props: SceneWorldProps) {
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 760,
  );
  useEffect(() => {
    const query = window.matchMedia("(max-width: 759px)");
    const changed = () => setMobile(query.matches);
    query.addEventListener("change", changed);
    return () => query.removeEventListener("change", changed);
  }, []);
  return (
    <SceneBoundary onError={props.onError}>
      <Canvas
        aria-hidden="true"
        frameloop="demand"
        dpr={[1, mobile ? 1.25 : 1.6]}
        camera={{ position: [0, 0, 8.7], fov: 36, near: 0.1, far: 80 }}
        gl={{
          antialias: !mobile,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
        }}
        style={{ width: "100%", height: "100%", touchAction: "pan-y" }}
        fallback={
          <span>
            Interactive artwork is unavailable. The complete story remains
            accessible.
          </span>
        }
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.16;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <World {...props} />
      </Canvas>
    </SceneBoundary>
  );
}
