import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { CSSProperties, ReactNode } from "react";
import { motion, MotionConfig } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  biography,
  chapters,
  locations,
  getYearMilestones,
} from "./data/biography";
import { chapterForYear, clamp, yearForProgress } from "./lib/journey";
import FallbackScene from "./components/FallbackScene";

gsap.registerPlugin(ScrollTrigger);
const SceneWorld = lazy(() => import("./scene/SceneWorld"));
const SoftwareScene = lazy(() => import("./scene/SoftwareScene"));
const StoryPanel = lazy(() => import("./components/StoryPanels"));
const story = chapters;
type Overlay = {
  kind: "chapter" | "menu" | "profile" | "timeline" | "location" | "about";
  id?: string;
};
class SceneBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
function initialMotion() {
  try {
    return localStorage.getItem("becoming-motion") !== "off";
  } catch {
    return true;
  }
}
function useReducedMotion() {
  const [r, set] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)"),
      f = () => set(q.matches);
    q.addEventListener("change", f);
    return () => q.removeEventListener("change", f);
  }, []);
  return r;
}

export default function App() {
  const [progress, setProgress] = useState(0),
    [motionPreference, setMotionPreference] = useState(initialMotion),
    [reading, setReading] = useState(
      () => new URLSearchParams(location.search).get("graphics") === "off",
    );
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [overlay, setOverlay] = useState<Overlay | null>(null),
    [year, setYear] = useState(1999),
    [selectedLocation, setSelectedLocation] = useState("hyderabad"),
    [rotation, setRotation] = useState(0),
    [structure, setStructure] = useState(0.5),
    [notice, setNotice] = useState("");
  const reduced = useReducedMotion(),
    motionEnabled = motionPreference && !reduced && !reading;
  const mainRef = useRef<HTMLElement>(null),
    dialogRef = useRef<HTMLDialogElement>(null),
    previousFocus = useRef<HTMLElement | null>(null);
  const scene = clamp(Math.round(progress), 0, story.length),
    current = scene > 0 ? story[scene - 1] : null,
    accent = current?.accent ?? "#d6b48b";
  const onReady = useCallback(() => setReady(true), []),
    onError = useCallback(() => {
      setFailed(true);
      setReady(false);
    }, []);
  const onSoftwareError = useCallback(() => {
    setReading(true);
    setNotice(
      "Graphics are unavailable here. Reading mode keeps the complete story and every interaction accessible.",
    );
  }, []);
  const showOverlay = useCallback((next: Overlay) => {
    previousFocus.current = document.activeElement as HTMLElement;
    setOverlay(next);
  }, []);
  const selectLocation = useCallback(
    (id: string) => {
      setSelectedLocation(id);
      showOverlay({ kind: "location", id });
    },
    [showOverlay],
  );
  useEffect(() => {
    document.body.dataset.motion = motionEnabled ? "on" : "off";
    document.documentElement.style.scrollBehavior = motionEnabled
      ? "smooth"
      : "auto";
  }, [motionEnabled]);
  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(t);
  }, [notice]);
  useEffect(() => {
    if (overlay && !dialogRef.current?.open) {
      dialogRef.current?.showModal();
      document.body.classList.add("dialog-open");
    }
  }, [overlay]);
  useEffect(() => () => document.body.classList.remove("dialog-open"), []);
  function closeOverlay() {
    dialogRef.current?.close();
  }
  function onDialogClose() {
    setOverlay(null);
    document.body.classList.remove("dialog-open");
    previousFocus.current?.focus({ preventScroll: true });
  }
  function navigate(id: string) {
    closeOverlay();
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: motionEnabled ? "smooth" : "auto" });
      el?.focus({ preventScroll: true });
    });
  }
  function changeReading(next: boolean) {
    const visible = story.find((c) => {
      const r = document.getElementById(c.id)?.getBoundingClientRect();
      return r && r.top <= innerHeight * 0.5 && r.bottom > innerHeight * 0.5;
    });
    const id = visible?.id ?? current?.id ?? "introduction";
    setReading(next);
    requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ behavior: "instant" }),
    );
  }
  function toggleMotion() {
    if (reduced) {
      setNotice(
        "Reduced motion follows your device preference. Every chapter and interaction remains available.",
      );
      return;
    }
    setMotionPreference((v) => {
      try {
        localStorage.setItem("becoming-motion", v ? "off" : "on");
      } catch {}
      return !v;
    });
  }
  useLayoutEffect(() => {
    let animation: gsap.core.Timeline | undefined, resizeTimer: number;
    const build = () => {
      animation?.scrollTrigger?.kill();
      animation?.kill();
      const elements = [
        document.getElementById("introduction"),
        ...story.map((c) => document.getElementById(c.id)),
      ].filter(Boolean) as HTMLElement[];
      const beats = elements.map((el, i) =>
        i === 0 ? 0 : Math.max(1, el.offsetTop - innerHeight * 0.08),
      );
      const proxy = { value: 0 };
      animation = gsap.timeline({
        onUpdate: () => setProgress(Number(proxy.value.toFixed(4))),
        scrollTrigger: {
          trigger: mainRef.current,
          start: 0,
          end: Math.max(1, beats.at(-1) ?? 1),
          scrub: motionEnabled ? 0.45 : true,
          invalidateOnRefresh: true,
        },
      });
      for (let i = 1; i < beats.length; i++)
        animation.to(proxy, {
          value: i,
          duration: Math.max(1, beats[i] - beats[i - 1]),
          ease: "none",
        });
      ScrollTrigger.refresh();
    };
    build();
    const resize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(build, 160);
    };
    window.addEventListener("resize", resize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", resize);
      animation?.scrollTrigger?.kill();
      animation?.kill();
    };
  }, [motionEnabled, reading]);
  function renderOverlay() {
    if (!overlay) return null;
    if (overlay.kind === "menu")
      return (
        <>
          <p className="overline">THE COMPLETE JOURNEY</p>
          <h2 id="overlay-title">Choose a chapter.</h2>
          <nav className="chapter-menu" aria-label="Chapters">
            <button onClick={() => navigate("introduction")}>
              <span>00</span>27 years of becoming.<i>↑</i>
            </button>
            {story.map((c) => (
              <button key={c.id} onClick={() => navigate(c.id)}>
                <span>{c.number}</span>
                {c.title}
                <i>→</i>
              </button>
            ))}
          </nav>
          <div className="overlay-actions">
            <button
              onClick={() => {
                changeReading(!reading);
                closeOverlay();
              }}
            >
              {reading ? "Return to cinematic mode" : "Use reading mode"} →
            </button>
            <button onClick={() => setOverlay({ kind: "profile" })}>
              Professional overview →
            </button>
          </div>
        </>
      );
    if (overlay.kind === "location") {
      const place = locations.find((p) => p.id === overlay.id);
      return (
        <>
          <p className="overline">A BIOGRAPHICAL COORDINATE</p>
          <h2 id="overlay-title">{place?.name}.</h2>
          <p className="lead">{place?.country}</p>
          <p>{place?.note}</p>
          <p className="fineprint">
            City-level association, not an exact campus, address or verified
            travel route.
          </p>
          <button
            className="line-button"
            onClick={() => navigate(place?.chapterId ?? "world")}
          >
            Go to this chapter <span>→</span>
          </button>
        </>
      );
    }
    if (overlay.kind === "timeline") {
      const milestones = getYearMilestones(year);
      return (
        <>
          <p className="overline">1999–2026 · THE LIVING TIMELINE</p>
          <h2 id="overlay-title">
            {year}
            <em> / a point in the story.</em>
          </h2>
          <div className="year-grid" aria-label="Select a year">
            {Array.from({ length: 28 }, (_, i) => 1999 + i).map((y) => (
              <button
                key={y}
                aria-pressed={y === year}
                onClick={() => setYear(y)}
              >
                {y}
              </button>
            ))}
          </div>
          <div className="year-result" aria-live="polite">
            {milestones.length ? (
              milestones.map((m) => (
                <article key={m.title}>
                  <small>{m.date}</small>
                  <h3>{m.title}</h3>
                  <p>{m.description}</p>
                  <button
                    className="line-button"
                    onClick={() => navigate(m.chapterId)}
                  >
                    Explore this chapter <span>→</span>
                  </button>
                </article>
              ))
            ) : (
              <article>
                <h3>A space for the real story.</h3>
                <p>
                  No specific milestone for {year} has been supplied. Nothing
                  has been invented to fill the gap.
                </p>
                <button
                  className="line-button"
                  onClick={() => navigate(chapterForYear(year))}
                >
                  Visit this part of the journey <span>→</span>
                </button>
              </article>
            )}
          </div>
        </>
      );
    }
    if (overlay.kind === "profile")
      return (
        <>
          <p className="overline">THE PROFESSIONAL ROUTE</p>
          <h2 id="overlay-title">The work, at a glance.</h2>
          <Suspense
            fallback={<p role="status">Opening the professional overview…</p>}
          >
            <StoryPanel
              kind="profile"
              onNavigate={navigate}
              motionEnabled={motionEnabled}
            />
          </Suspense>
        </>
      );
    if (overlay.kind === "about")
      return (
        <>
          <p className="overline">INDEPENDENT BY DESIGN</p>
          <h2 id="overlay-title">
            A real story.
            <br />
            <em>An original visual world.</em>
          </h2>
          <p>{biography.disclaimer}</p>
          <h3>Your pace. Your choice.</h3>
          <p>
            Scroll forward or backward. Use the year rail or chapter menu.
            Motion respects your device preference, and reading mode preserves
            the entire journey without WebGL.
          </p>
          <h3>What is real, and what is illustrative?</h3>
          <p>
            The biography comes from the supplied professional history. The 3D
            environments are original abstract art. Personal memories and
            photographs are clearly marked as awaiting real material.
            Demonstrations are local, deterministic and fictional.
          </p>
          <p className="fineprint">
            No analytics, external models or production systems. Only your
            motion preference is stored locally. Coastlines: Natural Earth,
            public domain.
          </p>
          <button
            className="line-button"
            onClick={() => {
              changeReading(!reading);
              closeOverlay();
            }}
          >
            {reading ? "Return to cinematic mode" : "Switch to reading mode"}{" "}
            <span>→</span>
          </button>
        </>
      );
    const chapter = chapters.find((c) => c.id === overlay.id);
    return (
      <>
        <p className="overline">
          CHAPTER {chapter?.number} · {chapter?.range}
        </p>
        <h2 id="overlay-title">{chapter?.title}</h2>
        <Suspense fallback={<p role="status">Opening the exploration…</p>}>
          <StoryPanel
            kind={chapter?.panelKind ?? "profile"}
            onStructureChange={setStructure}
            onNavigate={navigate}
            motionEnabled={motionEnabled}
          />
        </Suspense>
      </>
    );
  }
  return (
    <MotionConfig reducedMotion={motionEnabled ? "never" : "always"}>
      <div
        className={`app ${reading ? "reading-mode" : ""}`}
        style={{ "--accent": accent } as CSSProperties}
        data-scene={scene}
        data-renderer={
          reading
            ? "reading"
            : failed
              ? "software"
              : ready
                ? "webgl"
                : "loading"
        }
      >
        <a className="skip-link" href="#journey-controls">
          Skip to chapter controls
        </a>
        <div
          className={`visual-stage ${ready && !reading && !failed ? "is-ready" : ""}`}
          aria-hidden="true"
        >
          <FallbackScene progress={progress} />
          {!reading && failed && (
            <SceneBoundary onError={onSoftwareError}>
              <Suspense fallback={null}>
                <SoftwareScene
                  progress={progress}
                  motionEnabled={motionEnabled && !overlay}
                  globeRotation={rotation}
                  selectedLocation={selectedLocation}
                  structure={structure}
                  onSelectLocation={selectLocation}
                  onError={onSoftwareError}
                />
              </Suspense>
            </SceneBoundary>
          )}
          {!reading && !failed && (
            <SceneBoundary onError={onError}>
              <Suspense fallback={null}>
                <SceneWorld
                  progress={progress}
                  motionEnabled={motionEnabled && !overlay}
                  selectedLocation={selectedLocation}
                  onSelectLocation={selectLocation}
                  structure={structure}
                  globeRotation={rotation}
                  onReady={onReady}
                  onError={onError}
                />
              </Suspense>
            </SceneBoundary>
          )}
          <div className="stage-shade" />
          <div className="stage-grain" />
        </div>
        <div className="read-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress / story.length})` }} />
        </div>
        <header
          className={`site-header ${progress > 0.1 ? "is-scrolled" : ""}`}
        >
          <a
            className="wordmark"
            href="#introduction"
            onClick={(e) => {
              e.preventDefault();
              navigate("introduction");
            }}
            aria-label="Venkata, beginning of story"
          >
            Venkata<span> / 27</span>
          </a>
          <div className="header-tools">
            <button
              className="profile-shortcut"
              onClick={() => showOverlay({ kind: "profile" })}
            >
              Professional view →
            </button>
            <button
              className="motion-control"
              aria-pressed={motionEnabled}
              onClick={toggleMotion}
              aria-label={motionEnabled ? "Pause motion" : "Enable motion"}
            >
              <i aria-hidden="true" />
              {motionEnabled ? "Motion on" : "Motion off"}
            </button>
            <button
              className="menu-control"
              aria-label="Open journey menu"
              onClick={() => showOverlay({ kind: "menu" })}
            >
              <span>Index</span>
              <i aria-hidden="true">≡</i>
            </button>
          </div>
        </header>
        <main ref={mainRef} className="experience" id="experience">
          <section
            className="prologue"
            id="introduction"
            aria-labelledby="intro-title"
            tabIndex={-1}
          >
            <div className="prologue-meta">
              <span>A PERSONAL FILM, EXPLORED BY YOU</span>
              <span>1999 — 2026 / VOL. 01</span>
            </div>
            <div className="intro-copy">
              <p className="overline">VENKATA TARUN KUMAR MAVILLAPALLI</p>
              <h1 id="intro-title">
                <span>27 years</span>
                <em>of becoming.</em>
              </h1>
              <p className="intro-line">A life, still unfolding.</p>
              <a
                className="begin-link"
                href="#origins"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("origins");
                }}
              >
                <span>SCROLL TO BEGIN</span>
                <i aria-hidden="true">↓</i>
              </a>
            </div>
            <div className="intro-bottom">
              <span>HYDERABAD → THE WORLD</span>
              <p>Origins. Curiosity. Possibility.</p>
              <button
                onClick={() => showOverlay({ kind: "about" })}
                aria-label="About this independent personal experience"
              >
                INDEPENDENT PERSONAL EXPERIENCE <span>→</span>
              </button>
            </div>
          </section>
          {story.map((c, i) => (
            <section
              className={`chapter chapter-${c.id}`}
              key={c.id}
              id={c.id}
              aria-labelledby={`title-${c.id}`}
              tabIndex={-1}
              style={{ "--chapter-accent": c.accent } as CSSProperties}
            >
              <div className="chapter-content">
                <div className="chapter-counter">
                  <span>{c.number}</span>
                  <i />
                  <span>{c.range}</span>
                </div>
                <p className="chapter-location">{c.location}</p>
                <h2 id={`title-${c.id}`}>
                  {c.id === "continues" ? (
                    <>
                      The next chapter
                      <br />
                      <em>is still being written.</em>
                    </>
                  ) : (
                    c.title
                  )}
                </h2>
                {c.id !== "continues" && (
                  <p className="chapter-subtitle">{c.subtitle}</p>
                )}
                <p className="chapter-narrative">{c.text}</p>
                <button
                  className="line-button chapter-explore"
                  onClick={() => showOverlay({ kind: "chapter", id: c.id })}
                >
                  {c.interactionLabel}
                  <span>→</span>
                </button>
                {c.id === "world" && (
                  <div className="globe-controls">
                    <div className="rotation-controls">
                      <button
                        aria-label="Rotate globe left"
                        onClick={() => setRotation((r) => r - 0.35)}
                      >
                        ←
                      </button>
                      <span>ROTATE THE WORLD</span>
                      <button
                        aria-label="Rotate globe right"
                        onClick={() => setRotation((r) => r + 0.35)}
                      >
                        →
                      </button>
                    </div>
                    <div
                      className="location-controls"
                      aria-label="Select a location"
                    >
                      {locations.map((l) => (
                        <button
                          key={l.id}
                          aria-pressed={selectedLocation === l.id}
                          onClick={() => selectLocation(l.id)}
                        >
                          {l.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {c.id === "continues" && (
                  <div className="ending-actions">
                    <button onClick={() => showOverlay({ kind: "profile" })}>
                      Professional profile →
                    </button>
                    <a
                      href="https://github.com/VenkataTarunKumarMavillapalli/Portfolio_website"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub repository →
                    </a>
                    <a
                      href={`${import.meta.env.BASE_URL}professional-overview.txt`}
                      download
                    >
                      Professional overview ↓
                    </a>
                    <a href={`mailto:${biography.email}`}>
                      Start a conversation →
                    </a>
                    <button onClick={() => navigate("introduction")}>
                      Return to the beginning ↑
                    </button>
                    <p className="ending-disclaimer">{biography.disclaimer}</p>
                  </div>
                )}
                <span className="chapter-whisper" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")} / 09 · KEEP EXPLORING
                </span>
              </div>
            </section>
          ))}
        </main>
        <aside
          id="journey-controls"
          className={`journey-rail ${progress > 0.3 ? "is-visible" : ""}`}
          aria-label="Journey navigation"
        >
          <button
            className="year-trigger"
            onClick={() => {
              setYear(yearForProgress(progress));
              showOverlay({ kind: "timeline" });
            }}
            aria-label={`Open living timeline, current year ${yearForProgress(progress)}`}
          >
            <span>{yearForProgress(progress)}</span>
            <i aria-hidden="true">＋</i>
          </button>
          <div className="rail-track" aria-hidden="true">
            <i style={{ height: `${(progress / story.length) * 100}%` }} />
          </div>
          <span className="rail-chapter">
            {scene > 0 ? String(scene).padStart(2, "0") : "00"}
            <small> / 09</small>
          </span>
        </aside>
        <button
          className={`graphics-mode ${progress > 0.2 || failed ? "is-visible" : ""}`}
          onClick={() => changeReading(!reading)}
        >
          {reading
            ? "Cinematic mode →"
            : failed
              ? "Standard graphics · Reading mode"
              : "Reading mode"}
        </button>
        <dialog
          ref={dialogRef}
          className={`story-dialog ${overlay?.kind === "menu" ? "menu-dialog" : ""}`}
          onClose={onDialogClose}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              const r = e.currentTarget.getBoundingClientRect();
              if (
                e.clientX < r.left ||
                e.clientX > r.right ||
                e.clientY < r.top ||
                e.clientY > r.bottom
              )
                closeOverlay();
            }
          }}
          aria-labelledby="overlay-title"
        >
          <div className="dialog-top">
            <span>27 YEARS OF BECOMING</span>
            <button
              className="close-dialog"
              onClick={closeOverlay}
              aria-label="Close exploration"
            >
              ×
            </button>
          </div>
          <motion.div
            key={`${overlay?.kind}-${overlay?.id}`}
            initial={{ opacity: 0, y: motionEnabled ? 12 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionEnabled ? 0.3 : 0 }}
          >
            {renderOverlay()}
          </motion.div>
        </dialog>
        <div className={`notice ${notice ? "show" : ""}`} role="status">
          {notice}
        </div>
      </div>
    </MotionConfig>
  );
}
