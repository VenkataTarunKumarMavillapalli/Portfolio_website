import { describe, expect, it } from 'vitest';
import {
  DEMO_NOTICE, advanceWorkflow, analyticsRecords, briefingSources, cleanQualityData,
  composeBriefing, emptyQualityRules, forensicEvents, graphEdges, graphNodes,
  qualityIssues, rawQualityRows, retrievalQuestions, retrievalSources, retrieveAnswer,
  serviceSteps, sortForensicEvents, summarizeAnalytics, validateGovernance,
} from '../src/lib/demoData';
import type { GovernanceChecks, QualityRow, QualityRules, WorkflowAction, WorkflowState } from '../src/lib/demoData';

describe('local, source-grounded retrieval', () => {
  it('prominently identifies its fictional, local, non-model nature', () => {
    expect(DEMO_NOTICE).toMatch(/Fictional information/);
    expect(DEMO_NOTICE).toMatch(/Local simulation/);
    expect(DEMO_NOTICE).toMatch(/No AI model or external system/);
  });

  it.each(retrievalQuestions)('returns the exact source for $id', question => {
    const result = retrieveAnswer(question.id);
    expect(result.answer).toBe(question.answer);
    expect(result.source).toEqual(retrievalSources.find(source => source.id === question.sourceId));
    expect(result.source!.id).toMatch(/^SYN-/);
    expect(result.source!.title).toContain('Fictional');
    expect(result.source!.section).not.toBe('');
    expect(result.source!.text.length).toBeGreaterThan(30);
  });

  it.each(['', 'not-in-the-handbook', 'SYN-H01', '<script>alert(1)</script>'])('declines unsupported lookup %j without fabricating evidence', question => {
    expect(retrieveAnswer(question)).toEqual({
      answer: 'The fictional handbook does not support an answer to this question. No answer has been invented.',
      source: null,
    });
  });

  it('keeps human review and access restrictions visible in the source, not only the answer', () => {
    expect(retrieveAnswer('review').source!.text).toMatch(/must not mark its own draft approved/);
    expect(retrieveAnswer('access').source!.text).toMatch(/same access restrictions as the underlying document/);
  });
});

