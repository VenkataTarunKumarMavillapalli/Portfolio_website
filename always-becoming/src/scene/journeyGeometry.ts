import * as THREE from "three";
import { clamp, lerp, smooth, TAU } from "./geometry";

export const JOURNEY_COLUMNS = 14;
export const JOURNEY_ROWS = 12;
export const JOURNEY_POINT_COUNT = JOURNEY_COLUMNS * JOURNEY_ROWS;

export const SCENE_PALETTES = [
  {
    glow: "#4e3420",
    metal: "#b99a66",
    line: "#d0b88f",
    key: "#ffedd2",
    fill: "#80b9de",
  },
  {
    glow: "#624322",
    metal: "#b79a6d",
    line: "#c8af83",
    key: "#ffe6bf",
    fill: "#b7bbc1",
  },
  {
    glow: "#123648",
    metal: "#6392a8",
    line: "#8ab8c3",
    key: "#d5eff5",
    fill: "#5495bc",
  },
  {
    glow: "#1a3540",
    metal: "#526c76",
    line: "#84c2ce",
    key: "#d4eff3",
    fill: "#468399",
  },
  {
    glow: "#402945",
    metal: "#a6a2ba",
    line: "#bea9df",
    key: "#f1e5ff",
    fill: "#a081c8",
  },
  {
    glow: "#2a4038",
    metal: "#93b7a7",
    line: "#b8d8c9",
    key: "#eff8ee",
    fill: "#739f97",
  },
  {
    glow: "#192e46",
    metal: "#b7b8ae",
    line: "#d1c4a3",
    key: "#f5f0dd",
    fill: "#638aac",
  },
  {
    glow: "#29344a",
    metal: "#8d9eb8",
    line: "#adc2dc",
    key: "#e2edfa",
    fill: "#8d8dbf",
  },
  {
    glow: "#4a3829",
    metal: "#b69c7b",
    line: "#d9c5a7",
    key: "#fff0d8",
    fill: "#bba88d",
  },
  {
    glow: "#3d2f20",
    metal: "#baa071",
    line: "#d7bc88",
    key: "#fff0d3",
    fill: "#8b9faf",
  },
] as const;

export function sceneEnvelope(progress: number, chapter: number) {
  const enter = smooth(chapter - 0.78, chapter - 0.12, progress);
  const leave =
    chapter === 9 ? 1 : 1 - smooth(chapter + 0.14, chapter + 0.83, progress);
  return enter * leave;
}

/** Pure, deterministic coordinates shared by WebGL, tests and optional software art. */
export function mathematicalSurfacePoint(
  u: number,
  v: number,
  structure = 0.5,
): [number, number, number] {
  const parameter = clamp(structure);
  const theta = (u * 1.78 - 0.89) * Math.PI;
  const across = (v - 0.5) * 1.1;
  const twist = theta * (0.52 + parameter * 0.9);
  const radius = 1.25 + across * Math.cos(twist);
  return [
    Math.cos(theta) * radius,
    Math.sin(theta) * radius * 1.05,
    across * Math.sin(twist) + 0.32 * Math.sin(theta * 2) * (0.4 + parameter),
  ];
}

export function chapterLatticePoint(
  index: number,
  chapter: number,
  structure = 0.5,
): [number, number, number] {
  const column = index % JOURNEY_COLUMNS;
  const row = Math.floor(index / JOURNEY_COLUMNS);
  const u = column / (JOURNEY_COLUMNS - 1);
  const v = row / (JOURNEY_ROWS - 1);
  if (chapter <= 2) {
    const latitude = (v - 0.5) * Math.PI * 0.88;
    const longitude = u * TAU;
    return [
      Math.sin(longitude) * Math.cos(latitude) * 1.74,
      Math.sin(latitude) * 1.74,
      Math.cos(longitude) * Math.cos(latitude) * 1.74,
    ];
  }
  if (chapter === 3)
    return [(u - 0.5) * 3.2, (v - 0.5) * 2.55, ((column % 3) - 1) * 0.48];
  if (chapter === 4) return mathematicalSurfacePoint(u, v, structure);
  if (chapter === 5) {
    const height = 1.3 + (column % 5) * 0.22 + Math.floor(column / 5) * 0.14;
    return [
      ((column % 5) - 2) * 0.6,
      -1.42 + v * height,
      (Math.floor(column / 5) - 1) * 0.58,
    ];
  }
  if (chapter === 6) {
    const theta = u * Math.PI * 1.65 + Math.PI * 0.18;
    return [
      Math.cos(theta) * 1.69,
      (v - 0.5) * 2.8,
      Math.sin(theta) * 1.2 - 0.25,
    ];
  }
  if (chapter === 7) {
    const system = Math.floor(index / 28);
    const theta = (system / 6) * TAU + Math.PI / 6;
    const local = ((index % 28) / 28) * TAU;
    return [
      Math.cos(theta) * 1.6 + Math.cos(local) * 0.31,
      Math.sin(theta) * 1.34 + Math.sin(local) * 0.31,
      Math.sin(theta) * 0.3 + Math.sin(local * 2) * 0.12,
    ];
  }
  if (chapter === 8) {
    const frame = Math.floor(index / 28);
    const theta = ((index % 28) / 28) * TAU;
    const x =
      Math.sign(Math.cos(theta)) *
      Math.pow(Math.abs(Math.cos(theta)), 0.2) *
      0.46;
    const y =
      Math.sign(Math.sin(theta)) *
      Math.pow(Math.abs(Math.sin(theta)), 0.2) *
      0.65;
    return [
      x + ((frame % 3) - 1) * 1.05,
      y + (Math.floor(frame / 3) - 0.5) * 1.23,
      -0.2 - (frame % 3) * 0.32,
    ];
  }
  const theta = u * TAU * 1.055 - 0.35;
  const offset = (v - 0.5) * 0.66;
  const radius =
    1.43 +
    0.065 * Math.sin(theta * 3 + 0.8) +
    offset * Math.cos(theta * 0.52 + 0.43);
  return [
    Math.cos(theta) * radius,
    Math.sin(theta) * radius * 1.13,
    0.22 * Math.sin(theta * 2) + offset * Math.sin(theta * 0.52 + 0.43),
  ];
}

