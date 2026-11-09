import { describe, expect, it } from 'vitest';
import {
  biography,
  chapters,
  getYearMilestones,
  labModules,
  learningStrands,
  locations,
  memorySlots,
  timelineEntries,
} from '../src/data/biography';
import { chapterForYear } from '../src/lib/journey';

const chapterIds = [
  'origins', 'world', 'engineering', 'reinvention', 'public-service',
  'united-nations', 'laboratory', 'person', 'continues',
];
const calendarYears = Array.from({ length: 28 }, (_, index) => 1999 + index);

describe('the supplied public biography', () => {
  it('contains all nine chapters in their narrative order with usable interaction metadata', () => {
    expect(chapters.map(chapter => chapter.id)).toEqual(chapterIds);
    expect(chapters.map(chapter => chapter.number)).toEqual(['01', '02', '03', '04', '05', '06', '07', '08', '09']);
    expect(new Set(chapters.map(chapter => chapter.panelKind)).size).toBe(9);
    for (const chapter of chapters) {
      expect(chapter.title.trim()).not.toBe('');
      expect(chapter.text.trim()).not.toBe('');
      expect(chapter.interactionLabel.trim()).not.toBe('');
      expect(chapter.milestones.length).toBeGreaterThan(0);
      expect(chapter.accent).toMatch(/^#[\da-f]{6}$/i);
    }
  });

  it('distinguishes 27 elapsed years from the 28 inclusive calendar-year choices', () => {
    expect(biography.editionYear - biography.birthYear).toBe(27);
    expect(biography.ageAtEdition).toBe(27);
    expect(calendarYears).toHaveLength(28);
    expect(calendarYears.at(0)).toBe(biography.birthYear);
    expect(calendarYears.at(-1)).toBe(biography.editionYear);
  });

  it.each(calendarYears)('can resolve year %i without inventing a milestone', year => {
    expect(chapterIds).toContain(chapterForYear(year));
    const result = getYearMilestones(year);
    expect(result).toEqual(timelineEntries.filter(entry => entry.year === year));
    for (const entry of result) {
      expect(entry.year).toBe(year);
      expect(chapterIds).toContain(entry.chapterId);
      expect(entry.date).not.toBe('');
    }
  });

  it('leaves all 18 unsupplied calendar years empty rather than manufacturing annual events', () => {
    const missingYears = calendarYears.filter(year => getYearMilestones(year).length === 0);
    expect(missingYears).toEqual([
      2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008,
      2009, 2010, 2011, 2012, 2013, 2014, 2015, 2017, 2018,
    ]);
    expect(getYearMilestones(1998)).toEqual([]);
    expect(getYearMilestones(2027)).toEqual([]);
  });

  it('preserves multiple milestones in overlapping education and employment years', () => {
    expect(getYearMilestones(2022).map(entry => entry.chapterId)).toEqual(['engineering', 'reinvention']);
    expect(getYearMilestones(2024).map(entry => entry.chapterId)).toEqual(['reinvention', 'public-service']);
    expect(getYearMilestones(2025).map(entry => entry.chapterId)).toEqual(['reinvention', 'public-service', 'united-nations']);
    expect(getYearMilestones(2026).map(entry => entry.chapterId)).toEqual(['united-nations', 'laboratory']);
  });

  it('returns a new timeline selection without reordering the source dataset', () => {
    const before = structuredClone(timelineEntries);
    const result = getYearMilestones(2025);
    result.reverse();
    result.pop();
    expect(timelineEntries).toEqual(before);
    expect(getYearMilestones(2025)).toHaveLength(3);
  });

  it('keeps Amity as the degree and Birkbeck/Adelphi as associated study experiences', () => {
    const world = chapters.find(chapter => chapter.id === 'world')!;
    expect(world.details.join(' ')).toContain('Birkbeck and Adelphi are associated study experiences, not separate degrees.');
    expect(world.milestones[0]).toMatchObject({
      date: '2016–2020',
      title: 'BTech · Computer Science Engineering',
    });
    expect(world.milestones[0].description).toContain('Amity University');
    expect(world.milestones[1]).toMatchObject({
      date: 'May–July 2019',
      title: 'Website & Database Development Intern',
    });
    expect(world.milestones[1].description).toContain('A.J. Drexel Autism Institute');
  });

  it.each([
    ['engineering', 'February 2021–August 2022', 'Associate Salesforce Developer'],
    ['reinvention', 'September 2022–May 2025', 'MSc · Data Science'],
    ['reinvention', 'September 2023–June 2024', 'Apple Developer Academy'],
    ['public-service', 'November 2024–October 2025', 'Data Officer Trainee'],
    ['united-nations', 'October 2025–June 2026', 'AI Engineer Intern'],
    ['laboratory', 'July 2026–present', 'AI Consultant'],
  ])('retains the supplied %s landmark %s', (chapterId, date, title) => {
    expect(chapters.find(chapter => chapter.id === chapterId)!.milestones).toContainEqual(
      expect.objectContaining({ date, title }),
    );
  });

  it('does not silently resolve historical WFP office wording or imply institutional endorsement', () => {
    const internship = chapters.find(chapter => chapter.id === 'united-nations')!;
    expect(internship.details.join(' ')).toMatch(/historical wording remains subject to final owner verification/i);
    expect(biography.office).toBe('Office of Inspector General');
    expect(biography.currentSince).toBe('July 2026');
    expect(biography.disclaimer).toMatch(/not an official/i);
    expect(biography.disclaimer).toMatch(/do not imply endorsement/i);
    expect(biography.disclaimer).toMatch(/fictional information.*locally/i);
  });

  it('keeps the personal archive explicitly empty until real material is supplied', () => {
    expect(memorySlots.filter(slot => slot.category === 'origins')).toHaveLength(6);
    expect(memorySlots.filter(slot => slot.category === 'person')).toHaveLength(4);
    expect(new Set(memorySlots.map(slot => slot.id)).size).toBe(memorySlots.length);
    for (const slot of memorySlots) {
      expect(slot).toMatchObject({ src: '', alt: '', caption: '', story: '' });
      expect(slot.placeholder).toMatch(/not yet|awaiting|yet to be|reserved|will appear|will be added/i);
    }
    expect(memorySlots.find(slot => slot.id === 'interests-early')!.placeholder).toContain('No interests are inferred');
    expect(memorySlots.find(slot => slot.id === 'reflections')!.placeholder).toContain('No quotation has been invented');
  });

  it('retains honest missing-project and unverified-profile placeholders', () => {
    expect(learningStrands.find(strand => strand.id === 'personal-projects')).toMatchObject({
      date: 'To be added', status: 'Explicit content placeholder',
    });
    for (const id of ['research', 'design']) {
      expect(learningStrands.find(strand => strand.id === id)!.description).toMatch(/not yet been supplied/);
    }
    expect(biography.linkedin).toBe('');
    expect(biography.github).toBe('');
    expect(biography.formalResume).toBe('');
  });

  it('has plausible distinct map coordinates tied to existing chapters, not a manufactured itinerary', () => {
    expect(new Set(locations.map(location => location.id)).size).toBe(locations.length);
    expect(locations.map(location => location.id)).toEqual(['hyderabad', 'london', 'newyork', 'philadelphia', 'naples', 'parma', 'rome']);
    for (const location of locations) {
      expect(Number.isFinite(location.lat)).toBe(true);
      expect(Number.isFinite(location.lon)).toBe(true);
      expect(location.lat).toBeGreaterThanOrEqual(-90);
      expect(location.lat).toBeLessThanOrEqual(90);
      expect(location.lon).toBeGreaterThanOrEqual(-180);
      expect(location.lon).toBeLessThanOrEqual(180);
      expect(chapterIds).toContain(location.chapterId);
      expect(location.note).not.toBe('');
    }
    expect(locations.find(location => location.id === 'newyork')!.note).toMatch(/not an exact campus location or a verified travel itinerary/);
    expect(locations.find(location => location.id === 'philadelphia')!.note).toContain('May–July 2019');
  });

  it('provides all six distinct local laboratory modules', () => {
    expect(labModules.map(module => module.id)).toEqual(['retrieval', 'analytics', 'forensics', 'briefing', 'agentic', 'governance']);
    expect(labModules.map(module => module.number)).toEqual(['01', '02', '03', '04', '05', '06']);
    expect(labModules.find(module => module.id === 'agentic')!.description).toMatch(/human approval gate/);
    expect(labModules.find(module => module.id === 'governance')!.contribution).toMatch(/not a security audit or production authorisation/);
  });
});
