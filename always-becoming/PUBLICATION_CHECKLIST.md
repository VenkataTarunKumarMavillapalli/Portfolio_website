# Publication checklist

This is a review checklist, not a claim that the site is ready or that every test has passed. Only mark an item complete after recording the evidence for the exact candidate revision. The application, downloads, source and documentation must all be suitable for public release. Consult [QA_REPORT.md](QA_REPORT.md) for the recorded test scope and results. Checked items below refer to the current review implementation, not live deployment approval.

## 1. Owner content review

- [ ] Confirm full name, public contact email, 2026 edition date and “27 years” framing. The edition is not an automatically updated age; no exact date of birth should be added.
- [ ] Review education and employment dates in the story, timeline, map, professional view, printable profile and text download together.
- [ ] Keep Amity's BTech, associated Birkbeck/Adelphi study experiences and the May–July 2019 Drexel internship distinct. Do not imply multiple degrees or an exact travel itinerary.
- [ ] Verify the historical WFP internship office label: the current brief says **Office of Inspections and Investigations**. Check the exact wording for October 2025–June 2026 before release. This is separate from the consultancy's **Office of Inspector General** wording from July 2026.
- [ ] Confirm that role descriptions accurately distinguish team contributions from individual ownership. Do not invent metrics, production adoption, awards or confidential responsibilities.
- [ ] Supply approved childhood/school stories, family influences, interests, memories and reflections, or consciously approve the explicit missing-content labels. Do not invent quotations or personal history.
- [ ] Supply approved personal photographs with descriptive alt text and captions, or approve keeping the empty archive. Remove location/private metadata and confirm permission for identifiable people.
- [ ] Supply exact personal/research project names, contribution, dates, outcomes and public links, or retain the clearly labeled placeholders.
- [ ] Supply and verify the LinkedIn profile and formal résumé, or retain the explicit unavailable state. A generated professional overview must not be labeled an uploaded formal résumé.
- [ ] Verify every external destination, including the portfolio repository, and confirm the public email may be published.

## 2. Independence and privacy

- [ ] Keep the independent-project disclaimer visible and available from the experience.
- [ ] State that the site is not official UN, WFP or EFSA material and that institutional references do not imply endorsement.
- [ ] Keep all demos labeled **fictional, local and deterministic**. Simulated approval/deployment does not authorize real action.
- [ ] Confirm no internal documents, case records, private endpoints, screenshots, record counts, investigation details, credentials or personal data appear in source, downloads, docs or build output.
- [ ] Confirm no real AI/model service, institutional system, analytics, tracking, external font or third-party data call was added without explicit review.
- [ ] Review asset licenses and public-domain geographic attribution.

## 3. Application and interaction review

- [x] The prologue → origins → globe transition passed forward/reverse visual review in the software renderer. The first-transition development restriction has been removed.
- [x] All nine chapter sections and all story panels are integrated.
- [x] Verify all nine chapter-menu destinations and all 28 year selections in the browser.
- [ ] Complete release review of all map destinations and external/download/contact actions. Download paths were inspected; no email was sent.
- [x] Exercise the archive Next/Left controls, Escape closure and focus return in the browser.
- [ ] Verify approved real photographs, captions and image-loading behavior when images are supplied; the current archive contains explicit placeholders.
- [x] Exercise globe HTML rotation controls in the browser; keep city-association labels distinct from exact campuses or journeys.
- [x] Complete the production-browser pointer retest after fixing the invisible SVG layer: hit testing reaches the canvas, drag visibly rotates the globe, and clicking London opens the correct biographical dialog. HTML rotation and city selection also pass. TypeScript, all 232 tests and the build passed again after the fix.
- [x] Exercise all four service-workflow steps in the browser.
- [x] Exercise the mathematical parameter in the production browser: keyboard End reaches 100 percent.
- [ ] Review learning-strand content and approved project details before release.
- [x] Exercise the data-quality panel in the browser: five issues become zero, with three retained records under the selected cleaning rules. Automated tests cover rule combinations and reset without invented missing values.
- [ ] Recheck data-quality controls and reset in the final production smoke test.
- [x] Select all eight UN principles in the production browser and exercise their supporting retrieval/source example.
- [x] Exercise all six lab modules in the browser: source display/unsupported-answer refusal, filtering, chronology, briefing invalidation, the explicit workflow review gate and governance invalidation.
- [ ] Recheck repeat/reset/rejection paths on the final production build; retain the automated invalid-transition regression tests.
- [x] Verify the explicitly labeled simulated human approval gate through browser exercise and automated state-transition tests.
- [x] Click all 28 years from 1999 through 2026 in the browser; keep the explicit no-supplied-milestone state for empty years.
- [ ] Test professional view, printable profile, text download, verified links and email-client behavior.

## 4. Technical and accessibility checks

