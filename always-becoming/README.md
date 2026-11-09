# 27 Years of Becoming

A cinematic personal portfolio for Venkata Tarun Kumar Mavillapalli. This 2026 edition follows a continuous visual thread from Hyderabad through study, engineering, research, international public service and AI consultancy.

**This is a source project and a review build, not a published website.** Publication needs the content and technical review in [PUBLICATION_CHECKLIST.md](PUBLICATION_CHECKLIST.md). No deployment is implied by these files.

## Run locally

Use **Node.js 24** and the committed npm lockfile:

```bash
npm ci
npm run dev
```

Open the address printed by Vite. To check and preview the production output:

```bash
npm run check
npm run preview
```

`npm run check` runs TypeScript, Vitest and a production build. `npm run build` creates `dist/`. Serve that directory over HTTP; opening the source `index.html` directly from the filesystem is not supported. No API keys, account, backend or environment file is required by the application.

## Experience and implementation status

The [storyboard](docs/STORYBOARD.md) defines a prologue and nine chapters within one reversible, native-scroll journey. The current implementation uses React and TypeScript, Vite, GSAP ScrollTrigger, React Three Fiber / Three.js and Motion. It is not the older static seven-chapter site already in the repository.

The complete review implementation includes:

- A prologue and all nine chapters, chapter navigation, a living year selector for 1999–2026, professional overview and native dialogs.
- Accessible HTML location controls alongside a procedural globe, with city-level biographical associations rather than exact travel routes.
- A motion control, device reduced-motion handling, reading mode and a genuine Canvas 2D perspective-rendered 3D fallback when WebGL is unavailable. Add `?graphics=off` to open directly in reading mode.
- A downloadable professional overview and a printable profile. Neither is represented as the owner's uploaded formal résumé.
- Nine chapters of owner-supplied public biography and explicit empty slots for missing childhood stories, photos, interests, reflections and project details.
- Integrated memory archives, four service-workflow steps, learning strands, a mathematical structure control, data-quality inspection and the UN principles panel.
- Six working, local lab panels: source-grounded retrieval, analytics/relationships, forensic chronology, briefing preparation, a human-gated workflow and architecture/governance. Their records and behavior are deterministic and fictional.

**Review status:** all nine chapters and their panels are integrated, and the development-only chapter restriction has been removed. The software-rendered prologue → origins → globe transition passed forward/reverse visual review; all ten fallback poses were rendered at 1180 × 757. All six labs and all 28 timeline years were exercised in the browser. See [QA_REPORT.md](QA_REPORT.md) for exact coverage and remaining checks.

The completed review run, repeated after the mobile CSS and source-formatting changes, passed **232 tests across eight suites**, TypeScript and the production build. A separate clean source copy installed the committed lockfile with Node.js 24 using cached registry packages and passed the same checks. Coverage includes app reduced-motion/graphics-off/focus behavior, React panels, software drawing commands and journey geometry. `npm audit --omit=dev` reported zero vulnerabilities; that is not a security audit. Narrow browser layouts at 400 × 596 and 333 × 497 were inspected without horizontal dialog overflow, and mobile controls now follow natural page flow.

The production build was served under `/always-becoming/`: lazy JavaScript/CSS, the graphics fallback and printable profile loaded correctly. Actual-browser reading mode mounted no canvas and preserved the current chapter. All eight UN principles and their source example were exercised. Final production-browser input checks passed: pointer drag visibly rotates the globe, clicking the London marker opens its correct biographical dialog, and HTML rotation/city controls respond. An invisible SVG layer that intercepted pointer input was corrected; TypeScript, all 232 tests and the build passed again afterward.

The cloud test browser has WebGL disabled: actual GPU rendering, Safari, physical mobile devices, performance and context-loss recovery remain unverified. The WebGL dependency chunk also retains a size warning. **This is not a production-readiness claim.** See the QA report for recorded results and remaining release checks.

## Public content boundaries

This is an **independent personal project**, not an official United Nations, WFP or EFSA website. Institutional references do not imply endorsement. Abstract scenes are artwork, not photographs or reconstructions of institutional premises.

Every laboratory record is fictional and every demonstration runs locally. There are no model calls, production connections, internal documents, real investigations or real approvals. The source contains no analytics or tracking integration. The app stores only its motion preference locally; demonstrations are page-local state. The contact link opens the visitor's email client and does not send a message automatically.

The supplied historical WFP internship office wording is **Office of Inspections and Investigations**, flagged for owner verification. Do not silently replace it with the current consultancy's **Office of Inspector General**. Exact dates, role descriptions and public claims need final owner review.

Still missing: approved personal photographs, childhood and school stories, personal reflections and interests, detailed personal/research project descriptions, a verified LinkedIn profile and a formal résumé selected for this build. Empty fields are intentional. The repository link is known; a personal GitHub profile is a separate field and must not be inferred from it.

## Edit and maintain

- [Content editing](docs/CONTENT_EDITING.md): biography, photos, projects, links and synthetic examples.
- [Deployment](docs/DEPLOYMENT.md): standalone versus the existing repository's `always-becoming/` directory, manual Pages workflow and rollback.
- [Publication checklist](PUBLICATION_CHECKLIST.md): accuracy, privacy, browser QA and explicit release approval.
- [QA report](QA_REPORT.md): completed automated/browser checks and explicit verification limits.
- [Storyboard](docs/STORYBOARD.md): camera beats, interaction goals and visual validation gates.

`vite.config.ts` sets `base: './'`. Public downloads use `import.meta.env.BASE_URL`; preserve that convention. There is no SPA router dependency or history-path routing. Navigation uses section anchors and local state, so GitHub Pages does not need a custom rewrite or a copied `404.html`.

## GitHub integration

The intended destination is the existing repository's **`always-becoming/`** directory. Preserve its legacy root HTML, assets and other root files. The supplied workflow is a template at `.github/workflows/deploy-pages.yml`; when integrated, it belongs at the **repository root**, not inside `always-becoming/.github/`.

The workflow accepts a manual `workflow_dispatch` only. Its default is build-only; publication requires an explicit publish selection and the `github-pages` environment. Configure that environment's approval protections before any publication. A workflow file naming an environment does not itself add a required reviewer.

This source is prepared for an isolated public review branch. Main, repository settings and live deployment are outside this review change. Current remote inspection details and limitations are recorded in [Deployment](docs/DEPLOYMENT.md).

## Attribution

Bundled geographic coastlines are derived from Natural Earth public-domain data. Procedural scene geometry is abstract visual illustration. Do not add third-party photography, logos, fonts or models without checking their license and keeping appropriate credit.
