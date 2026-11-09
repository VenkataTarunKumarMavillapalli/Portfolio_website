# Review build: 27 Years of Becoming

**Testing completed: 8 November 2026. Status: complete review implementation, not a production certification. Prepared for a separate public source-review branch on 9 November 2026; live publication is not included.**

## What is implemented

- React/TypeScript, Vite, GSAP ScrollTrigger, Three.js/React Three Fiber and Motion.
- A full-viewport prologue followed by all nine chapters, with native, reversible vertical scrolling. Desktop uses a persistent art stage and restrained pinned reading; narrow screens use natural text flow so controls do not remain below a pinned viewport.
- Ten original procedural visual poses: brass aperture, archive, geographic globe, enterprise racks, mathematical surface, data columns, intelligence chamber, six connected laboratory systems, personal archive and final convergence. Hardware and software renderers share key geometry and geographic data; they are deliberately different quality tiers.
- A rotatable globe with seven city associations and equivalent HTML controls, 28 selectable years, a chapter index, professional view, printable profile and text overview.
- Working archive controls and honest empty photo/story slots; five learning strands and a mathematical parameter; a service workflow; an explicit data-cleaning exercise; eight intelligence principles; six local laboratory demonstrations.
- Pause motion, device reduced-motion handling, decorative graphics hidden from assistive technology, native dialogs, keyboard controls, visible focus, reading mode, error boundaries and a no-JavaScript link to the standalone profile.
- A manual-only GitHub Pages workflow, build-only by default, plus deployment/content-editing documentation. Repository environment protection must be configured separately.

## Verified automated checks

The final implementation passes `npm run check`: TypeScript, **232 tests in eight suites**, and the production build. The test configuration includes the scene geometry tests as well as the main tests directory.

Coverage includes biography and timeline consistency; all combinations of data-cleaning and governance rules; immutable synthetic records; source-grounded and unsupported answers; illegal workflow transitions; 26 React interaction cases; 11 App-level motion, reading-mode, navigation and focus cases; geometry and geographic sampling; and 35 software drawing/projection cases. Software checks cover all ten poses at desktop/narrow sizes, finite drawing commands, reversible output, static poses, parameter response and resource disposal.

A separate clean source copy installed the committed lockfile successfully with Node.js 24 (`npm ci --offline --no-audit --no-fund`, using previously downloaded registry packages) and passed the same typecheck, 232 tests and build. This was not a fresh GitHub Actions run.

`npm audit --omit=dev` reported **zero known production-dependency vulnerabilities** at review time. This is not a security audit. The production build retains a warning for the approximately 915 kB minified / 242 kB gzip WebGL dependency chunk. Graphics and story panels are separate dynamic imports; the warning has not been hidden by raising its threshold.

## Actual browser review

The managed Chromium browser was used, not merely source inspection. Vite development review was followed by a production build served under `/always-becoming/` to exercise relative asset paths and lazy chunks.

Desktop review covered approximately 1180 × 757 and 1172 × 745 CSS pixels. Narrow review covered 500 × 745, **400 × 596** and **333 × 497** through native window resizing and browser zoom. These are narrow desktop-browser viewports, not physical iOS/Android testing.

Observed results:

