import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { LAND_POINTS, LAND_RINGS } from '../src/scene/geography';
import { LOCATION_POINTS } from '../src/scene/locations';
import {
  TAU, associationArc, clamp, coastlineGeometry, dustGeometry, frameGeometry,
  geographicPoint, landPointGeometry, latitudeGeometry, lineSegmentsFromPoints,
  morphFrame, ribbonEdge, ribbonGeometry, smooth,
} from '../src/scene/geometry';

// These exercise Three.js's CPU-side geometry. They do not create a canvas,
// compile shaders or assert that a WebGL/GPU rendering path has passed.
function expectFiniteAttributes(geometry: THREE.BufferGeometry) {
  for (const attribute of Object.values(geometry.attributes)) {
    expect(Array.from(attribute.array).every(Number.isFinite)).toBe(true);
    expect(Number.isInteger(attribute.count)).toBe(true);
  }
  const position = geometry.getAttribute('position');
  expect(position.itemSize).toBe(3);
  const index = geometry.getIndex();
  if (index) {
    expect(Array.from(index.array).every(value => Number.isInteger(value) && value >= 0 && value < position.count)).toBe(true);
  }
}

function expectUnitNormals(geometry: THREE.BufferGeometry) {
  const position = geometry.getAttribute('position');
  const normal = geometry.getAttribute('normal');
  expect(normal.count).toBe(position.count);
  const lengths = Array.from({ length: normal.count }, (_, index) =>
    Math.hypot(normal.getX(index), normal.getY(index), normal.getZ(index)),
  );
  expect(lengths.every(length => Number.isFinite(length) && Math.abs(length - 1) < 0.00001)).toBe(true);
}

function expectRadius(geometry: THREE.BufferGeometry, radius: number) {
  const position = geometry.getAttribute('position');
  const lengths = Array.from({ length: position.count }, (_, index) =>
    Math.hypot(position.getX(index), position.getY(index), position.getZ(index)),
  );
  expect(lengths.every(length => Math.abs(length - radius) < 0.000001)).toBe(true);
}

function xyCenter(geometry: THREE.BufferGeometry, sample: number) {
  const position = geometry.getAttribute('position');
  return new THREE.Vector2(
    (position.getX(sample * 4) + position.getX(sample * 4 + 1)) / 2,
    (position.getY(sample * 4) + position.getY(sample * 4 + 1)) / 2,
  );
}

describe('finite deterministic scene interpolation', () => {
  it('clamps smooth transitions and preserves their endpoints and midpoint', () => {
    expect(TAU).toBe(2 * Math.PI);
    expect([-1, 0, 0.5, 1, 2].map(value => clamp(value))).toEqual([0, 0, 0.5, 1, 1]);
    expect([-1, 1, 2, 3, 5].map(value => smooth(1, 3, value))).toEqual([0, 0, 0.5, 1, 1]);
    const forwards = Array.from({ length: 101 }, (_, index) => smooth(1.15, 1.92, index / 25));
    expect(forwards.every(Number.isFinite)).toBe(true);
    expect(forwards.every((value, index) => index === 0 || value >= forwards[index - 1])).toBe(true);
    const backwards = Array.from({ length: 101 }, (_, index) => smooth(1.15, 1.92, (100 - index) / 25));
    expect(backwards).toEqual([...forwards].reverse());
  });

  it('builds independent line segments without mutating the source vectors', () => {
    const points = [new THREE.Vector3(1, 2, 3), new THREE.Vector3(4, 5, 6), new THREE.Vector3(7, 8, 9)];
    const original = points.map(point => point.toArray());
    const geometry = lineSegmentsFromPoints(points);
    expect(Array.from(geometry.getAttribute('position').array)).toEqual([1, 2, 3, 4, 5, 6, 4, 5, 6, 7, 8, 9]);
    expect(points.map(point => point.toArray())).toEqual(original);
    expectFiniteAttributes(geometry);
    geometry.dispose();
  });

  it('supports empty and single-point paths without invalid segment coordinates', () => {
    for (const points of [[], [new THREE.Vector3(1, 2, 3)]]) {
      const geometry = lineSegmentsFromPoints(points);
      expect(geometry.getAttribute('position').count).toBe(0);
      expectFiniteAttributes(geometry);
      geometry.dispose();
    }
  });
});

