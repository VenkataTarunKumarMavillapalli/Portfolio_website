import { useId, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { motion } from "motion/react";
import {
  biography,
  chapters,
  locations,
  memorySlots,
  learningStrands,
  labModules,
} from "../data/biography";
import type { Chapter } from "../data/biography";
import {
  DEMO_NOTICE,
  retrievalQuestions,
  retrievalSources,
  retrieveAnswer,
  rawQualityRows,
  qualityIssues,
  cleanQualityData,
  emptyQualityRules,
  summarizeAnalytics,
  graphNodes,
  graphEdges,
  sortForensicEvents,
  briefingSources,
  composeBriefing,
  serviceSteps,
  advanceWorkflow,
  validateGovernance,
} from "../lib/demoData";
import type {
  QualityRules,
  AnalyticsRecord,
  WorkflowState,
  WorkflowAction,
  GovernanceChecks,
} from "../lib/demoData";
import "./panels.css";

export interface StoryPanelProps {
  kind: string;
  onStructureChange?: (n: number) => void;
  onNavigate?: (chapterId: string) => void;
  motionEnabled: boolean;
}
const formatTimestamp = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
const assetPath = (value: string) =>
  /^(?:https?:|data:|blob:)/i.test(value)
    ? value
    : `${import.meta.env.BASE_URL}${value.replace(/^\/?/, "")}`;

function PanelLead({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <header className="panel-lead">
      <p className="panel-kicker">{kicker}</p>
      <h3>{title}</h3>
      <p>{children}</p>
    </header>
  );
}
function DemoNotice() {
  return (
    <p className="demo-notice">
      <span aria-hidden="true">◌</span> {DEMO_NOTICE}
    </p>
  );
}
function ChapterFacts({ chapter }: { chapter: Chapter }) {
  return (
    <details className="biographical-context">
      <summary>
        Biographical context & milestones <span aria-hidden="true">＋</span>
      </summary>
      <div className="context-body">
        {chapter.details.map((detail) => (
          <p key={detail}>{detail}</p>
        ))}
        <ol className="milestone-list">
          {chapter.milestones.map((milestone) => (
            <li key={milestone.title}>
              <p className="panel-date">{milestone.date}</p>
              <h4>{milestone.title}</h4>
              <p>{milestone.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </details>
  );
}
function NavigationButton({
  chapterId,
  onNavigate,
  children,
}: {
  chapterId: string;
  onNavigate?: (id: string) => void;
  children: ReactNode;
}) {
  return onNavigate ? (
    <button className="panel-link" onClick={() => onNavigate(chapterId)}>
      {children}
      <span aria-hidden="true">→</span>
    </button>
  ) : (
    <a className="panel-link" href={`#${chapterId}`}>
      {children}
      <span aria-hidden="true">→</span>
    </a>
  );
}

function MemoryArchive({
  category,
  motionEnabled,
}: {
  category: "origins" | "person";
  motionEnabled: boolean;
}) {
  const slots = memorySlots.filter((slot) => slot.category === category);
  const [index, setIndex] = useState(0);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const current = slots[index] ?? slots[0];
  const photoAvailable = Boolean(
    current.src && current.alt && failedImage !== current.id,
  );
  const change = (offset: number) =>
    setIndex((value) => (value + offset + slots.length) % slots.length);
  function onGalleryKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      change(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      change(1);
    }
  }
  return (
    <>
      <PanelLead
        kicker={
          category === "origins" ? "THE EARLY ARCHIVE" : "THE PERSONAL ARCHIVE"
        }
        title={
          category === "origins"
            ? "A place for the real memories."
            : "The person, beyond the timeline."
        }
      >
        Select a frame to explore. Empty frames are clearly marked and await
        real, approved words and photographs.
      </PanelLead>
      <div className="archive-layout">
        <div className="archive-index" aria-label="Choose an archive entry">
          {slots.map((slot, slotIndex) => (
            <button
              key={slot.id}
              aria-pressed={index === slotIndex}
              onClick={() => setIndex(slotIndex)}
            >
              <span>{String(slotIndex + 1).padStart(2, "0")}</span>
              {slot.title}
              <i aria-hidden="true">→</i>
            </button>
          ))}
        </div>
        <div className="archive-viewer" onKeyDown={onGalleryKey}>
          <motion.figure
            key={current.id}
            className="archive-figure"
            initial={{ opacity: motionEnabled ? 0 : 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: motionEnabled ? 0.35 : 0 }}
          >
            <div
              className={`archive-image ${photoAvailable ? "has-photo" : "is-placeholder"}`}
            >
              {photoAvailable ? (
                <img
                  src={assetPath(current.src)}
                  alt={current.alt}
                  loading="lazy"
                  decoding="async"
                  onError={() => setFailedImage(current.id)}
                />
              ) : (
                <div className="empty-photo">
                  <span className="empty-photo-mark" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <p>
                    {current.src && failedImage === current.id
                      ? "Photograph unavailable"
                      : "Photograph not yet supplied"}
                  </p>
                  <span>Reserved for a real memory</span>
                </div>
              )}
            </div>
            <figcaption>
              <p className="panel-date">
                ARCHIVE {String(index + 1).padStart(2, "0")} /{" "}
                {String(slots.length).padStart(2, "0")}
              </p>
              <h4>{current.title}</h4>
              <p>{current.story || current.placeholder}</p>
              {current.caption && (
                <p className="photo-caption">{current.caption}</p>
              )}
              {current.src && !current.alt && (
                <p className="panel-small">
                  This photograph is withheld until descriptive alternative text
                  is supplied.
                </p>
              )}
            </figcaption>
          </motion.figure>
          <div className="archive-toolbar">
            <button
              aria-label="Previous archive entry"
              onClick={() => change(-1)}
            >
              ←
            </button>
            <p aria-live="polite" aria-atomic="true">
              {index + 1} of {slots.length} · {current.title}
            </p>
            <button aria-label="Next archive entry" onClick={() => change(1)}>
              →
            </button>
          </div>
        </div>
      </div>
      <p className="panel-small">
        No fabricated personal photographs, memories, quotations or interests.
        This archive supports owner-supplied photographs, alt text, captions and
        stories in the biography configuration.
      </p>
    </>
  );
}
function WorldPanel({ onNavigate }: Pick<StoryPanelProps, "onNavigate">) {
  const [selected, setSelected] = useState("london");
  const current = locations.find((location) => location.id === selected)!;
  return (
    <>
      <PanelLead
        kicker="EDUCATION ACROSS BOUNDARIES"
        title="Every coordinate has a context."
      >
        Explore the educational and professional associations behind the globe.
        These are not claims about exact campuses, addresses or travel routes.
      </PanelLead>
      <div
        className="coordinate-picker"
        aria-label="Choose a biographical location"
      >
        {locations.map((location) => (
          <button
            key={location.id}
            aria-pressed={selected === location.id}
            onClick={() => setSelected(location.id)}
          >
            {location.name}
          </button>
        ))}
      </div>
      <div className="coordinate-detail" aria-live="polite" aria-atomic="true">
        <p className="panel-kicker">{current.country}</p>
        <h4>{current.name}</h4>
        <p className="panel-subtitle">{current.label}</p>
        <p>{current.note}</p>
        <NavigationButton chapterId={current.chapterId} onNavigate={onNavigate}>
          Visit this chapter
        </NavigationButton>
      </div>
      <p className="panel-small">
        The BTech is an Amity University degree. Birkbeck and Adelphi are
        associated study experiences, not separate degrees. The Drexel
        internship is a distinct experience.
      </p>
    </>
  );
}
function EngineeringPanel() {
  const [step, setStep] = useState(0);
  const current = serviceSteps[step];
  return (
    <>
      <PanelLead
        kicker="ENTERPRISE ENGINEERING"
        title="Follow one service request."
      >
        A useful system connects an incoming request to a clear next step.
        Advance this fictional workflow to see its logic.
      </PanelLead>
      <DemoNotice />
      <ol className="step-track">
        {serviceSteps.map((item, index) => (
          <li
            key={item.title}
            className={
              index === step ? "is-current" : index < step ? "is-complete" : ""
            }
            aria-current={index === step ? "step" : undefined}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {item.title}
          </li>
        ))}
      </ol>
      <div className="process-output" aria-live="polite" aria-atomic="true">
        <p className="panel-date">
          STEP {step + 1} / {serviceSteps.length}
        </p>
        <h4>{current.title}</h4>
        <p>{current.detail}</p>
        <p className="output-line">{current.output}</p>
      </div>
      <div className="panel-actions">
        <button
          className="panel-primary"
          onClick={() =>
            setStep((value) => Math.min(value + 1, serviceSteps.length - 1))
          }
          disabled={step === serviceSteps.length - 1}
        >
          {step === serviceSteps.length - 1
            ? "Workflow complete"
            : "Run next step"}{" "}
          <span aria-hidden="true">→</span>
        </button>
        <button onClick={() => setStep(0)} disabled={step === 0}>
          Reset workflow
        </button>
      </div>
      <details className="technical-note">
        <summary>What this illustrates</summary>
        <p>
          State, routing and explicit responsibility. The topic rule is
          deterministic; the demonstration does not use Salesforce, Amazon
          Connect, a chatbot, a real customer or any external service.
        </p>
      </details>
    </>
  );
}
function ReinventionPanel({
  onStructureChange,
}: Pick<StoryPanelProps, "onStructureChange">) {
  const [selected, setSelected] = useState("data-science");
  const [structure, setStructure] = useState(0.5);
  const sliderId = useId();
  const current = learningStrands.find((strand) => strand.id === selected)!;
  const points = Array.from({ length: 121 }, (_, index) => {
    const x = index / 120;
    const y =
      70 + Math.sin(x * Math.PI * (2 + structure * 6)) * (18 + structure * 27);
    return `${(x * 440 + 10).toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
  return (
    <>
      <PanelLead
        kicker="RESEARCH MEETS PRODUCT"
        title="Several strands. A wider way of thinking."
      >
        Select a learning strand, then change the mathematical structure. The
        shape is an illustration, not a research result.
      </PanelLead>
      <div className="strand-picker" aria-label="Choose a learning strand">
        {learningStrands.map((strand) => (
          <button
            key={strand.id}
            aria-pressed={selected === strand.id}
            onClick={() => setSelected(strand.id)}
          >
            {strand.title}
          </button>
        ))}
      </div>
      <article className="strand-detail" aria-live="polite" aria-atomic="true">
        <p className="panel-date">{current.date}</p>
        <h4>{current.organization}</h4>
        <p>{current.description}</p>
        <p className="panel-small">{current.status}</p>
      </article>
      <div className="structure-control">
        <svg
          viewBox="0 0 460 140"
          role="img"
          aria-label={`Illustrative mathematical wave with complexity ${Math.round(structure * 100)} percent`}
        >
          <line x1="10" x2="450" y1="70" y2="70" />
          <polyline points={points} />
        </svg>
        <label htmlFor={sliderId}>
          Explore a mathematical structure{" "}
          <output htmlFor={sliderId}>{Math.round(structure * 100)}%</output>
        </label>
        <input
          id={sliderId}
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={structure}
          onChange={(event) => {
            const value = Number(event.target.value);
            setStructure(value);
            onStructureChange?.(value);
          }}
        />
        <div className="range-labels">
          <span>Simple rhythm</span>
          <span>Layered structure</span>
        </div>
        <p className="panel-small">
          The slider changes this wave and the chapter’s visual structure. In
          reduced-motion mode, each adjustment selects a static pose.
        </p>
      </div>
    </>
  );
}
function QualityPanel() {
  const [rules, setRules] = useState<QualityRules>({ ...emptyQualityRules });
  const [applied, setApplied] = useState<QualityRules>({
    ...emptyQualityRules,
  });
  const cleaned = cleanQualityData(rawQualityRows, applied);
  const issues = qualityIssues(cleaned.retained);
  const initialIssues = qualityIssues(rawQualityRows).reduce(
    (sum, list) => sum + list.length,
    0,
  );
  const hasChanges = JSON.stringify(rules) !== JSON.stringify(applied);
  const ruleList: { key: keyof QualityRules; label: string; detail: string }[] =
    [
      {
        key: "normalize",
        label: "Normalise collection names",
        detail: "Trim spaces and use consistent letter case.",
      },
      {
        key: "quarantineInvalid",
        label: "Quarantine invalid counts",
        detail:
          "Set aside missing or negative counts. Never invent replacements.",
      },
      {
        key: "deduplicate",
        label: "Remove duplicate identifiers",
        detail:
          "Keep the first occurrence and record the duplicate separately.",
      },
    ];
  return (
    <>
      <PanelLead
        kicker="DATA QUALITY EXERCISE"
        title="Trust begins before the chart."
      >
        Inspect six invented rows. Choose explicit cleaning rules and compare
        the result. Original records remain unchanged.
      </PanelLead>
      <DemoNotice />
      <fieldset className="checklist">
        <legend>Choose cleaning rules</legend>
        {ruleList.map((rule) => (
          <label key={rule.key}>
            <input
              type="checkbox"
              checked={rules[rule.key]}
              onChange={(event) =>
                setRules((value) => ({
                  ...value,
                  [rule.key]: event.target.checked,
                }))
              }
            />
            <span>
              <strong>{rule.label}</strong>
              <small>{rule.detail}</small>
            </span>
          </label>
        ))}
      </fieldset>
      <div className="panel-actions">
        <button
          className="panel-primary"
          onClick={() => setApplied({ ...rules })}
        >
          Apply selected rules <span aria-hidden="true">→</span>
        </button>
        <button
          onClick={() => {
            setRules({ ...emptyQualityRules });
            setApplied({ ...emptyQualityRules });
          }}
        >
          Reset dataset
        </button>
      </div>
      <p className="panel-small" role="status">
        {hasChanges
          ? "Rules changed. Apply them to update the results."
          : "The table shows the currently applied rules."}
      </p>
      <div className="quality-summary" aria-live="polite" aria-atomic="true">
        <p>
          <strong>
            {initialIssues} → {cleaned.issueCount}
          </strong>
          <span>quality issues</span>
        </p>
        <p>
          <strong>{cleaned.retained.length}</strong>
          <span>retained rows</span>
        </p>
        <p>
          <strong>{cleaned.quarantined.length}</strong>
          <span>quarantined</span>
        </p>
        <p>
          <strong>{cleaned.duplicates.length}</strong>
          <span>duplicates removed</span>
        </p>
      </div>
      <div
        className="panel-table-wrap"
        tabIndex={0}
        role="region"
        aria-label="Fictional dataset, horizontally scrollable"
      >
        <table className="panel-table">
          <caption>Fictional archive counts · retained records</caption>
          <thead>
            <tr>
              <th scope="col">Identifier</th>
              <th scope="col">Collection</th>
              <th scope="col">Count</th>
              <th scope="col">Quality check</th>
            </tr>
          </thead>
          <tbody>
            {cleaned.retained.map((row, index) => (
              <tr key={`${row.id}-${index}`}>
                <th scope="row">{row.id}</th>
                <td className="raw-value">{row.collection}</td>
                <td>{row.count ?? "Missing"}</td>
                <td
                  className={issues[index].length ? "has-issues" : "is-valid"}
                >
                  {issues[index].join(" · ") || "Passes these checks"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(cleaned.quarantined.length > 0 || cleaned.duplicates.length > 0) && (
        <details className="technical-note">
          <summary>Inspect the change log</summary>
          <ul>
            {cleaned.quarantined.map((row) => (
              <li key={row.id}>
                {row.id}: quarantined because the count is{" "}
                {row.count === null ? "missing" : "invalid"}. No value was
                imputed.
              </li>
            ))}
            {cleaned.duplicates.map((row, index) => (
              <li key={`${row.id}-${index}`}>
                {row.id}: later duplicate removed from the retained set.
                Original data is preserved.
              </li>
            ))}
          </ul>
        </details>
      )}
      <p className="panel-small">
        Passing these checks establishes only the stated validation rules. It
        does not establish that a record is true or complete.
      </p>
    </>
  );
}
const intelligencePrinciples = [
  {
    title: "Knowledge retrieval",
    description:
      "Find relevant material before producing a response. Retrieval is a way to assist examination, not a substitute for reading.",
  },
  {
    title: "Source-grounded AI",
    description:
      "Make the source visible. A prepared answer should preserve a route back to its supporting passage and make unsupported questions explicit.",
  },
  {
    title: "Human oversight",
    description:
      "Keep review with an accountable person. A system cannot supply its own authority or decide the outcome of an investigation.",
  },
  {
    title: "Forensic preparation",
    description:
      "Preserve source identifiers while parsing and normalising records. A timestamp or connection needs its surrounding context.",
  },
  {
    title: "Executive analytics",
    description:
      "Define what a number measures, show its scope and avoid turning a convenient metric into an unsupported conclusion.",
  },
  {
    title: "Workflow automation",
    description:
      "Make steps, state and exceptions inspectable. Mark where a process must stop for human review.",
  },
  {
    title: "Enterprise integration",
    description:
      "Connect useful components within the organisation’s authorised boundaries. A public demonstration never needs production access.",
  },
  {
    title: "Responsible deployment",
    description:
      "Source traceability, scoped access and human oversight belong in the design, alongside functional requirements.",
  },
];
function UnitedNationsPanel({
  onNavigate,
}: Pick<StoryPanelProps, "onNavigate">) {
  const [selected, setSelected] = useState(1);
  return (
    <>
      <PanelLead
        kicker="INTELLIGENCE WITH ACCOUNTABILITY"
        title="A source. A context. A person."
      >
        Explore eight design principles behind the work. These public
        explanations do not expose WFP systems or investigative information.
      </PanelLead>
      <div className="principle-layout">
        <div
          className="principle-list"
          aria-label="Choose an intelligence principle"
        >
          {intelligencePrinciples.map((principle, index) => (
            <button
              key={principle.title}
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {principle.title}
            </button>
          ))}
        </div>
        <div className="principle-detail" aria-live="polite" aria-atomic="true">
          <span className="principle-number" aria-hidden="true">
            {String(selected + 1).padStart(2, "0")}
          </span>
          <h4>{intelligencePrinciples[selected].title}</h4>
          <p>{intelligencePrinciples[selected].description}</p>
        </div>
      </div>
      <RetrievalDemo compact />
      <NavigationButton chapterId="laboratory" onNavigate={onNavigate}>
        Explore all six local demonstrations
      </NavigationButton>
    </>
  );
}

function RetrievalDemo({ compact = false }: { compact?: boolean }) {
  const [questionId, setQuestionId] = useState("sources");
  const [result, setResult] = useState<ReturnType<
    typeof retrieveAnswer
  > | null>(null);
  const questionSelect = useId();
  return (
    <div className="demo-section">
      {compact && <h4>Try a source-grounded example.</h4>}
      <DemoNotice />
      <label className="field-label" htmlFor={questionSelect}>
        Choose a question for the fictional handbook
      </label>
      <div className="query-row">
        <select
          id={questionSelect}
          value={questionId}
          onChange={(event) => {
            setQuestionId(event.target.value);
            setResult(null);
          }}
        >
          {retrievalQuestions.map((question) => (
            <option key={question.id} value={question.id}>
              {question.question}
            </option>
          ))}
          <option value="unsupported">
            What happened in a real investigation?
          </option>
        </select>
        <button
          className="panel-primary"
          onClick={() => setResult(retrieveAnswer(questionId))}
        >
          Retrieve answer <span aria-hidden="true">→</span>
        </button>
      </div>
      {result ? (
        <div className="retrieval-result" aria-live="polite" aria-atomic="true">
          <p className="panel-kicker">
            {result.source
              ? "PREPARED ANSWER · SOURCE AVAILABLE"
              : "NO SUPPORTING SOURCE"}
          </p>
          <p className="answer-text">{result.answer}</p>
          {result.source && (
            <div className="source-passage">
              <p className="panel-date">
                {result.source.id} · {result.source.section}
              </p>
              <h5>{result.source.title}</h5>
              <blockquote>{result.source.text}</blockquote>
            </div>
          )}
        </div>
      ) : (
        <p className="empty-output">
          Select a question and retrieve its supporting passage.
        </p>
      )}
      <details className="technical-note">
        <summary>Inspect how this demonstration works</summary>
        <p>
          The selection maps to a predefined question ID, a fixed answer and a
          fictional source. No language model is called. An unsupported question
          returns no source and no invented answer.
        </p>
        <ol>
          {retrievalSources.map((source) => (
            <li key={source.id}>
              <strong>
                {source.id} · {source.section}
              </strong>
              <p>{source.text}</p>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
function AnalyticsDemo() {
  const [status, setStatus] = useState<"All" | AnalyticsRecord["status"]>(
    "All",
  );
  const [selectedNode, setSelectedNode] = useState("project");
  const summary = summarizeAnalytics(status);
  const node = graphNodes.find((item) => item.id === selectedNode)!;
  const statusId = useId();
  const selectedEdges = graphEdges.filter(
    (edge) => edge.from === selectedNode || edge.to === selectedNode,
  );
  return (
    <div className="demo-section">
      <DemoNotice />
      <div className="analytics-filter">
        <label className="field-label" htmlFor={statusId}>
          Filter document review status
        </label>
        <select
          id={statusId}
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as "All" | AnalyticsRecord["status"])
          }
        >
          <option>All</option>
          <option>Reviewed</option>
          <option>Pending</option>
        </select>
      </div>
      <div className="chart-summary" aria-live="polite" aria-atomic="true">
        <strong>{summary.total}</strong>
        <span>
          {status === "All"
            ? "fictional documents"
            : `${status.toLowerCase()} fictional documents`}
        </span>
      </div>
      <figure className="bar-chart">
        <figcaption>Documents per fictional collection</figcaption>
        {summary.groups.map((group) => (
          <div className="bar-row" key={group.collection}>
            <span>{group.collection}</span>
            <div className="bar-track" aria-hidden="true">
              <i style={{ width: `${(group.count / 3) * 100}%` }} />
            </div>
            <strong>{group.count}</strong>
          </div>
        ))}
      </figure>
      <details className="technical-note">
        <summary>Inspect the {summary.total} matching records</summary>
        <ul>
          {summary.records.map((record) => (
            <li key={record.id}>
              {record.id} · {record.document} · {record.collection} ·{" "}
              {record.status}
            </li>
          ))}
        </ul>
      </details>
      <div className="relationship-heading">
        <h4>A relationship is a question, not a conclusion.</h4>
        <p>
          Select a node to inspect its recorded connection. This separate
          fictional graph demonstrates provenance, not the chart’s document
          counts.
        </p>
      </div>
      <div
        className="relationship-graph"
        role="group"
        aria-label="Fictional relationship graph, five selectable nodes"
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {graphEdges.map((edge) => {
            const from = graphNodes.find((item) => item.id === edge.from)!,
              to = graphNodes.find((item) => item.id === edge.to)!;
            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                className={
                  edge.from === selectedNode || edge.to === selectedNode
                    ? "is-highlighted"
                    : ""
                }
              />
            );
          })}
        </svg>
        {graphNodes.map((item) => (
          <button
            key={item.id}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            aria-pressed={selectedNode === item.id}
            onClick={() => setSelectedNode(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="graph-detail" aria-live="polite" aria-atomic="true">
        <h5>{node.label}</h5>
        <p>{node.detail}</p>
        <ul>
          {selectedEdges.map((edge) => (
            <li key={`${edge.from}-${edge.to}`}>
              {graphNodes.find((item) => item.id === edge.from)!.label}{" "}
              <span className="edge-label">{edge.label}</span>{" "}
              {graphNodes.find((item) => item.id === edge.to)!.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
function ForensicsDemo() {
  const [order, setOrder] = useState<"oldest" | "newest">("oldest");
  const [selectedId, setSelectedId] = useState("event-1");
  const events = sortForensicEvents(order);
  const selected = events.find((event) => event.id === selectedId)!;
  const orderId = useId();
  return (
    <div className="demo-section">
      <DemoNotice />
      <div className="analytics-filter">
        <label className="field-label" htmlFor={orderId}>
          Chronology order
        </label>
        <select
          id={orderId}
          value={order}
          onChange={(event) =>
            setOrder(event.target.value as "oldest" | "newest")
          }
        >
          <option value="oldest">Oldest first</option>
          <option value="newest">Newest first</option>
        </select>
      </div>
      <ol className="forensic-timeline">
        {events.map((event) => (
          <li key={event.id}>
            <button
              aria-pressed={selectedId === event.id}
              onClick={() => setSelectedId(event.id)}
            >
              <time dateTime={event.timestamp}>
                {formatTimestamp(event.timestamp)} UTC
              </time>
              <span>{event.title}</span>
              <small>
                {event.sourceId} <i aria-hidden="true">→</i>
              </small>
            </button>
          </li>
        ))}
      </ol>
      <div className="forensic-detail" aria-live="polite" aria-atomic="true">
        <p className="panel-kicker">SELECTED RECORD · {selected.sourceId}</p>
        <h4>{selected.title}</h4>
        <div className="source-passage">
          <h5>Exact fictional source</h5>
          <blockquote>{selected.sourceText}</blockquote>
        </div>
        <dl>
          <div>
            <dt>What the record says</dt>
            <dd>{selected.observation}</dd>
          </div>
          <div>
            <dt>What it does not establish</dt>
            <dd>{selected.limitation}</dd>
          </div>
        </dl>
      </div>
      <p className="panel-small">
        All dates are UTC. Sorting changes only presentation; it does not alter
        records, infer intent or make investigative findings.
      </p>
    </div>
  );
}
function BriefingDemo() {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "SYN-B01",
    "SYN-B02",
    "SYN-B03",
  ]);
  const [audience, setAudience] = useState<"technical" | "executive">(
    "executive",
  );
  const [draft, setDraft] = useState<ReturnType<typeof composeBriefing> | null>(
    null,
  );
  const [checked, setChecked] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const audienceId = useId();
  function resetDraft() {
    setDraft(null);
    setChecked(false);
    setReviewed(false);
  }
  function toggleSource(id: string) {
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id],
    );
    resetDraft();
  }
  return (
    <div className="demo-section">
      <DemoNotice />
      <fieldset className="checklist briefing-sources">
        <legend>Select the source material</legend>
        {briefingSources.map((source) => (
          <label key={source.id}>
            <input
              type="checkbox"
              checked={selectedIds.includes(source.id)}
              onChange={() => toggleSource(source.id)}
            />
            <span>
              <strong>
                {source.id} · {source.title}
              </strong>
              <small>{source.text}</small>
            </span>
          </label>
        ))}
      </fieldset>
      <div className="query-row">
        <div className="field-stack">
          <label className="field-label" htmlFor={audienceId}>
            Draft format
          </label>
          <select
            id={audienceId}
            value={audience}
            onChange={(event) => {
              setAudience(event.target.value as "technical" | "executive");
              resetDraft();
            }}
          >
            <option value="executive">Executive draft</option>
            <option value="technical">Technical handover</option>
          </select>
        </div>
        <button
          className="panel-primary"
          disabled={!selectedIds.length}
          onClick={() => {
            setDraft(composeBriefing(selectedIds, audience));
            setChecked(false);
            setReviewed(false);
          }}
        >
          Prepare briefing <span aria-hidden="true">→</span>
        </button>
      </div>
      {!selectedIds.length && (
        <p className="panel-small" role="status">
          Select at least one source. No unsourced draft will be prepared.
        </p>
      )}
      {draft && (
        <div className="briefing-draft">
          <div aria-live="polite" aria-atomic="true">
            <p className="panel-kicker">
              {reviewed
                ? "REVIEWED IN THIS SIMULATION"
                : "DRAFT · HUMAN REVIEW REQUIRED"}
            </p>
            <h4>{draft.title}</h4>
            <ol>
              {draft.lines.map((line) => (
                <li key={line.citation}>
                  {line.text}{" "}
                  <span className="citation">[{line.citation}]</span>
                </li>
              ))}
            </ol>
            <p className="panel-small">{draft.limitations}</p>
          </div>
          <label className="review-check">
            <input
              type="checkbox"
              checked={checked}
              onChange={(event) => {
                setChecked(event.target.checked);
                setReviewed(false);
              }}
            />
            <span>
              I have checked the selected sources and limitations for this
              fictional draft.
            </span>
          </label>
          <button
            className="panel-primary"
            disabled={!checked || reviewed}
            onClick={() => setReviewed(true)}
          >
            {reviewed ? "Review recorded locally" : "Mark draft reviewed"}
          </button>
          {reviewed && (
            <p className="panel-small" role="status">
              A local review flag has been set. No document has been sent,
              published or saved to an external system.
            </p>
          )}
        </div>
      )}
      <details className="technical-note">
        <summary>Inspect the document workflow</summary>
        <p>
          Selection → fixed sentence extraction → source-labelled draft → human
          review. Each selected document contributes its predefined statement,
          in source order. Changing a source or the format clears the draft and
          its review flag.
        </p>
        <p>
          This illustrates an AI-assisted workflow design, but the demonstration
          itself is deterministic and does not use generative AI.
        </p>
      </details>
    </div>
  );
}
const workflowLabels: Record<WorkflowState, { title: string; detail: string }> =
  {
    idle: {
      title: "Ready to prepare",
      detail:
        "Fictional task: prepare a source-grounded note from the archive handbook. There is no external destination.",
    },
    prepared: {
      title: "Request prepared",
      detail:
        "Scope is fixed: use the fictional handbook, preserve source references and require human review.",
    },
    retrieved: {
      title: "Sources retrieved",
      detail:
        "SYN-H01 and SYN-H02 are attached. This lookup is local and deterministic.",
    },
    "awaiting-review": {
      title: "Stopped for human review",
      detail:
        "Prepared note: keep source identifiers and have a designated human check context and limitations. The system cannot approve this note itself.",
    },
    approved: {
      title: "Human approval recorded",
      detail:
        "You explicitly approved this fictional note. The local workflow may now complete its simulation.",
    },
    completed: {
      title: "Simulation complete",
      detail:
        "The note is marked complete only inside this page. No message, document, approval or action was sent to an external service.",
    },
    rejected: {
      title: "Returned for revision",
      detail:
        "The workflow has stopped. Nothing was dispatched. Reset the simulation to prepare a new draft.",
    },
  };
function AgenticDemo() {
  const [state, setState] = useState<WorkflowState>("idle");
  const [history, setHistory] = useState<WorkflowState[]>(["idle"]);
  function act(action: WorkflowAction) {
    const next = advanceWorkflow(state, action);
    setState(next);
    setHistory(
      action === "reset"
        ? ["idle"]
        : (values) => (next === state ? values : [...values, next]),
    );
  }
  const current = workflowLabels[state];
  const nextActions: Partial<
    Record<WorkflowState, { action: WorkflowAction; label: string }>
  > = {
    idle: { action: "prepare", label: "Prepare request" },
    prepared: { action: "retrieve", label: "Retrieve fictional sources" },
    retrieved: { action: "draft", label: "Create review draft" },
    approved: { action: "complete", label: "Complete simulation" },
  };
  const next = nextActions[state];
  return (
    <div className="demo-section">
      <DemoNotice />
      <ol className="workflow-log" aria-label="Workflow history">
        {history.map((entry, index) => (
          <li
            key={`${entry}-${index}`}
            aria-current={index === history.length - 1 ? "step" : undefined}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {workflowLabels[entry].title}
          </li>
        ))}
      </ol>
      <div
        className={`process-output ${state === "awaiting-review" ? "human-gate" : ""}`}
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="panel-kicker">
          {state === "awaiting-review"
            ? "HUMAN REVIEW GATE"
            : "LOCAL WORKFLOW STATE"}
        </p>
        <h4>{current.title}</h4>
        <p>{current.detail}</p>
      </div>
      {["retrieved", "awaiting-review", "approved", "completed"].includes(
        state,
      ) && (
        <details className="technical-note">
          <summary>Inspect the attached fictional sources</summary>
          {retrievalSources.slice(0, 2).map((source) => (
            <div key={source.id}>
              <h5>
                {source.id} · {source.section}
              </h5>
              <p>{source.text}</p>
            </div>
          ))}
        </details>
      )}
      <div className="panel-actions">
        {next && (
          <button className="panel-primary" onClick={() => act(next.action)}>
            {next.label} <span aria-hidden="true">→</span>
          </button>
        )}
        {state === "awaiting-review" && (
          <>
            <button className="panel-primary" onClick={() => act("approve")}>
              I approve this fictional draft
            </button>
            <button onClick={() => act("reject")}>Return for revision</button>
          </>
        )}
        <button disabled={state === "idle"} onClick={() => act("reset")}>
          Reset simulation
        </button>
      </div>
      <p className="panel-small">
        Completion is unavailable before your explicit review choice. This is an
        inspectable state machine, not an autonomous agent or an institutional
        approval process.
      </p>
    </div>
  );
}
function GovernanceDemo() {
  const [checks, setChecks] = useState<GovernanceChecks>({
    humanReview: false,
    sourceTrail: false,
    scopedAccess: false,
  });
  const [deployed, setDeployed] = useState(false);
  const validation = validateGovernance(checks);
  const items: {
    key: keyof GovernanceChecks;
    label: string;
    description: string;
  }[] = [
    {
      key: "humanReview",
      label: "Human oversight",
      description:
        "The workflow stops for a named human reviewer before a consequential action.",
    },
    {
      key: "sourceTrail",
      label: "Source traceability",
      description:
        "Every derived statement preserves a reference to its underlying fictional document.",
    },
    {
      key: "scopedAccess",
      label: "Scoped access",
      description:
        "Retrieval honours the authorised role and the underlying document’s access boundary.",
    },
  ];
  return (
    <div className="demo-section">
      <DemoNotice />
      <div className="architecture-path" aria-label="Illustrative architecture">
        <span>Sources</span>
        <i aria-hidden="true">→</i>
        <span>Scoped retrieval</span>
        <i aria-hidden="true">→</i>
        <span>Draft</span>
        <i aria-hidden="true">→</i>
        <span>Human review</span>
      </div>
      <fieldset className="checklist governance-checks">
        <legend>Configure the demonstration’s safeguards</legend>
        {items.map((item) => (
          <label key={item.key}>
            <input
              type="checkbox"
              checked={checks[item.key]}
              onChange={(event) => {
                setChecks((previous) => ({
                  ...previous,
                  [item.key]: event.target.checked,
                }));
                setDeployed(false);
              }}
            />
            <span>
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </span>
          </label>
        ))}
      </fieldset>
      <div className="governance-result" aria-live="polite" aria-atomic="true">
        <p className="panel-kicker">
          {deployed
            ? "SIMULATION ENABLED"
            : validation.ready
              ? "DEMONSTRATION CHECKS PASS"
              : "DEPLOYMENT SIMULATION BLOCKED"}
        </p>
        {deployed ? (
          <p>
            The local readiness state is active. No code, data, infrastructure
            or permissions have been deployed or changed.
          </p>
        ) : validation.ready ? (
          <p>
            All three illustrative safeguards are selected. You can now enable
            the local deployment simulation.
          </p>
        ) : (
          <ul>
            {validation.blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="panel-actions">
        <button
          className="panel-primary"
          disabled={!validation.ready || deployed}
          onClick={() => {
            if (validateGovernance(checks).ready) setDeployed(true);
          }}
        >
          {deployed ? "Simulation active" : "Simulate deployment"}
        </button>
        <button
          onClick={() => {
            setChecks({
              humanReview: false,
              sourceTrail: false,
              scopedAccess: false,
            });
            setDeployed(false);
          }}
        >
          Reset safeguards
        </button>
      </div>
      <p className="panel-small">
        Changing a safeguard clears the simulated deployment state. These three
        checks demonstrate design principles; they are not a complete security,
        privacy, legal or production-readiness assessment.
      </p>
    </div>
  );
}
function LaboratoryPanel() {
  const [selected, setSelected] =
    useState<(typeof labModules)[number]["id"]>("retrieval");
  const current = labModules.find((module) => module.id === selected)!;
  const titleId = useId();
  const demos: Record<(typeof labModules)[number]["id"], ReactNode> = {
    retrieval: <RetrievalDemo />,
    analytics: <AnalyticsDemo />,
    forensics: <ForensicsDemo />,
    briefing: <BriefingDemo />,
    agentic: <AgenticDemo />,
    governance: <GovernanceDemo />,
  };
  return (
    <>
      <PanelLead
        kicker="THE PROJECT LABORATORY"
        title="Six ways to make intelligence useful."
      >
        Working miniatures of retrieval, analysis and accountable workflows.
        Every demonstration is fictional, deterministic and entirely local.
      </PanelLead>
      <div className="laboratory-layout">
        <nav
          className="lab-index"
          aria-label="Choose an interactive demonstration"
        >
          {labModules.map((module) => (
            <button
              key={module.id}
              aria-pressed={selected === module.id}
              aria-controls={titleId}
              onClick={() => setSelected(module.id)}
            >
              <span>{module.number}</span>
              <strong>{module.title}</strong>
              <i aria-hidden="true">→</i>
            </button>
          ))}
        </nav>
        <section className="lab-workbench" aria-labelledby={titleId}>
          <header className="lab-heading">
            <p className="panel-kicker">EXPERIMENT {current.number} / 06</p>
            <h4 id={titleId}>{current.title}</h4>
            <p className="panel-subtitle">{current.subtitle}</p>
            <p>{current.description}</p>
          </header>
          <div key={selected}>{demos[selected]}</div>
          <p className="contribution-note">{current.contribution}</p>
        </section>
      </div>
      <p className="panel-small">
        These are explanatory prototypes, not confidential systems, real case
        studies or claims of deployed institutional capability. Switching
        demonstrations resets the selected miniature.
      </p>
    </>
  );
}
function ProfessionalPanel({
  onNavigate,
}: Pick<StoryPanelProps, "onNavigate">) {
  const experience = [
    "laboratory",
    "united-nations",
    "public-service",
    "engineering",
  ].map((id) => chapters.find((chapter) => chapter.id === id)!);
  return (
    <>
      <PanelLead kicker="THE PROFESSIONAL ROUTE" title={biography.fullName}>
        AI Consultant · World Food Programme · Office of Inspector General. A
        concise route through the experience, education and working
        demonstrations.
      </PanelLead>
      <div className="profile-current">
        <p className="panel-date">JULY 2026–PRESENT</p>
        <h4>AI integration & investigative technologies</h4>
        <p>
          The current direction connects AI engineering, enterprise knowledge,
          analytical systems, product thinking and responsible deployment. Work
          is described as contributions within multidisciplinary teams, not as
          sole ownership of institutional outcomes.
        </p>
        <NavigationButton chapterId="laboratory" onNavigate={onNavigate}>
          Explore the six synthetic demonstrations
        </NavigationButton>
      </div>
      <section className="professional-section">
        <h4>Professional experience</h4>
        <ol className="professional-list">
          {experience.map((chapter) => (
            <li key={chapter.id}>
              <p className="panel-date">{chapter.milestones[0].date}</p>
              <h5>{chapter.milestones[0].title}</h5>
              <p>{chapter.milestones[0].description}</p>
              <p>{chapter.text}</p>
              <NavigationButton chapterId={chapter.id} onNavigate={onNavigate}>
                Read the full chapter
              </NavigationButton>
            </li>
          ))}
          <li>
            <p className="panel-date">MAY–JULY 2019</p>
            <h5>Website & Database Development Intern</h5>
            <p>A.J. Drexel Autism Institute · Philadelphia, United States.</p>
            <NavigationButton chapterId="world" onNavigate={onNavigate}>
              Explore the education chapter
            </NavigationButton>
          </li>
        </ol>
      </section>
      <section className="professional-section">
        <h4>Education & applied learning</h4>
        <ol className="milestone-list">
          {[
            chapters[3].milestones[0],
            chapters[3].milestones[1],
            chapters[3].milestones[2],
            chapters[1].milestones[0],
          ].map((milestone) => (
            <li key={milestone.title}>
              <p className="panel-date">{milestone.date}</p>
              <h5>{milestone.title}</h5>
              <p>{milestone.description}</p>
            </li>
          ))}
        </ol>
        <p className="panel-small">
          Birkbeck and Adelphi are study experiences within the Amity programme,
          not separate degrees. Some study and employment periods overlap.
        </p>
      </section>
      <div className="profile-resources">
        <a
          className="panel-link"
          href={`${import.meta.env.BASE_URL}professional-overview.txt`}
          download
        >
          Download professional overview <span aria-hidden="true">↓</span>
        </a>
        <a
          className="panel-link"
          href={`${import.meta.env.BASE_URL}profile.html`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open printable profile <span aria-hidden="true">→</span>
        </a>
        <a
          className="panel-link"
          href={biography.repository}
          target="_blank"
          rel="noopener noreferrer"
        >
          View this website’s GitHub repository{" "}
          <span aria-hidden="true">→</span>
        </a>
        <a className="panel-link" href={`mailto:${biography.email}`}>
          Contact · {biography.email}
          <span aria-hidden="true">→</span>
        </a>
        {biography.linkedin ? (
          <a
            className="panel-link"
            href={biography.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn <span aria-hidden="true">→</span>
          </a>
        ) : (
          <p className="panel-small">
            LinkedIn: no verified profile URL supplied.
          </p>
        )}
        {biography.formalResume ? (
          <a
            className="panel-link"
            href={assetPath(biography.formalResume)}
            download
          >
            Download formal résumé <span aria-hidden="true">↓</span>
          </a>
        ) : (
          <p className="panel-small">
            Formal résumé: not yet selected for this build. The downloadable overview is a
            summary of the approved biography, not an uploaded résumé.
          </p>
        )}
      </div>
      <p className="panel-small">{biography.editorialNote}</p>
      <p className="independence-note">{biography.disclaimer}</p>
    </>
  );
}
export function StoryPanel({
  kind,
  onStructureChange,
  onNavigate,
  motionEnabled,
}: StoryPanelProps) {
  const chapter = chapters.find((item) => item.panelKind === kind);
  let content: ReactNode;
  switch (kind) {
    case "origins":
      content = (
        <MemoryArchive category="origins" motionEnabled={motionEnabled} />
      );
      break;
    case "world":
      content = <WorldPanel onNavigate={onNavigate} />;
      break;
    case "engineering":
      content = <EngineeringPanel />;
      break;
    case "reinvention":
      content = <ReinventionPanel onStructureChange={onStructureChange} />;
      break;
    case "public-service":
      content = <QualityPanel />;
      break;
    case "united-nations":
      content = <UnitedNationsPanel onNavigate={onNavigate} />;
      break;
    case "laboratory":
      content = <LaboratoryPanel />;
      break;
    case "person":
      content = (
        <MemoryArchive category="person" motionEnabled={motionEnabled} />
      );
      break;
    case "profile":
      content = <ProfessionalPanel onNavigate={onNavigate} />;
      break;
    default:
      content = (
        <p>
          This exploration is not available. Use the journey menu to choose a
          chapter.
        </p>
      );
  }
  return (
    <div
      key={kind}
      className="story-panel"
      data-motion={motionEnabled ? "on" : "off"}
      style={
        chapter
          ? ({ "--panel-accent": chapter.accent } as CSSProperties)
          : undefined
      }
    >
      {content}
      {chapter && kind !== "profile" && <ChapterFacts chapter={chapter} />}
    </div>
  );
}
export default StoryPanel;
