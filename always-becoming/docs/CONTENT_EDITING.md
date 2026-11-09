# Editing content safely

The source deliberately separates supplied biography from fictional demonstrations and abstract visual art. Missing information is explicit rather than filled with plausible stories. Keep that distinction in edits and in the downloadable profile.

## Content map

- **`src/data/biography.ts`**: names, 2026 edition metadata, public email, institutional disclaimer, chapter copy and milestones, city associations, memory slots, learning strands, year entries and lab descriptions.
- **`src/lib/demoData.ts`**: invented records, exact fictional sources and deterministic demonstration logic. This is not a place for real case information or institutional documents.
- **`src/App.tsx`**: journey layout, UI labels, dialogs, controls, link presentation and some professional/hero copy. Review fixed strings as well as the data file.
- **`src/components/StoryPanels.tsx`**: integrated chapter interactions, memory archives, professional profile and all six lab panels. Check the component before assuming a new data field automatically appears in the UI.
- **`src/components/FallbackScene.tsx`**: lightweight static visual used beneath the renderers and in reading mode.
- **`src/scene/SceneWorld.tsx`**, **`src/scene/ChapterStructures.tsx`**, **`src/scene/geometry.ts`**, **`src/scene/journeyGeometry.ts`**, **`src/scene/locations.ts`**: WebGL world, chapter forms, camera/geometry and scene-location coordinates. Some scene coordinates are separate from the biography's location descriptions; keep them consistent.
- **`src/scene/SoftwareScene.tsx`** and **`src/scene/softwareGeometry.ts`**: Canvas 2D perspective-rendered 3D fallback. Keep its chapter poses, globe controls and motion behavior consistent with the main experience.
- **`src/styles.css`**, **`src/components/panels.css`**: type, layout, contrast and responsive styles. Motion changes need reduced-motion and mobile checks.
- **`public/profile.html`** and **`public/professional-overview.txt`**: separate, manually maintained profile copies. They are not automatically regenerated from the TypeScript data.
- **`index.html`**: document title and metadata. Review when changing public positioning.
- **`docs/STORYBOARD.md`**: intended nine-chapter visual narrative. It is a plan, not proof of integrated or tested behavior.

## Biography and dates

Update all matching chapter, milestone, timeline, location, professional-view and download copies together. Keep `chapters[].id` stable where possible: section navigation and scene associations depend on it. Check `src/lib/journey.ts` if changing chapter order or date coverage.

- “Venkata” is the professional name; “Tarun” is the family-used name. The existing `familyName` field is a display convention, not an instruction to reinterpret the surname.
- “27” and “2026” describe this edition. They are not computed from a precise date of birth. Do not publish a precise birth date without an explicit decision.
- Amity's BTech is one degree. Birkbeck and Adelphi are associated study experiences. The Drexel internship is a separate May–July 2019 experience.
- The current brief calls the historical WFP internship office **Office of Inspections and Investigations**. This wording is flagged for owner verification before publication. Do not replace it with the consultancy's **Office of Inspector General** label merely for consistency.
- Preserve the difference between individual contribution, team delivery and an institution's work. Do not add performance metrics, deployments or operational responsibility without approved support.

The year selector deliberately includes years without supplied milestones. Add a `timelineEntries` item only for a supplied event; do not fabricate an annual milestone to fill the timeline.

## Missing personal material

`memorySlots` contains explicit empty entries for childhood, school, family influences, early interests, important moments, personal milestones, photographs, interests, reflections and meaningful experiences. An empty `src`, `story` or caption is intentional.

To add an approved photograph:

1. Choose an image the owner may publish. Check consent for identifiable people and any sensitive setting.
2. Remove unnecessary EXIF/location metadata and crop private information from the image itself.
3. Resize and compress for the web. Prefer a reasonable-size WebP/JPEG rather than an original camera file; visually review the result.
4. Put the file under `public/images/`, for example `public/images/naples-2024.webp`.
5. Set the matching memory slot's `src` to **`images/naples-2024.webp`**, without a leading slash or `public/` prefix.
6. Write meaningful `alt`, an approved `caption` and an owner-supplied `story`. Avoid identifying other people or exact private locations unnecessarily.
7. Test loading at the repository subpath, keyboard navigation, captions, dialog closure and mobile layout. Check that the panel joins the path to `import.meta.env.BASE_URL`.

