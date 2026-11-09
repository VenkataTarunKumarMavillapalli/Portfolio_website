export const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));
export function progressAtScroll(scroll: number, beats: number[]): number {
  if (!beats.length || scroll <= beats[0]) return 0;
  for (let i = 1; i < beats.length; i++)
    if (scroll < beats[i])
      return (
        i -
        1 +
        clamp(
          (scroll - beats[i - 1]) / Math.max(1, beats[i] - beats[i - 1]),
          0,
          1,
        )
      );
  return beats.length - 1;
}
export function chapterForYear(year: number): string {
  if (year <= 2015) return "origins";
  if (year <= 2020) return "world";
  if (year === 2021) return "engineering";
  if (year <= 2023) return "reinvention";
  if (year === 2024) return "public-service";
  if (year === 2025) return "united-nations";
  return "laboratory";
}
export function yearForProgress(progress: number): number {
  const beats = [1999, 1999, 2016, 2021, 2022, 2024, 2025, 2026, 2026, 2026];
  const p = clamp(progress, 0, 9),
    i = Math.floor(p);
  return Math.round(beats[i] + ((beats[i + 1] ?? 2026) - beats[i]) * (p - i));
}