describe('quality inspection and reversible cleaning', () => {
  const ruleSets: QualityRules[] = Array.from({ length: 8 }, (_, bits) => ({
    normalize: Boolean(bits & 1), quarantineInvalid: Boolean(bits & 2), deduplicate: Boolean(bits & 4),
  }));

  it('reports five distinct input issues without labelling every unreviewed row invalid', () => {
    expect(qualityIssues(rawQualityRows)).toEqual([
      ['Inconsistent collection name'], ['Missing count'], ['Inconsistent collection name'],
      ['Invalid count'], [], ['Duplicate identifier'],
    ]);
    expect(qualityIssues([{ id: 'valid', collection: 'North', count: 0, reviewed: false }])).toEqual([[]]);
  });

  it.each(ruleSets)('applies only the selected rules %j and accounts for every input row', rules => {
    const rows = rawQualityRows.map(row => Object.freeze({ ...row }));
    Object.freeze(rows);
    const snapshot = structuredClone(rows);
    const result = cleanQualityData(rows, rules);

    expect(result.retained).toHaveLength(6 - (rules.quarantineInvalid ? 2 : 0) - (rules.deduplicate ? 1 : 0));
    expect(result.quarantined).toHaveLength(rules.quarantineInvalid ? 2 : 0);
    expect(result.duplicates).toHaveLength(rules.deduplicate ? 1 : 0);
    expect(result.issueCount).toBe(5 - (rules.normalize ? 2 : 0) - (rules.quarantineInvalid ? 2 : 0) - (rules.deduplicate ? 1 : 0));
    expect(result.issueCount).toBe(qualityIssues(result.retained).flat().length);
    expect([...result.retained, ...result.quarantined, ...result.duplicates]).toHaveLength(rows.length);
    expect(rows).toEqual(snapshot);
    for (const output of [...result.retained, ...result.quarantined, ...result.duplicates]) {
      expect(rows.includes(output)).toBe(false);
    }
  });

  it('does not invent replacement values for missing or invalid counts', () => {
    const cleaned = cleanQualityData(rawQualityRows, { normalize: true, quarantineInvalid: true, deduplicate: true });
    expect(cleaned.retained.map(row => [row.id, row.collection, row.count])).toEqual([
      ['DEMO-01', 'North', 12], ['DEMO-03', 'North', 8], ['DEMO-05', 'West', 5],
    ]);
    expect(cleaned.quarantined.map(row => row.count)).toEqual([null, -3]);
    expect(cleaned.duplicates.map(row => row.id)).toEqual(['DEMO-05']);
    expect(cleaned.issueCount).toBe(0);
  });

  it('can reset to the raw dataset and clean again without accumulating changes', () => {
    const allRules = { normalize: true, quarantineInvalid: true, deduplicate: true };
    const first = cleanQualityData(rawQualityRows, allRules);
    const reset = cleanQualityData(rawQualityRows, emptyQualityRules);
    expect(reset.retained).toEqual(rawQualityRows);
    expect(reset.issueCount).toBe(5);
    expect(cleanQualityData(rawQualityRows, allRules)).toEqual(first);
    expect(cleanQualityData(first.retained, allRules)).toEqual({ ...first, quarantined: [], duplicates: [] });
  });

  it.each([null, -1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('quarantines invalid numeric input %j', count => {
    const row: QualityRow = { id: 'edge', collection: 'North', count, reviewed: false };
    expect(qualityIssues([row])[0]).toEqual([count === null ? 'Missing count' : 'Invalid count']);
    const result = cleanQualityData([row], { ...emptyQualityRules, quarantineInvalid: true });
    expect(result.retained).toEqual([]);
    expect(result.quarantined).toEqual([row]);
    expect(result.issueCount).toBe(0);
  });

  it('handles an empty collection without divisions or fabricated rows', () => {
    expect(qualityIssues([])).toEqual([]);
    expect(cleanQualityData([], emptyQualityRules)).toEqual({ retained: [], quarantined: [], duplicates: [], issueCount: 0 });
  });
});

describe('analytics and source-linked relationships', () => {
  it.each([
    ['All', 8, [3, 3, 2]],
    ['Reviewed', 5, [2, 1, 2]],
    ['Pending', 3, [1, 2, 0]],
  ] as const)('filters %s with accurate totals and zero-count collections', (status, total, counts) => {
    const snapshot = structuredClone(analyticsRecords);
    const result = summarizeAnalytics(status);
    expect(result.total).toBe(total);
    expect(result.records).toHaveLength(total);
    expect(result.groups).toEqual(['Cedar', 'Elm', 'Willow'].map((collection, index) => ({ collection, count: counts[index] })));
    expect(result.groups.reduce((sum, group) => sum + group.count, 0)).toBe(total);
    expect(result.records.every(record => status === 'All' || record.status === status)).toBe(true);
    expect(analyticsRecords).toEqual(snapshot);
  });

  it('makes the two status selections a disjoint, complete partition', () => {
    const reviewed = summarizeAnalytics('Reviewed').records.map(record => record.id);
    const pending = summarizeAnalytics('Pending').records.map(record => record.id);
    expect(reviewed.some(id => pending.includes(id))).toBe(false);
    expect([...reviewed, ...pending].sort()).toEqual(analyticsRecords.map(record => record.id).sort());
  });

  it('keeps graph edges valid and interpretations explicitly limited', () => {
    const ids = graphNodes.map(node => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const edge of graphEdges) {
      expect(ids).toContain(edge.from);
      expect(ids).toContain(edge.to);
      expect(edge.from).not.toBe(edge.to);
      expect(edge.label).not.toBe('');
    }
    expect(graphNodes.find(node => node.id === 'project')!.detail).toMatch(/not proof/);
    expect(graphNodes.find(node => node.id === 'team')!.detail).toMatch(/not ownership, responsibility or an allegation/);
    expect(graphNodes.find(node => node.id === 'index')!.detail).toMatch(/not independent corroboration/);
  });
});

describe('forensic chronology', () => {
  it('orders all events in both directions without changing the input dataset', () => {
    const snapshot = structuredClone(forensicEvents);
    const oldest = sortForensicEvents('oldest');
    const newest = sortForensicEvents('newest');
    expect(oldest.map(event => event.id)).toEqual(['event-1', 'event-2', 'event-3', 'event-4']);
    expect(newest.map(event => event.id)).toEqual(['event-4', 'event-3', 'event-2', 'event-1']);
    expect(newest).toEqual([...oldest].reverse());
    expect(oldest).not.toBe(forensicEvents);
    expect(forensicEvents).toEqual(snapshot);
    expect(oldest.every((event, index) => index === 0 || Date.parse(event.timestamp) >= Date.parse(oldest[index - 1].timestamp))).toBe(true);
  });

  it('retains exact source text, UTC time, an observation and a separate limitation for every event', () => {
    expect(new Set(forensicEvents.map(event => event.sourceId)).size).toBe(forensicEvents.length);
    for (const event of forensicEvents) {
      expect(event.timestamp).toMatch(/Z$/);
      expect(Number.isFinite(Date.parse(event.timestamp))).toBe(true);
      expect(event.sourceId).toMatch(/^SYN-/);
      expect(event.sourceText).toContain('UTC');
      expect(event.observation).not.toBe('');
      expect(event.limitation).toMatch(/does not|not evidence/);
    }
    expect(forensicEvents[2].limitation).toContain('not evidence that confirmation or circulation occurred');
    expect(forensicEvents[3].limitation).toContain('does not establish approval');
  });
});

describe('deterministic briefing preparation', () => {
  it.each(['technical', 'executive'] as const)('uses only selected source statements and citations for the %s audience', audience => {
    const result = composeBriefing(['SYN-B03', 'SYN-B01'], audience);
    expect(result.title).toBe(audience === 'technical' ? 'Fictional archive · technical handover' : 'Fictional archive · executive draft');
    expect(result.lines).toEqual([
      { text: briefingSources[0].statement, citation: 'SYN-B01' },
      { text: briefingSources[2].statement, citation: 'SYN-B03' },
    ]);
    for (const line of result.lines) {
      expect(briefingSources.find(source => source.id === line.citation)!.statement).toBe(line.text);
    }
    expect(result.limitations).toMatch(/not an AI-generated assessment/);
    expect(result.limitations).toMatch(/A person must verify/);
  });

  it('does not invent content for absent, duplicate or unknown source IDs', () => {
    expect(composeBriefing([], 'executive').lines).toEqual([]);
    expect(composeBriefing(['unknown'], 'executive').lines).toEqual([]);
    expect(composeBriefing(['SYN-B02', 'SYN-B02', 'unknown'], 'technical').lines).toEqual([
      { text: briefingSources[1].statement, citation: 'SYN-B02' },
    ]);
    expect(composeBriefing([], 'executive').limitations).toContain('Missing sources are not filled in');
  });

  it('is deterministic and leaves selected IDs and source documents unchanged', () => {
    const sourceIds = Object.freeze(['SYN-B01', 'SYN-B03']);
    const snapshot = structuredClone(briefingSources);
    expect(composeBriefing(sourceIds, 'technical')).toEqual(composeBriefing(sourceIds, 'technical'));
    expect(sourceIds).toEqual(['SYN-B01', 'SYN-B03']);
    expect(briefingSources).toEqual(snapshot);
  });
});

describe('agentic workflow: an explicit human gate', () => {
  const states: WorkflowState[] = ['idle', 'prepared', 'retrieved', 'awaiting-review', 'approved', 'completed', 'rejected'];
  const actions: WorkflowAction[] = ['prepare', 'retrieve', 'draft', 'approve', 'reject', 'complete', 'reset'];
  const legalTransitions: Partial<Record<WorkflowState, Partial<Record<WorkflowAction, WorkflowState>>>> = {
    idle: { prepare: 'prepared' }, prepared: { retrieve: 'retrieved' }, retrieved: { draft: 'awaiting-review' },
    'awaiting-review': { approve: 'approved', reject: 'rejected' }, approved: { complete: 'completed' },
  };

  it.each(states)('validates all seven actions from %s, including reset and invalid repeated clicks', state => {
    for (const action of actions) {
      expect(advanceWorkflow(state, action)).toBe(action === 'reset' ? 'idle' : legalTransitions[state]?.[action] ?? state);
    }
  });

  it('cannot reach approval or completion through any sequence without an explicit approve action', () => {
    const autonomousActions: WorkflowAction[] = ['prepare', 'retrieve', 'draft', 'complete', 'reset'];
    const seen = new Set<WorkflowState>(['idle']);
    const queue: WorkflowState[] = ['idle'];
    while (queue.length) {
      const state = queue.shift()!;
      for (const action of autonomousActions) {
        const next = advanceWorkflow(state, action);
        expect(next).not.toBe('approved');
        expect(next).not.toBe('completed');
        if (!seen.has(next)) { seen.add(next); queue.push(next); }
      }
    }
    expect([...seen]).toEqual(['idle', 'prepared', 'retrieved', 'awaiting-review']);
  });

  it('supports deliberate approval and completion, or rejection followed by a full restart', () => {
    let state: WorkflowState = 'idle';
    for (const action of ['prepare', 'retrieve', 'draft'] as const) state = advanceWorkflow(state, action);
    expect(state).toBe('awaiting-review');
    expect(advanceWorkflow(state, 'complete')).toBe('awaiting-review');
    const rejected = advanceWorkflow(state, 'reject');
    expect(advanceWorkflow(rejected, 'approve')).toBe('rejected');
    expect(advanceWorkflow(rejected, 'complete')).toBe('rejected');
    expect(advanceWorkflow(rejected, 'reset')).toBe('idle');
    expect(advanceWorkflow(advanceWorkflow(state, 'approve'), 'complete')).toBe('completed');
  });

  it('labels the service workflow as a local explanation without real customer actions', () => {
    expect(serviceSteps.map(step => step.title)).toEqual(['Receive', 'Classify', 'Route', 'Human resolution']);
    expect(serviceSteps[0].detail).toContain('No personal details are collected');
    expect(serviceSteps[2].output).toContain('No external message sent');
    expect(serviceSteps[3].output).toContain('No account or preference has changed');
  });
});

describe('governance readiness', () => {
  const combinations: GovernanceChecks[] = Array.from({ length: 8 }, (_, bits) => ({
    humanReview: Boolean(bits & 1), sourceTrail: Boolean(bits & 2), scopedAccess: Boolean(bits & 4),
  }));

  it.each(combinations)('requires every safeguard %j', checks => {
    const before = { ...checks };
    const result = validateGovernance(checks);
    expect(result.ready).toBe(checks.humanReview && checks.sourceTrail && checks.scopedAccess);
    expect(result.blockers).toHaveLength(Object.values(checks).filter(value => !value).length);
    if (!checks.humanReview) expect(result.blockers).toContain('A named human review gate is missing.');
    if (!checks.sourceTrail) expect(result.blockers).toContain('Source references are not preserved.');
    if (!checks.scopedAccess) expect(result.blockers).toContain('Document access is not scoped to authorised roles.');
    expect(checks).toEqual(before);
  });
});
