/** Every record below is invented for this public, local demonstration.
 * Deterministic transformations only: no network, model calls, institutional data or real approval.
 */
export const DEMO_NOTICE =
  "Fictional information · Local simulation · No AI model or external system";
export interface DemoSource {
  id: string;
  title: string;
  section: string;
  text: string;
}
export const retrievalSources: DemoSource[] = [
  {
    id: "SYN-H01",
    title: "Fictional archive handbook",
    section: "1 · Source handling",
    text: "Each archive item keeps its original source identifier. Derived notes must include the source identifier and distinguish direct quotations from interpretation.",
  },
  {
    id: "SYN-H02",
    title: "Fictional archive handbook",
    section: "2 · Review",
    text: "A prepared briefing is a draft until a designated human reviewer checks its source references, context and stated limitations. A system must not mark its own draft approved.",
  },
  {
    id: "SYN-H03",
    title: "Fictional archive handbook",
    section: "3 · Access",
    text: "Only explicitly authorised roles may access the fictional project workspace. A retrieval result must follow the same access restrictions as the underlying document.",
  },
];
export const retrievalQuestions = [
  {
    id: "sources",
    question: "How are sources preserved?",
    sourceId: "SYN-H01",
    answer:
      "Keep the original source identifier in each derived note, and separate quotations from interpretation.",
  },
  {
    id: "review",
    question: "Who approves a briefing?",
    sourceId: "SYN-H02",
    answer:
      "A designated human reviewer checks sources, context and limitations. The system cannot approve its own draft.",
  },
  {
    id: "access",
    question: "Who can access a document?",
    sourceId: "SYN-H03",
    answer:
      "Only explicitly authorised roles. Retrieval must respect the underlying document’s access restrictions.",
  },
] as const;
export function retrieveAnswer(questionId: string) {
  const question = retrievalQuestions.find((item) => item.id === questionId);
  if (!question)
    return {
      answer:
        "The fictional handbook does not support an answer to this question. No answer has been invented.",
      source: null,
    };
  return {
    answer: question.answer,
    source:
      retrievalSources.find((source) => source.id === question.sourceId) ??
      null,
  };
}
export interface QualityRow {
  id: string;
  collection: string;
  count: number | null;
  reviewed: boolean;
}
export const rawQualityRows: QualityRow[] = [
  { id: "DEMO-01", collection: " North ", count: 12, reviewed: true },
  { id: "DEMO-02", collection: "South", count: null, reviewed: false },
  { id: "DEMO-03", collection: "north", count: 8, reviewed: true },
  { id: "DEMO-04", collection: "East", count: -3, reviewed: false },
  { id: "DEMO-05", collection: "West", count: 5, reviewed: true },
  { id: "DEMO-05", collection: "West", count: 5, reviewed: true },
];
export interface QualityRules {
  normalize: boolean;
  quarantineInvalid: boolean;
  deduplicate: boolean;
}
export const emptyQualityRules: QualityRules = {
  normalize: false,
  quarantineInvalid: false,
  deduplicate: false,
};
const normalizeCollection = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/^./, (char) => char.toUpperCase());
export function qualityIssues(rows: readonly QualityRow[]) {
  const seen = new Set<string>();
  return rows.map((row) => {
    const issues: string[] = [];
    if (row.collection !== normalizeCollection(row.collection))
      issues.push("Inconsistent collection name");
    if (row.count === null) issues.push("Missing count");
    else if (
      !Number.isFinite(row.count) ||
      row.count < 0 ||
      !Number.isInteger(row.count)
    )
      issues.push("Invalid count");
    if (seen.has(row.id)) issues.push("Duplicate identifier");
    seen.add(row.id);
    return issues;
  });
}
export function cleanQualityData(
  rows: readonly QualityRow[],
  rules: QualityRules,
) {
  const retained: QualityRow[] = [],
    quarantined: QualityRow[] = [],
    duplicates: QualityRow[] = [];
  const seen = new Set<string>();
  rows.forEach((original) => {
    const row = {
      ...original,
      collection: rules.normalize
        ? normalizeCollection(original.collection)
        : original.collection,
    };
    if (rules.deduplicate && seen.has(row.id)) {
      duplicates.push(row);
      return;
    }
    seen.add(row.id);
    if (
      rules.quarantineInvalid &&
      (row.count === null ||
        !Number.isFinite(row.count) ||
        row.count < 0 ||
        !Number.isInteger(row.count))
    )
      quarantined.push(row);
    else retained.push(row);
  });
  return {
    retained,
    quarantined,
    duplicates,
    issueCount: qualityIssues(retained).reduce(
      (sum, issues) => sum + issues.length,
      0,
    ),
  };
}
export interface AnalyticsRecord {
  id: string;
  collection: string;
  status: "Reviewed" | "Pending";
  document: string;
  entity: string;
}
export const analyticsRecords: AnalyticsRecord[] = [
  {
    id: "A01",
    collection: "Cedar",
    status: "Reviewed",
    document: "Memo 01",
    entity: "Team Cedar",
  },
  {
    id: "A02",
    collection: "Cedar",
    status: "Reviewed",
    document: "Memo 02",
    entity: "Team Cedar",
  },
  {
    id: "A03",
    collection: "Cedar",
    status: "Pending",
    document: "Memo 03",
    entity: "Team Elm",
  },
  {
    id: "A04",
    collection: "Elm",
    status: "Reviewed",
    document: "Memo 04",
    entity: "Team Elm",
  },
  {
    id: "A05",
    collection: "Elm",
    status: "Pending",
    document: "Memo 05",
    entity: "Team Cedar",
  },
  {
    id: "A06",
    collection: "Elm",
    status: "Pending",
    document: "Memo 06",
    entity: "Team Elm",
  },
  {
    id: "A07",
    collection: "Willow",
    status: "Reviewed",
    document: "Memo 07",
    entity: "Team Willow",
  },
  {
    id: "A08",
    collection: "Willow",
    status: "Reviewed",
    document: "Memo 08",
    entity: "Team Elm",
  },
];
export function summarizeAnalytics(status: "All" | AnalyticsRecord["status"]) {
  const records = analyticsRecords.filter(
    (record) => status === "All" || record.status === status,
  );
  return {
    records,
    total: records.length,
    groups: ["Cedar", "Elm", "Willow"].map((collection) => ({
      collection,
      count: records.filter((record) => record.collection === collection)
        .length,
    })),
  };
}
export const graphNodes = [
  {
    id: "project",
    label: "Project Cedar",
    x: 50,
    y: 48,
    detail:
      "A fictional collection. Two documents carry this project label; a shared label is not proof of a real-world relationship.",
  },
  {
    id: "memo",
    label: "Memo 01",
    x: 19,
    y: 22,
    detail:
      "Fictional Memo 01: “Team Cedar placed the workshop notes in Project Cedar.” This explicitly records an archive action only.",
  },
  {
    id: "team",
    label: "Team Cedar",
    x: 81,
    y: 22,
    detail:
      "A fictional team named in Memo 01. The edge means “mentioned in”, not ownership, responsibility or an allegation.",
  },
  {
    id: "index",
    label: "Index 02",
    x: 22,
    y: 78,
    detail:
      "Fictional Index 02 lists Memo 01 and uses the Project Cedar label. An index reference is not independent corroboration of a claim.",
  },
  {
    id: "source",
    label: "Source trail",
    x: 79,
    y: 78,
    detail:
      "Both visible document nodes preserve their identifiers. Return to the exact text before interpreting any connection.",
  },
];
export const graphEdges = [
  { from: "memo", to: "project", label: "uses label" },
  { from: "memo", to: "team", label: "mentions" },
  { from: "index", to: "project", label: "uses label" },
  { from: "index", to: "memo", label: "lists" },
  { from: "source", to: "index", label: "references" },
  { from: "source", to: "memo", label: "references" },
];
export interface ForensicEvent {
  id: string;
  timestamp: string;
  title: string;
  sourceId: string;
  sourceText: string;
  observation: string;
  limitation: string;
}
export const forensicEvents: ForensicEvent[] = [
  {
    id: "event-1",
    timestamp: "2026-03-02T09:00:00Z",
    title: "Draft entered the archive",
    sourceId: "SYN-LOG-01",
    sourceText:
      "2026-03-02 09:00 UTC | Workshop agenda v1 received by the fictional archive.",
    observation: "The log records receipt of version 1.",
    limitation:
      "Receipt time does not establish when the draft was written or who authored it.",
  },
  {
    id: "event-2",
    timestamp: "2026-03-02T10:30:00Z",
    title: "A new version was recorded",
    sourceId: "SYN-LOG-02",
    sourceText:
      "2026-03-02 10:30 UTC | Workshop agenda v2 received; change note: room label corrected.",
    observation:
      "The log describes a second version and a room-label correction.",
    limitation:
      "The log alone does not prove that no other content changed. A document comparison would be required.",
  },
  {
    id: "event-3",
    timestamp: "2026-03-03T08:15:00Z",
    title: "A review note was attached",
    sourceId: "SYN-NOTE-03",
    sourceText:
      "2026-03-03 08:15 UTC | Review note: confirm room booking before circulating agenda v2.",
    observation: "A note requests confirmation before circulation.",
    limitation:
      "A request for confirmation is not evidence that confirmation or circulation occurred.",
  },
  {
    id: "event-4",
    timestamp: "2026-03-03T14:00:00Z",
    title: "Archive index was updated",
    sourceId: "SYN-INDEX-04",
    sourceText:
      "2026-03-03 14:00 UTC | Index updated to reference agenda v2 and the attached review note.",
    observation:
      "The index references the latest recorded version and review note.",
    limitation:
      "An index update does not establish approval. The underlying note still requests a check.",
  },
];
export function sortForensicEvents(order: "oldest" | "newest") {
  return [...forensicEvents].sort(
    (a, b) =>
      (Date.parse(a.timestamp) - Date.parse(b.timestamp)) *
      (order === "oldest" ? 1 : -1),
  );
}
export const briefingSources = [
  {
    id: "SYN-B01",
    title: "Collection note",
    text: "The fictional archive contains eight workshop documents. Five are marked reviewed and three are pending.",
    statement:
      "Eight workshop documents are listed: five reviewed and three pending.",
  },
  {
    id: "SYN-B02",
    title: "Review instruction",
    text: "The review team requested that pending items be checked for source references before any briefing is shared.",
    statement:
      "Pending items require a source-reference check before a briefing is shared.",
  },
  {
    id: "SYN-B03",
    title: "Scope note",
    text: "This inventory records document review status only. It does not measure the accuracy of the documents or the completion of any real investigation.",
    statement:
      "Review status does not establish document accuracy or the completion of an investigation.",
  },
];
export function composeBriefing(
  sourceIds: readonly string[],
  audience: "technical" | "executive",
) {
  const sources = briefingSources.filter((source) =>
    sourceIds.includes(source.id),
  );
  return {
    title:
      audience === "technical"
        ? "Fictional archive · technical handover"
        : "Fictional archive · executive draft",
    lines: sources.map((source) => ({
      text: source.statement,
      citation: source.id,
    })),
    limitations:
      "Deterministic template, not an AI-generated assessment. Missing sources are not filled in. A person must verify context and completeness.",
  };
}
export const serviceSteps = [
  {
    title: "Receive",
    detail:
      "An invented customer asks how to update a contact preference. No personal details are collected.",
    output: "Request DEMO-014 created locally.",
  },
  {
    title: "Classify",
    detail:
      "A deterministic rule maps “contact preference” to the fictional account-support queue.",
    output: "Category: account support. Rule: exact topic match.",
  },
  {
    title: "Route",
    detail:
      "The request is assigned to a fictional support team. There is no Salesforce or Amazon Connect connection.",
    output: "Queue: Demo support. No external message sent.",
  },
  {
    title: "Human resolution",
    detail:
      "A support person would verify the request and resolve it using an authorised system.",
    output: "Simulation complete. No account or preference has changed.",
  },
];
export type WorkflowState =
  | "idle"
  | "prepared"
  | "retrieved"
  | "awaiting-review"
  | "approved"
  | "completed"
  | "rejected";
export type WorkflowAction =
  | "prepare"
  | "retrieve"
  | "draft"
  | "approve"
  | "reject"
  | "complete"
  | "reset";
export function advanceWorkflow(
  state: WorkflowState,
  action: WorkflowAction,
): WorkflowState {
  if (action === "reset") return "idle";
  if (state === "idle" && action === "prepare") return "prepared";
  if (state === "prepared" && action === "retrieve") return "retrieved";
  if (state === "retrieved" && action === "draft") return "awaiting-review";
  if (state === "awaiting-review" && action === "approve") return "approved";
  if (state === "awaiting-review" && action === "reject") return "rejected";
  if (state === "approved" && action === "complete") return "completed";
  return state;
}
export interface GovernanceChecks {
  humanReview: boolean;
  sourceTrail: boolean;
  scopedAccess: boolean;
}
export function validateGovernance(checks: GovernanceChecks) {
  const blockers: string[] = [];
  if (!checks.humanReview)
    blockers.push("A named human review gate is missing.");
  if (!checks.sourceTrail)
    blockers.push("Source references are not preserved.");
  if (!checks.scopedAccess)
    blockers.push("Document access is not scoped to authorised roles.");
  return { ready: blockers.length === 0, blockers };
}
