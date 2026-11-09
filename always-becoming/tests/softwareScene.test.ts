import { afterEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { renderSoftwareScene } from '../src/scene/SoftwareScene';
import type { SoftwareSceneProps } from '../src/scene/SoftwareScene';
import {
  circlePoints, createSoftwareAssets, FRAME_POSES, projectSoftwarePoint, softwareMatrix,
} from '../src/scene/softwareGeometry';
import type { Point3, SoftwareAssets } from '../src/scene/softwareGeometry';
import { LOCATION_POINTS } from '../src/scene/locations';

// A recording context validates draw commands and determinism, not actual pixels,
// native Canvas rasterization, visual composition, performance, WebGL or shaders.
type Operation = [string, ...unknown[]];
function recordingContext() {
  const operations: Operation[] = [];
  const record = (name: string, ...args: unknown[]) => {
    if (args.some(value => typeof value === 'number' && !Number.isFinite(value))) throw new Error(`Nonfinite ${name} argument`);
    if (args.some(value => typeof value === 'string' && /NaN|Infinity/.test(value))) throw new Error(`Invalid ${name} color`);
    operations.push([name, ...args]);
  };
  const gradient = { addColorStop: (offset: number, color: string) => record('addColorStop', offset, color) };
  const context = new Proxy({
    clearRect: (...args: number[]) => record('clearRect', ...args),
    fillRect: (...args: number[]) => record('fillRect', ...args),
    beginPath: () => record('beginPath'),
    closePath: () => record('closePath'),
    fill: () => record('fill'),
    stroke: () => record('stroke'),
    moveTo: (...args: number[]) => record('moveTo', ...args),
    lineTo: (...args: number[]) => record('lineTo', ...args),
    arc: (...args: number[]) => record('arc', ...args),
    createRadialGradient: (...args: number[]) => { record('createRadialGradient', ...args); return gradient; },
  } as Record<string, unknown>, {
    set(target, name, value) {
      if (name === 'globalAlpha' && (typeof value !== 'number' || value < 0 || value > 1)) throw new Error('Invalid alpha');
      record(String(name), value === gradient ? 'recorded-gradient' : value);
      target[String(name)] = value;
      return true;
    },
  });
  return { ctx: context as unknown as CanvasRenderingContext2D, operations };
}

const ownedAssets: SoftwareAssets[] = [];
function assets() {
  const result = createSoftwareAssets();
  ownedAssets.push(result);
  return result;
}
afterEach(() => ownedAssets.splice(0).forEach(value => value.dispose()));

function recordScene(props: SoftwareSceneProps, resources: SoftwareAssets, width = 1440, height = 900, pointer: Point3 = [0, 0, 0], drag = 0) {
  const recording = recordingContext();
  const markers = renderSoftwareScene(recording.ctx, width, height, props, resources, pointer, drag);
  return { ...recording, markers };
}

describe('software perspective and shared CPU assets', () => {
  it('projects axis orientation and depth without infinity at the camera plane', () => {
    expect(projectSoftwarePoint([1, 1, 0], 100, 200, 20)).toEqual([120, 180, 0]);
    expect(projectSoftwarePoint([0, 0, 0], 100, 200, 20)).toEqual([100, 200, 0]);
    for (const z of [-100, -1, 0, 6.5, 6.6, 7, 8, 100]) {
      expect(projectSoftwarePoint([1.2, -0.8, z], 100, 200, 20).every(Number.isFinite)).toBe(true);
    }
    expect(projectSoftwarePoint([1, 0, 3], 0, 0, 20)[0]).toBeGreaterThan(projectSoftwarePoint([1, 0, 0], 0, 0, 20)[0]);
  });

  it('composes translation, rotation and scale in the same coordinate system', () => {
    expect(softwareMatrix().elements).toEqual(new THREE.Matrix4().elements);
    const point = new THREE.Vector3(1, 0, 0).applyMatrix4(softwareMatrix([2, 3, 4], [0, 0, Math.PI / 2], [2, 2, 2]));
    expect(point.x).toBeCloseTo(2);
    expect(point.y).toBeCloseTo(5);
    expect(point.z).toBeCloseTo(4);
  });

  it('builds a closed circle at the chosen height and radius', () => {
    const points = circlePoints(1.9, -0.2, 48);
    expect(points).toHaveLength(49);
    expect(points.every(point => point.every(Number.isFinite))).toBe(true);
    for (const [x, y, z] of points) {
      expect(y).toBe(-0.2);
      expect(Math.hypot(x, z)).toBeCloseTo(1.9, 8);
    }
    expect(new THREE.Vector3(...points[0]).distanceTo(new THREE.Vector3(...points.at(-1)!))).toBeLessThan(1e-12);
  });

  it('creates six independent frames and finite indexed mesh assets with disposable resources', () => {
    const resource = createSoftwareAssets();
    expect(FRAME_POSES).toHaveLength(6);
    expect(resource.frames).toHaveLength(6);
    const geometries = [resource.ribbon, resource.research, resource.sphere, resource.box, resource.plane, resource.ring, ...resource.frames];
    expect(new Set(geometries).size).toBe(12);
    const disposals = geometries.map(geometry => vi.spyOn(geometry, 'dispose'));
    for (const geometry of geometries) {
      const positions = geometry.getAttribute('position');
      expect(positions.count).toBeGreaterThan(0);
      expect(Array.from(positions.array).every(Number.isFinite)).toBe(true);
      expect(Array.from(geometry.getAttribute('normal').array).every(Number.isFinite)).toBe(true);
      expect(Array.from(geometry.getIndex()!.array).every(index => index >= 0 && index < positions.count)).toBe(true);
    }
    resource.dispose();
    disposals.forEach(dispose => expect(dispose).toHaveBeenCalledOnce());
  });
});

describe('recorded software scene drawing', () => {
  it.each(Array.from({ length: 10 }, (_, chapter) => chapter))('emits finite filled mesh/path commands for scene %i on desktop and mobile', progress => {
    const resource = assets();
    for (const [width, height] of [[1440, 900], [390, 844]]) {
      const recording = recordScene({ progress, motionEnabled: true, structure: 0.5 }, resource, width, height);
      expect(recording.operations[0]).toEqual(['clearRect', 0, 0, width, height]);
      expect(recording.operations.filter(([name]) => name === 'fill').length).toBeGreaterThan(50);
      expect(recording.operations.some(([name]) => name === 'stroke')).toBe(true);
      expect(recording.operations.some(([name]) => name === 'lineTo')).toBe(true);
      expect(recording.operations.at(-1)).toEqual(['globalAlpha', 1]);
      for (const marker of recording.markers) expect([marker.x, marker.y].every(Number.isFinite)).toBe(true);
    }
  });

  it.each([0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5])('draws overlapping scene handover %f without invalid coordinates or alpha', progress => {
    const recording = recordScene({ progress, motionEnabled: true, structure: 0.8 }, assets());
    expect(recording.operations.filter(([name]) => name === 'fill').length).toBeGreaterThan(20);
  });

  it('retraces the same archive-to-globe commands after visiting late chapters', () => {
    const resource = assets();
    const props = { progress: 1.55, motionEnabled: true, selectedLocation: 'hyderabad' };
    const first = recordScene(props, resource);
    for (const progress of [2, 4, 7, 8, 9]) recordScene({ ...props, progress }, resource);
    const reverse = recordScene(props, resource);
    expect(reverse.operations).toEqual(first.operations);
    expect(reverse.markers).toEqual(first.markers);
  });

  it('uses static chapter poses and ignores pointer parallax when motion is paused', () => {
    const resource = assets();
    const paused = recordScene({ progress: 3.23, motionEnabled: false }, resource, 1440, 900, [1, -1, 0]);
    const exact = recordScene({ progress: 3, motionEnabled: false }, resource, 1440, 900, [-1, 1, 0]);
    expect(paused.operations).toEqual(exact.operations);
  });

  it('responds deterministically to the mathematical parameter without corrupting the hero ribbon', () => {
    const resource = assets();
    const ribbonBefore = Array.from(resource.ribbon.getAttribute('position').array);
    const low = recordScene({ progress: 4, motionEnabled: false, structure: 0 }, resource);
    const high = recordScene({ progress: 4, motionEnabled: false, structure: 1 }, resource);
    expect(high.operations).not.toEqual(low.operations);
    expect(Array.from(resource.research.getAttribute('position').array).every(Number.isFinite)).toBe(true);
    expect(Array.from(resource.research.getAttribute('normal').array).every(Number.isFinite)).toBe(true);
    expect(Array.from(resource.ribbon.getAttribute('position').array)).toEqual(ribbonBefore);
    expect(recordScene({ progress: 4, motionEnabled: false, structure: 0 }, resource).operations).toEqual(low.operations);
  });

  it.each(LOCATION_POINTS)('keeps the selected $label marker on the front hemisphere', place => {
    const { markers } = recordScene({ progress: 2, motionEnabled: false, selectedLocation: place.id }, assets());
    const selected = markers.find(marker => marker.id === place.id);
    expect(selected).toBeDefined();
    expect(Number.isFinite(selected!.x)).toBe(true);
    expect(Number.isFinite(selected!.y)).toBe(true);
    expect(new Set(markers.map(marker => marker.id)).size).toBe(markers.length);
  });

  it('applies explicit rotation and drag to the geographic marker positions', () => {
    const resource = assets();
    const props = { progress: 2, motionEnabled: false, selectedLocation: 'hyderabad' };
    const initial = recordScene(props, resource);
    const rotated = recordScene({ ...props, globeRotation: 0.3 }, resource);
    const dragged = recordScene(props, resource, 1440, 900, [0, 0, 0], 0.3);
    expect(rotated.markers).not.toEqual(initial.markers);
    expect(dragged.markers).toEqual(rotated.markers);
  });

  it('does not expose geographic hit targets outside the globe chapter', () => {
    const resource = assets();
    for (const progress of [0, 1, 3, 4, 5, 6, 7, 8, 9]) {
      expect(recordScene({ progress, motionEnabled: false }, resource).markers).toEqual([]);
    }
  });
});
