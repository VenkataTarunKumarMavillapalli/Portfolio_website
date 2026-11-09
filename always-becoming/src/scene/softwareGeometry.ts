import * as THREE from "three";
import { frameGeometry, morphFrame, ribbonGeometry, TAU } from "./geometry";

export type Point3 = [number, number, number];
export interface SoftwareMesh {
  geometry: THREE.BufferGeometry;
  position?: Point3;
  rotation?: Point3;
  scale?: Point3;
  color: Point3;
  opacity?: number;
  metallic?: number;
  wire?: boolean;
  matrix?: THREE.Matrix4;
}
export const FRAME_POSES = [
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
] as const;

/** The renderer needs no GPU. Three is used only for the shared procedural geometry and matrix math. */
export function createSoftwareAssets() {
  const frames = FRAME_POSES.map((pose) => {
    const geometry = frameGeometry(20);
    morphFrame(geometry, 0, pose.width, pose.height, 20);
    return geometry;
  });
  const assets = {
    ribbon: ribbonGeometry(80, 4),
    research: ribbonGeometry(80, 4),
    sphere: new THREE.SphereGeometry(1.7, 24, 12),
    box: new THREE.BoxGeometry(1, 1, 1),
    plane: new THREE.PlaneGeometry(1, 1),
    ring: new THREE.TorusGeometry(1, 0.027, 4, 36),
    frames,
  };
  return {
    ...assets,
    dispose() {
      [
        assets.ribbon,
        assets.research,
        assets.sphere,
        assets.box,
        assets.plane,
        assets.ring,
        ...frames,
      ].forEach((geometry) => geometry.dispose());
    },
  };
}
export type SoftwareAssets = ReturnType<typeof createSoftwareAssets>;

/** A finite perspective mapping. Front is positive Z; camera is seven world units away. */
export function projectSoftwarePoint(
  point: Point3,
  cx: number,
  cy: number,
  unit: number,
): Point3 {
  const perspective = 7 / Math.max(0.4, 7 - point[2]);
  return [
    cx + point[0] * unit * perspective,
    cy - point[1] * unit * perspective,
    point[2],
  ];
}
export function softwareMatrix(
  position: Point3 = [0, 0, 0],
  rotation: Point3 = [0, 0, 0],
  scale: Point3 = [1, 1, 1],
) {
  return new THREE.Matrix4().compose(
    new THREE.Vector3(...position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
    new THREE.Vector3(...scale),
  );
}
export function circlePoints(radius: number, y = 0, count = 48): Point3[] {
  return Array.from({ length: count + 1 }, (_, i) => [
    Math.cos((i / count) * TAU) * radius,
    y,
    Math.sin((i / count) * TAU) * radius,
  ]);
}
