import { describe, expect, it } from 'vitest';
import { chapters } from '../src/data/biography';
import { chapterForYear, clamp, progressAtScroll, yearForProgress } from '../src/lib/journey';

describe('native scroll to reversible scene progress', () => {
  const beats = [0, 900, 2050, 3050, 4300, 5250, 6500, 7700, 8600, 9800];

  it('lands exactly on every prologue/chapter beat and caps both ends', () => {
    beats.forEach((scroll, index) => expect(progressAtScroll(scroll, beats)).toBe(index));
    expect(progressAtScroll(-500, beats)).toBe(0);
    expect(progressAtScroll(100_000, beats)).toBe(9);
    expect(progressAtScroll(Number.NEGATIVE_INFINITY, beats)).toBe(0);
    expect(progressAtScroll(Number.POSITIVE_INFINITY, beats)).toBe(9);
  });

  it('interpolates uneven section lengths rather than assuming equal viewport heights', () => {
    for (let index = 1; index < beats.length; index++) {
      expect(progressAtScroll((beats[index - 1] + beats[index]) / 2, beats)).toBeCloseTo(index - 0.5);
      expect(progressAtScroll(beats[index - 1] + (beats[index] - beats[index - 1]) * 0.25, beats)).toBeCloseTo(index - 0.75);
    }
  });

  it('stays finite, bounded and monotonic across the entire scroll journey', () => {
    let previous = 0;
    for (let scroll = -100; scroll <= 10_000; scroll += 13) {
      const progress = progressAtScroll(scroll, beats);
      expect(Number.isFinite(progress)).toBe(true);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(9);
      expect(progress).toBeGreaterThanOrEqual(previous);
      previous = progress;
    }
  });

  it('reverses to the same positions without persistent state or mutations', () => {
    const before = [...beats];
    const positions = [0, 900, 1200, 2400, 5000, 9800, 10_000];
    const forward = positions.map(scroll => progressAtScroll(scroll, beats));
    const backward = [...positions].reverse().map(scroll => progressAtScroll(scroll, beats));
    expect(backward).toEqual([...forward].reverse());
    expect(beats).toEqual(before);
  });

  it('handles unmeasured, single-section and zero-height beats without NaN', () => {
    expect(progressAtScroll(500, [])).toBe(0);
    expect(progressAtScroll(500, [0])).toBe(0);
    for (const scroll of [-1, 0, 0.5, 1, 50, 100, 1000]) {
      const progress = progressAtScroll(scroll, [0, 0, 100, 100]);
      expect(Number.isFinite(progress)).toBe(true);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(3);
    }
  });
});

describe('year and chapter coordinates', () => {
  it('has one year coordinate for the prologue and each of the nine chapters', () => {
    expect(Array.from({ length: 10 }, (_, index) => yearForProgress(index))).toEqual([1999, 1999, 2016, 2021, 2022, 2024, 2025, 2026, 2026, 2026]);
  });

  it('caps out-of-range progress and never returns a fractional/out-of-range calendar year', () => {
    expect(yearForProgress(-20)).toBe(1999);
    expect(yearForProgress(50)).toBe(2026);
    expect(yearForProgress(Number.NEGATIVE_INFINITY)).toBe(1999);
    expect(yearForProgress(Number.POSITIVE_INFINITY)).toBe(2026);
    let previous = 1999;
    for (let step = -100; step <= 1000; step++) {
      const year = yearForProgress(step / 100);
      expect(Number.isInteger(year)).toBe(true);
      expect(year).toBeGreaterThanOrEqual(previous);
      expect(year).toBeGreaterThanOrEqual(1999);
      expect(year).toBeLessThanOrEqual(2026);
      previous = year;
    }
  });

  it.each([
    [1999, 'origins'], [2015, 'origins'], [2016, 'world'], [2020, 'world'],
    [2021, 'engineering'], [2022, 'reinvention'], [2023, 'reinvention'],
    [2024, 'public-service'], [2025, 'united-nations'], [2026, 'laboratory'],
  ])('routes %i to the intended chapter %s', (year, expected) => {
    expect(chapterForYear(Number(year))).toBe(expected);
    expect(chapters.map(chapter => chapter.id)).toContain(expected);
  });

  it('clamps ordinary and infinite boundary values consistently', () => {
    expect([-1, 0, 0.3, 1, 2].map(value => clamp(value, 0, 1))).toEqual([0, 0, 0.3, 1, 1]);
    expect(clamp(Number.NEGATIVE_INFINITY, 0, 1)).toBe(0);
    expect(clamp(Number.POSITIVE_INFINITY, 0, 1)).toBe(1);
  });
});