export function sampleJourneyPoint(
  index: number,
  progress: number,
  structure = 0.5,
): [number, number, number] {
  const p = clamp(progress, 2, 9);
  const from = Math.floor(p);
  const to = Math.min(9, from + 1);
  const amount = smooth(0.12, 0.88, p - from);
  const a = chapterLatticePoint(index, from, structure);
  const b = chapterLatticePoint(index, to, structure);
  return [
    lerp(a[0], b[0], amount),
    lerp(a[1], b[1], amount),
    lerp(a[2], b[2], amount),
  ];
}

export function sceneColor(
  progress: number,
  channel: keyof (typeof SCENE_PALETTES)[number],
  target = new THREE.Color(),
) {
  const p = clamp(progress, 0, 9);
  const from = Math.floor(p);
  const to = Math.min(9, from + 1);
  const amount = smooth(0.15, 0.85, p - from);
  return target
    .set(SCENE_PALETTES[from][channel])
    .lerp(new THREE.Color(SCENE_PALETTES[to][channel]), amount);
}

export function cameraDistance(progress: number, mobile: boolean) {
  const distances = mobile
    ? [11.2, 10.8, 11.2, 11.0, 11.35, 11.0, 11.45, 11.1, 11.2, 11.7]
    : [8.7, 8.05, 8.7, 8.35, 8.8, 8.45, 8.95, 8.45, 8.65, 9.15];
  const p = clamp(progress, 0, 9);
  const from = Math.floor(p);
  const to = Math.min(9, from + 1);
  return lerp(distances[from], distances[to], smooth(0.05, 0.95, p - from));
}

export function journeyOrientation(progress: number): [number, number, number] {
  const poses = [
    [0.14, -0.85, -0.05],
    [0.08, -0.33, 0],
    [0.23, -0.25, -0.1],
    [0.12, -0.42, 0],
    [0.075, -0.29, 0],
    [0.04, -0.12, 0],
    [0.03, -0.12, 0],
    [0.09, -0.27, -0.12],
  ];
  const p = clamp(progress, 2, 9) - 2;
  const from = Math.floor(p);
  const to = Math.min(7, from + 1);
  const amount = smooth(0.12, 0.88, p - from);
  return [0, 1, 2].map((axis) =>
    lerp(poses[from][axis], poses[to][axis], amount),
  ) as [number, number, number];
}

export function mathematicalSurfaceGeometry(columns = 64, rows = 16) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      new Float32Array((columns + 1) * (rows + 1) * 3),
      3,
    ).setUsage(THREE.DynamicDrawUsage),
  );
  const indices: number[] = [];
  for (let x = 0; x < columns; x++)
    for (let y = 0; y < rows; y++) {
      const a = x * (rows + 1) + y;
      const b = a + rows + 1;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  geometry.setIndex(indices);
  return geometry;
}

export function updateMathematicalSurface(
  geometry: THREE.BufferGeometry,
  structure: number,
  columns = 64,
  rows = 16,
) {
  const position = geometry.getAttribute("position") as THREE.BufferAttribute;
  for (let x = 0; x <= columns; x++)
    for (let y = 0; y <= rows; y++) {
      const point = mathematicalSurfacePoint(x / columns, y / rows, structure);
      position.setXYZ(x * (rows + 1) + y, ...point);
    }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
}