describe('the sculpted ribbon and its edge accents', () => {
  it.each([[240, 12], [72, 6], [8, 2]])('constructs %i × %i segments with finite vertices, normals, UVs and valid triangles', (segments, across) => {
    const geometry = ribbonGeometry(segments, across);
    expect(geometry.getAttribute('position').count).toBe((segments + 1) * (across + 1));
    expect(geometry.getAttribute('uv').count).toBe((segments + 1) * (across + 1));
    expect(geometry.getIndex()!.count).toBe(segments * across * 6);
    expectFiniteAttributes(geometry);
    expectUnitNormals(geometry);
    expect(Array.from(geometry.getAttribute('uv').array).every(value => value >= 0 && value <= 1)).toBe(true);
    geometry.computeBoundingSphere();
    expect(Number.isFinite(geometry.boundingSphere!.radius)).toBe(true);
    expect(geometry.boundingSphere!.radius).toBeGreaterThan(1);
    expect(geometry.boundingSphere!.radius).toBeLessThan(3);
    geometry.dispose();
  });

  it.each([-1, 1])('aligns the %i edge precisely with the same ribbon surface', side => {
    const ribbon = ribbonGeometry();
    const edge = ribbonEdge(side);
    const surface = ribbon.getAttribute('position');
    const outline = edge.getAttribute('position');
    expect(outline.count).toBe(480);
    expectFiniteAttributes(edge);
    for (let sample = 0; sample < 240; sample++) {
      const vertex = sample * 13 + (side === -1 ? 0 : 12);
      for (const coordinate of ['getX', 'getY', 'getZ'] as const) {
        expect(outline[coordinate](sample * 2)).toBeCloseTo(surface[coordinate](vertex), 6);
      }
    }
    ribbon.dispose();
    edge.dispose();
  });
});

describe('archive frame to globe meridian morph', () => {
  it.each([24, 48, 96])('keeps the %i-segment frame solid and finite through every transition sample', segments => {
    const geometry = frameGeometry(segments);
    expect(geometry.getAttribute('position').count).toBe((segments + 1) * 4);
    expect(geometry.getIndex()!.count).toBe(segments * 24);
    expect((geometry.getAttribute('position') as THREE.BufferAttribute).usage).toBe(THREE.DynamicDrawUsage);
    for (const mix of [0, 0.01, 0.25, 0.5, 0.75, 0.99, 1]) {
      morphFrame(geometry, mix, 1.3, 1.7, segments);
      expectFiniteAttributes(geometry);
      expectUnitNormals(geometry);
      expect(Number.isFinite(geometry.boundingSphere!.radius)).toBe(true);
      expect(geometry.boundingSphere!.radius).toBeGreaterThan(0);
      const position = geometry.getAttribute('position');
      expect(position.getZ(0)).toBeCloseTo(0.019, 6);
      expect(position.getZ(2)).toBeCloseTo(-0.019, 6);
    }
    geometry.dispose();
  });

  it('starts at the requested rectangular dimensions and ends on the globe meridian radius', () => {
    const geometry = frameGeometry();
    morphFrame(geometry, 0, 1.3, 1.7);
    expect(xyCenter(geometry, 0).x).toBeCloseTo(0.65, 5);
    expect(xyCenter(geometry, 0).y).toBeCloseTo(0, 5);
    expect(xyCenter(geometry, 24).y).toBeCloseTo(0.85, 5);
    expect(xyCenter(geometry, 48).x).toBeCloseTo(-0.65, 5);
    expect(xyCenter(geometry, 72).y).toBeCloseTo(-0.85, 5);
    morphFrame(geometry, 1, 1.3, 1.7);
    for (let sample = 0; sample <= 96; sample++) {
      expect(xyCenter(geometry, sample).length()).toBeCloseTo(1.755, 5);
    }
    geometry.dispose();
  });

  it('interpolates the centers continuously between the two shapes', () => {
    const geometry = frameGeometry();
    morphFrame(geometry, 0, 1.3, 1.7);
    const start = Array.from({ length: 97 }, (_, index) => xyCenter(geometry, index));
    morphFrame(geometry, 1, 1.3, 1.7);
    const end = Array.from({ length: 97 }, (_, index) => xyCenter(geometry, index));
    morphFrame(geometry, 0.5, 1.3, 1.7);
    for (let sample = 0; sample <= 96; sample++) {
      const expected = start[sample].clone().lerp(end[sample], 0.5);
      expect(xyCenter(geometry, sample).distanceTo(expected)).toBeLessThan(0.000001);
    }
    geometry.dispose();
  });

  it('reverses exactly without allocating a new position buffer or damaging the topology', () => {
    const geometry = frameGeometry();
    const position = geometry.getAttribute('position');
    const index = geometry.getIndex();
    morphFrame(geometry, 0.35, 1.3, 1.7);
    const positionsBefore = Array.from(position.array);
    const normalsBefore = Array.from(geometry.getAttribute('normal').array);
    for (const mix of [0.75, 1, 0.5, 0, 0.35]) morphFrame(geometry, mix, 1.3, 1.7);
    expect(geometry.getAttribute('position')).toBe(position);
    expect(geometry.getIndex()).toBe(index);
    expect(Array.from(position.array)).toEqual(positionsBefore);
    expect(Array.from(geometry.getAttribute('normal').array)).toEqual(normalsBefore);
    geometry.dispose();
  });
});