Do not substitute AI-generated portraits, fictional childhood scenes or invented quotations for missing personal material. Abstract stage art may remain abstract, but must not be presented as documentation of real memories.

## Education, research and personal projects

Learning strands intentionally leave detailed research, Italdesign/Ideneers and personal project descriptions pending. To replace a placeholder, obtain the actual title, dates, public description, individual contribution, permitted images, public link and approved outcome.

A synthetic lab module illustrates a field of work. It is not a portfolio case study of a production system. Do not rename a fictional module after an internal system or imply deployment through a visually convincing interface.

## Links, contact and résumé

`biography.linkedin`, `biography.github`, `biography.repository` and `biography.formalResume` may be empty. Some current links are separately authored in `App.tsx`; check both places when integrating a verified value.

The known repository is `https://github.com/VenkataTarunKumarMavillapalli/Portfolio_website`. This does not by itself establish a separately verified LinkedIn link or authorize inventing profile URLs.

- Use exact, verified HTTPS destinations. Omit or clearly label unavailable links instead of using `#` or a fake URL.
- Review the public email with the owner. A `mailto:` link opens the visitor's email client; there is no contact-form service.
- The generated text/print profile is a **professional overview**, not an uploaded formal résumé.
- Add a formal résumé only when the owner supplies and approves the public file. Check it for phone numbers, addresses or other details the owner may not want on a public site.
- Keep file paths relative to the app base and verify downloads from `/Portfolio_website/always-becoming/` as well as a standalone root.

## Synthetic demonstrations

All source text and records in `demoData.ts` are invented. Keep `DEMO_NOTICE` visible in each applicable interaction and maintain the independent-project disclaimer.

The available logic demonstrates:

- Prepared source-grounded answers with exact source text and an unsupported-question response.
- Explicit name normalization, invalid-row quarantine and duplicate handling. Missing counts are not guessed.
- Filtered analytics and labeled relationship edges. A label or mention is not evidence of responsibility or an allegation.
- Chronology with UTC timestamps, source text, observation and a separate limitation.
- Deterministic briefing statements from selected sources, with citations and limitations.
- A state machine that cannot complete without an explicit simulated approval; invalid/repeated actions do not bypass the gate.
- Governance checks for source trail, scoped access and human review. Passing them is not a security audit or real deployment authorization.

Do not add API calls, model prompts, credentials, real records, private endpoints or institutional assets. The app has no live AI or production access. Changing example text requires checking that exact-source citations, counts and tests still agree.

## Independence and motion

Keep the disclaimer that this is an independent personal project, not an official United Nations, WFP or EFSA website, with no implied endorsement. Abstract architecture is not a reconstruction of institutional offices.

Preserve native scrolling, motion pause, reduced-motion behavior, keyboard alternatives and access to content without WebGL. Do not make biography or controls depend on a 3D hit target alone. The software-rendered fallback is integrated. All ten poses and the first transition in both directions have been reviewed, but edits to geometry or layout still require fallback regression checks. Software-rendered results do not establish WebGL quality or context-loss recovery.

## Verify an edit

```bash
npm run check
npm run preview
```

Record what actually passed. Check the edited story panel and every duplicate in the profile/downloads. Test keyboard operation, repeated actions, reset/close, mobile layout, reading mode and reduced motion on the production build.

The current review implementation passed 232 tests across eight suites, TypeScript and the build after the mobile CSS/source-formatting changes. A clean Node.js 24 source-copy install from the lockfile passed the same checks. Production-subpath lazy assets/profile, actual-browser reading-mode chapter preservation and all eight UN principles were also checked. The final production-browser pointer-drag, London-marker and HTML globe-control checks passed after an input-layer fix; TypeScript, all 232 tests and the build passed again afterward. Refer to [QA_REPORT.md](../QA_REPORT.md) for recorded results instead of assuming these counts apply after later edits.

A passing test suite or build does not validate content accuracy, consent to publish or actual-device rendering. The cloud test browser has WebGL disabled; actual GPU rendering, Safari, physical mobile devices, performance and context-loss recovery remain unverified. Complete the remaining gates in [PUBLICATION_CHECKLIST.md](../PUBLICATION_CHECKLIST.md) before public source changes or deployment.