- [x] Install the committed lockfile in a separate clean source copy with Node.js 24 using `npm ci --offline --no-audit --no-fund` and cached registry packages; pass the same TypeScript, 232 tests and build checks. This is not a fresh GitHub Actions run.
- [x] The latest completed run passed TypeScript, 232 tests in eight suites and the production build. App reduced-motion/graphics-off/focus, React UI, software drawing and journey-geometry coverage are included.
- [x] `npm audit --omit=dev` reported zero vulnerabilities. This does not constitute a security audit.
- [x] Rerun TypeScript, all 232 tests and the production build after mobile CSS changes and source formatting. Results are recorded in the QA report.
- [x] Serve the production build over HTTP under `/always-becoming/`, in addition to the Vite development review.
- [x] Load lazy JavaScript/CSS, the graphics fallback and printable profile at the production `/always-becoming/` subpath; inspect download paths.
- [ ] Recheck the chosen live hosting layout and actual downloads after an approved deployment. Local testing is not verification of GitHub Pages.
- [x] Inspect narrow browser layouts at 400 × 596 and 333 × 497 without horizontal dialog overflow; change mobile controls to natural document flow.
- [ ] Complete final-build desktop/narrow regression, mobile landscape and zoom checks. Physical mobile testing remains outstanding.
- [ ] Verify keyboard access, visible focus, focus return, Escape/backdrop close, repeated opens and reading order. Check screen-reader names and contrast.
- [ ] Test motion pause, reduced-motion preference and blocked local storage. No scroll interception, autoplay audio or mandatory intro.
- [x] Exercise the WebGL-unavailable software path and actual-browser reading mode; reading mode mounts no canvas, preserves the visible chapter and retains all ten sections.
- [ ] Test real-device WebGL initialization and context-loss recovery; the cloud browser cannot validate them.
- [x] Integrate the Canvas 2D perspective-rendered 3D fallback and render all ten poses at 1180 × 757; review the first transition in both directions.
- [x] Complete the recorded production-subpath/fallback-UI smoke checks, including lazy assets, profile, reading-mode chapter preservation and eight UN principles. Pointer dragging and marker selection also passed their final production-browser retest. Software-rendered evidence does not validate WebGL.
- [ ] Perform **actual-device WebGL QA** in current Chrome, Firefox and Safari, including at least one mobile device. The current cloud test browser has WebGL disabled and cannot validate the hardware-rendered experience.
- [ ] Record final visual quality, frame rate/interaction responsiveness and console/network errors. Passing unit tests does not prove GPU performance or formal accessibility compliance.

## 5. Repository and release gates

- [ ] Re-read the current remote head and compare against the reviewed baseline before preparing remote changes.
- [ ] Review the complete proposed diff. Intended app destination: `always-becoming/`; keep the legacy root site and unrelated files unchanged.
- [ ] Review replacement/removal of obsolete files **inside** `always-becoming/` separately. Do not silently carry old static bundles or old test claims into the new app.
- [ ] Keep the workflow at repository-root `.github/workflows/deploy-pages.yml`; the only trigger must be `workflow_dispatch`.
- [ ] Verify the actual Pages source, custom domain and current live site before any branch push or settings change. The connector did not verify Pages settings. An existing branch-based Pages configuration may publish on push even without a new push-triggered workflow.
- [x] Obtain approval for a separate public source-review branch.
- [ ] Obtain separate approval for live deployment. An approved draft or review branch is not publishing consent.
- [ ] Configure the `github-pages` environment with a required reviewer and appropriate branch protection. Naming the environment in YAML does not configure these protections.
- [ ] Review the workflow's build-only run and artifact. Leave **Publish** unchecked until owner/content/QA approvals are complete.
- [ ] When publication is approved, select the reviewed ref and correct app-directory mode, then manually publish through the protected environment.
- [ ] Verify the actual deployed URL, exact commit, required checks, root legacy site, nested new app, links and downloads after deployment. Do not announce a live URL based only on an expected pattern.
- [ ] Record the previous known-good revision and approved rollback path.

## Current limits

This source-review branch does not include a live deployment. All nine chapters, panels and the software-rendered fallback are integrated; the completed review checks are recorded above. The post-mobile-CSS/source-formatting rerun, clean Node.js 24 lockfile-install check and recorded production-subpath/fallback-UI smoke checks have passed. The final production-browser pointer-drag, London-marker, HTML rotation and city-selection checks passed after the input-layer fix, followed by another passing TypeScript/test/build run. Actual GPU rendering, Safari, physical mobile devices, performance and context-loss recovery remain unverified because the cloud test browser has WebGL disabled. Owner approval of missing/uncertain content and deployment settings also remain release gates. Consult [QA_REPORT.md](QA_REPORT.md) for final results; do not carry forward test claims from earlier portfolio versions.