- The opening viewport contains the prologue only. At 1172 × 745, the origins section begins at y=745.
- All ten software-rendered chapter poses were visibly rendered. The aperture → archive → globe transition was observed forward and backward. Globe geography and HTML rotation controls respond.
- A final production-browser input retest passed after fixing an invisible SVG overlay that intercepted pointer input (`.fallback-scene { pointer-events: none; }`). DOM hit testing reached the canvas, pointer drag visibly rotated the globe, and clicking the London marker opened its correct biographical dialog. HTML rotation and city selection also passed. TypeScript, all 232 tests and the production build passed again after this fix.
- All nine chapter menu destinations work. All 28 year buttons were clicked and updated their selected year; unsupplied years remain explicitly empty.
- Archive Next and keyboard Left change the selected entry. Escape closes the native dialog and restores the originating control's focus. Repeated chapter/dialog navigation works.
- The service workflow reaches its fourth stage and resets. The cleaning exercise changes five issues to zero, retaining three rows, quarantining two and recording one duplicate removal.
- The six laboratory modules were exercised: exact fictional sources and unsupported-answer refusal; review filtering and relationship nodes; chronology order and source selection; briefing preparation/review followed by source-edit invalidation; explicit human approval before completion; governance checks followed by invalidation when a safeguard is removed.
- All eight intelligence principles were selected in the production build, and their supporting retrieval example works. The research slider responds to keyboard End and reaches 100 percent.
- Narrow archive and laboratory dialogs showed no horizontal overflow. The 333px relationship graph remained within its dialog. Mobile pinned content was changed to natural document flow after it was found to delay access to lower controls.
- Motion off/on and reading mode were used in the real browser. Reading mode mounts no canvas and preserves all ten sections. A subsequent fix preserves the visible chapter when switching modes; production checking retained the laboratory chapter at the same navigation offset.
- The production subpath loaded the application, graphics fallback and lazy story-panel CSS/JavaScript. The printable HTML profile opened at the nested path and rendered at narrow width. Download link paths were inspected; no email was sent.

The browser review observed genuine **Canvas 2D software-rendered output**, not validated WebGL output. Browser captures were used for local quality inspection and are not part of the source deliverable.

## WebGL boundary and performance limits

**Actual WebGL visual validation is unpassed.** The cloud Chromium environment reports `GL_VENDOR = Disabled` and `GL_RENDERER = Disabled`; Three.js cannot create its WebGL context. No GPU/security flags or browser restrictions were changed.

The application recovers to a genuine perspective/depth-sorted Canvas 2D renderer, with a final reading-mode path if graphics fail. Successful software output, numerical geometry tests and builds do not establish shader correctness, metal/reflection quality, hardware frame rate, context-loss recovery or physical-device behavior.

The WebGL implementation uses capped pixel ratios, reduced mobile geometry, demand rendering and a capped ambient update cadence while visible. The software renderer draws on input/resize/scroll changes and has no idle animation loop. These are implementation measures, **not measured performance guarantees**. No Lighthouse score, field Web Vitals, sustained frame-rate measurement or battery benchmark is claimed.

Before release, inspect actual WebGL in current Chrome, Firefox and Safari, plus a physical mobile device. Test low-power hardware, landscape, context loss, device reduced-motion settings and assistive technology. Automated reduced-motion checks mock the media query; the browser's motion toggle was tested separately. Native Escape/focus were exercised in Chromium; jsdom tests simulate native cancel/close behavior.

## Content, assets and publication

All laboratory records are fictional and deterministic. There are no model calls, real investigations, internal WFP/EFSA materials, institutional approvals, operational metrics or production-system access. Abstract architecture is not a reconstruction of an institutional workplace. The website is explicitly independent and unendorsed.

Missing items remain clearly labeled: personal photos and memories, interests/reflections, detailed personal/research projects, a verified LinkedIn profile and a formal résumé selected for this build. The text overview is not presented as an uploaded résumé. The historical WFP internship office wording and exact public role/date descriptions require owner review.

The official Enkis studio website was actually inspected for editorial pacing and restrained depth. Its code/assets were not copied. Instagram reels/profile content were not verified and are not claimed as viewed.

Remote baseline inspected: public repository `VenkataTarunKumarMavillapalli/Portfolio_website`, main `86d73c392af2471e9c9a17da334a2916daa7ea7a`. Actual Pages settings remain unverified. Existing documentation describes branch-based publication, so a remote push must not be assumed harmless. Follow [PUBLICATION_CHECKLIST.md](PUBLICATION_CHECKLIST.md) before public commits or release.
