import { describe, expect, it } from 'vitest';
import {
  cameraDistance, chapterLatticePoint, JOURNEY_POINT_COUNT, mathematicalSurfaceGeometry,
  mathematicalSurfacePoint, sampleJourneyPoint, sceneColor, sceneEnvelope, updateMathematicalSurface,
} from './journeyGeometry';

describe('continuous chapter world geometry', () => {
  it('produces finite, bounded coordinates throughout every transition', () => {
    for (let step = 0; step <= 140; step++) {
      const progress = 2 + step / 20;
      for (let index = 0; index < JOURNEY_POINT_COUNT; index++) {
        const point = sampleJourneyPoint(index, progress, 0.63);
        for (const coordinate of point) {
          expect(Number.isFinite(coordinate)).toBe(true);
          expect(Math.abs(coordinate)).toBeLessThan(3);
        }
      }
    }
  });

  it('retraces exactly the same geometry when progress reverses', () => {
    const sequence = [2, 2.47, 3.2, 3.73, 4.5, 5.89, 6.4, 7.95, 8.68, 9];
    const forward = sequence.map((progress) => sampleJourneyPoint(87, progress, 0.7));
    const backward = [...sequence].reverse().map((progress) => sampleJourneyPoint(87, progress, 0.7)).reverse();
    expect(backward).toEqual(forward);
  });

  it('matches each named chapter pose at exact chapter boundaries', () => {
    for (let chapter = 2; chapter <= 9; chapter++) {
      for (const index of [0, 22, 87, 133, 167]) {
        expect(sampleJourneyPoint(index, chapter, 0.5)).toEqual(chapterLatticePoint(index, chapter, 0.5));
        const before = sampleJourneyPoint(index, chapter - 0.00001, 0.5);
        const after = sampleJourneyPoint(index, chapter + 0.00001, 0.5);
        before.forEach((value, axis) => expect(Math.abs(value - after[axis])).toBeLessThan(0.001));
      }
    }
  });

  it('keeps adjacent chapter architecture visible through handovers', () => {
    for (let step = 0; step <= 120; step++) {
      const progress = 3 + step / 20;
      const total = [3, 4, 5, 6, 7, 8, 9].reduce((sum, chapter) => sum + sceneEnvelope(progress, chapter), 0);
      expect(total).toBeGreaterThan(0.7);
    }
  });

  it('responds to the research parameter and clamps out-of-range input', () => {
    expect(mathematicalSurfacePoint(0.23, 0.84, 0)).not.toEqual(mathematicalSurfacePoint(0.23, 0.84, 1));
    expect(mathematicalSurfacePoint(0.23, 0.84, -2)).toEqual(mathematicalSurfacePoint(0.23, 0.84, 0));
    expect(mathematicalSurfacePoint(0.23, 0.84, 3)).toEqual(mathematicalSurfacePoint(0.23, 0.84, 1));
  });

  it('creates a real indexed surface with finite positions and normals', () => {
    const geometry = mathematicalSurfaceGeometry(32, 8);
    updateMathematicalSurface(geometry, 0.58, 32, 8);
    expect(geometry.getIndex()?.count).toBe(32 * 8 * 6);
    expect(geometry.getAttribute('position').count).toBe(33 * 9);
    expect([...geometry.getAttribute('position').array].every(Number.isFinite)).toBe(true);
    expect([...geometry.getAttribute('normal').array].every(Number.isFinite)).toBe(true);
    expect(geometry.boundingSphere?.radius).toBeGreaterThan(1);
    geometry.dispose();
  });

  it('maintains finite camera poses and palette transitions', () => {
    for (let step = 0; step <= 180; step++) {
      const progress = step / 20;
      expect(cameraDistance(progress, false)).toBeGreaterThan(8);
      expect(cameraDistance(progress, true)).toBeGreaterThan(10);
      for (const channel of ['glow', 'metal', 'line', 'key', 'fill'] as const) {
        const color = sceneColor(progress, channel);
        expect([color.r, color.g, color.b].every(Number.isFinite)).toBe(true);
      }
    }
  });
});