describe('bundled globe geography', () => {
  it.each([
    [0, 0, [0, 0, 1.7]], [0, 90, [1.7, 0, 0]], [0, -90, [-1.7, 0, 0]],
    [90, 0, [0, 1.7, 0]], [-90, 0, [0, -1.7, 0]], [0, 180, [0, 0, -1.7]],
  ] as const)('maps latitude %i longitude %i to the correct globe axes', (latitude, longitude, expected) => {
    const result = geographicPoint(latitude, longitude).toArray();
    result.forEach((coordinate, index) => expect(coordinate).toBeCloseTo(expected[index], 10));
  });

  it('keeps the bundled coastline rings closed and within valid geographic bounds', () => {
    expect(LAND_RINGS.length).toBeGreaterThan(10);
    for (const ring of LAND_RINGS) {
      expect(ring.length).toBeGreaterThanOrEqual(4);
      expect(ring.at(-1)).toEqual(ring[0]);
      expect(ring.every(([longitude, latitude]) => Number.isFinite(longitude) && Number.isFinite(latitude) && Math.abs(longitude) <= 180 && Math.abs(latitude) <= 90)).toBe(true);
    }
    expect(LAND_POINTS.length).toBeGreaterThan(100);
  });

  it('places every coastline endpoint just above the globe surface, with no spurious links between rings', () => {
    const geometry = coastlineGeometry();
    expect(geometry.getAttribute('position').count).toBe(LAND_RINGS.reduce((sum, ring) => sum + (ring.length - 1) * 2, 0));
    expectFiniteAttributes(geometry);
    expectRadius(geometry, 1.708);
    const position = geometry.getAttribute('position');
    let offset = 0;
    for (const ring of LAND_RINGS) {
      const expected = geographicPoint(ring[0][1], ring[0][0], 1.708);
      const first = new THREE.Vector3().fromBufferAttribute(position, offset);
      expect(first.distanceTo(expected)).toBeLessThan(0.000001);
      offset += (ring.length - 1) * 2;
    }
    geometry.dispose();
  });

  it('uses an exact, deterministic half-density mobile land-point selection', () => {
    const desktop = landPointGeometry(false);
    const mobile = landPointGeometry(true);
    expect(desktop.getAttribute('position').count).toBe(LAND_POINTS.length);
    expect(mobile.getAttribute('position').count).toBe(Math.ceil(LAND_POINTS.length / 2));
    expectFiniteAttributes(desktop);
    expectFiniteAttributes(mobile);
    expectRadius(desktop, 1.712);
    expectRadius(mobile, 1.712);
    const dense = desktop.getAttribute('position');
    const sparse = mobile.getAttribute('position');
    for (let index = 0; index < sparse.count; index++) {
      expect([sparse.getX(index), sparse.getY(index), sparse.getZ(index)]).toEqual([dense.getX(index * 2), dense.getY(index * 2), dense.getZ(index * 2)]);
    }
    desktop.dispose();
    mobile.dispose();
  });

  it('places five complete latitude circles at their intended radius', () => {
    const geometry = latitudeGeometry();
    expect(geometry.getAttribute('position').count).toBe(5 * 120 * 2);
    expectFiniteAttributes(geometry);
    expectRadius(geometry, 1.718);
    const position = geometry.getAttribute('position');
    [-60, -30, 0, 30, 60].forEach((latitude, index) => {
      expect(position.getY(index * 240)).toBeCloseTo(1.718 * Math.sin(latitude * Math.PI / 180), 6);
    });
    geometry.dispose();
  });

  it.each(LOCATION_POINTS.slice(1))('connects Hyderabad and $label above the globe and returns the exact endpoint', destination => {
    const origin = LOCATION_POINTS[0];
    const geometry = associationArc(origin, destination);
    expectFiniteAttributes(geometry);
    const position = geometry.getAttribute('position');
    expect(position.count).toBe(160);
    expect(new THREE.Vector3().fromBufferAttribute(position, 0).distanceTo(geographicPoint(origin.latitude, origin.longitude, 1.73))).toBeLessThan(0.000001);
    expect(new THREE.Vector3().fromBufferAttribute(position, 159).distanceTo(geographicPoint(destination.latitude, destination.longitude, 1.73))).toBeLessThan(0.000001);
    const radii = Array.from({ length: position.count }, (_, index) => new THREE.Vector3().fromBufferAttribute(position, index).length());
    expect(radii.every(radius => radius >= 1.73 - 0.000001 && radius <= 2.28 + 0.000001)).toBe(true);
    expect(Math.max(...radii)).toBeGreaterThan(1.73);
    geometry.dispose();
  });

  it('keeps coincident and antipodal association endpoints finite', () => {
    const origin = { latitude: 0, longitude: 0 };
    for (const destination of [origin, { latitude: 0, longitude: 180 }]) {
      const geometry = associationArc(origin, destination);
      expectFiniteAttributes(geometry);
      const position = geometry.getAttribute('position');
      const radii = Array.from({ length: position.count }, (_, index) => new THREE.Vector3().fromBufferAttribute(position, index).length());
      expect(radii.every(radius => radius >= 1.73 - 0.000001 && radius <= 2.28 + 0.000001)).toBe(true);
      geometry.dispose();
    }
  });
});

describe('deterministic background dust', () => {
  it.each([0, 60, 160])('creates exactly %i finite particles inside the scene bounds', count => {
    const geometry = dustGeometry(count);
    const repeated = dustGeometry(count);
    const position = geometry.getAttribute('position');
    expect(position.count).toBe(count);
    expectFiniteAttributes(geometry);
    expect(Array.from(position.array)).toEqual(Array.from(repeated.getAttribute('position').array));
    for (let index = 0; index < count; index++) {
      expect(position.getX(index)).toBeGreaterThanOrEqual(-8);
      expect(position.getX(index)).toBeLessThanOrEqual(8);
      expect(position.getY(index)).toBeGreaterThanOrEqual(-5.5);
      expect(position.getY(index)).toBeLessThanOrEqual(5.5);
      expect(position.getZ(index)).toBeGreaterThanOrEqual(-10);
      expect(position.getZ(index)).toBeLessThanOrEqual(-2);
    }
    geometry.dispose();
    repeated.dispose();
  });
});
