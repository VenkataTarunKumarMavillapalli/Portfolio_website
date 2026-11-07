# Venkata — Always Becoming

A cinematic, interactive personal autobiography. **27 years of life. Not the final form.**

The 2026 edition follows Venkata Tarun Kumar Mavillapalli through Hyderabad, international study, enterprise engineering, research, product development, EFSA and AI work at WFP / OIG.

## Open it

Unzip this project and open `index.html` in a current desktop browser. There is no installation step, build process, account, API key or backend. The separate `Venkata-Always-Becoming.html` delivery is a fully self-contained preview of the same experience.

For a local web server, use either:

```bash
npm start
# Open http://127.0.0.1:4173
```

or:

```bash
python -m http.server 8000 --bind 127.0.0.1
# Open http://127.0.0.1:8000
```

`npm start` requires Node.js 18 or newer. It does **not** require `npm install`.

## Publish on GitHub Pages

1. Create a repository, for example `venkata-portfolio`. A public repository is the simplest GitHub Free setup.
2. Upload the **contents** of this extracted folder. `index.html`, `assets/`, `profile.html` and `.nojekyll` must be at the repository root—not inside another `venkata-in-the-making` folder. Commit to `main`.
3. Open the repository’s **Settings → Pages**.
4. Under **Build and deployment**, set **Source → Deploy from a branch**.
5. Select **main** and **/(root)**, then **Save**.
6. Open the published address shown by GitHub. The expected project-site pattern is:

```text
https://YOUR-GITHUB-USERNAME.github.io/venkata-portfolio/
```

All asset paths are relative, so the site supports a project-repository subpath without configuration changes. No Actions workflow is necessary for this static build. Do not upload only the ZIP; upload its extracted contents.

For an account homepage, use the repository name `YOUR-GITHUB-USERNAME.github.io` instead. The same files work.

Official GitHub publishing instructions:

```text
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
```

**The delivered project has not been pushed to your account or deployed.** GitHub account settings, custom domains and public publication are still your actions.

## Explore the experience

- **The opening sculpture:** live 3D geometry that morphs between Thread, Orbit and Become. Pointer movement changes its orientation. WebGL is preferred; a real, animated Canvas 3D-projection fallback preserves the three shapes without WebGL.
- **Seven life chapters:** a keyboard-accessible timeline with original generative artwork, milestones, previous/next controls, optional 11-second chapter playback and local-device narration when a suitable voice exists.
- **Coordinates:** an interactive globe using bundled public-domain land data. Select locations, drag horizontally or use the rotation arrows. Each place links to its chapter. Connections represent biographical associations, not exact travel itineraries.
- **The WFP chapter:** a personal perspective on source traceability, context and human responsibility. It is not institutional policy or an official publication.
- **Four working miniatures:** inspect a fictional source, filter synthetic analytical data and download CSV, select events in a fictional timeline, and run a workflow that stops for human approval.
- **The person:** Venkata professionally, Tarun within the family; abstract identity artwork instead of invented portraits.
- **Professional overview:** a fast alternative to the narrative, downloadable text and a printable document. The browser’s print dialog can save it as PDF.
- **Ask the archive:** a deterministic local guide to the supplied biography. It is explicitly **not** a live AI assistant. Unknown questions are not answered with invented facts.

The Motion control pauses ambient movement. Device reduced-motion preferences are respected. No autoplay audio, scroll interception or mandatory introductory loader.

## Edit the content

| File | What to edit |
| --- | --- |
| `assets/content.js` | Biography chapters, locations, project descriptions, guide answers, email and verified social URLs |
| `index.html` | Hero copy, fixed section headings, personal philosophy text, the 2026 / 27-year edition labels and institutional disclaimer |
| `assets/app.js` | UI behaviour, synthetic demos, and the concise `experience` / `education` arrays used in the professional overview |
| `assets/styles.css` | Colours, typography, spacing, responsive layouts and animation treatment |
| `assets/motion.js` | 3D sculpture, chapter artwork, globe projection and motion controls |
| `assets/land.js` | Bundled map coastlines and points; normally leave unchanged |
| `profile.html` / `professional-overview.txt` | Static, script-free versions of the professional overview; keep in sync when editing career details |

Most editorial changes belong in `content.js`; some fixed landing-page copy is intentionally authored in `index.html`. The profile summary is separately curated in `app.js`. Changing one file does not automatically rewrite the other copies.

The contact email is taken from the supplied résumé. Review it before publication. `linkedin` and `github` are blank because exact verified profile URLs were not supplied. Their links are omitted automatically until full `https://...` URLs are added.

The “27” is an **edition marker for 2026**, not an automatically updated age. The site deliberately does not publish a precise date of birth.

## Adding personal photography

The delivered artwork is abstract and generated in code. No photographs of Venkata, childhood, family or real events have been fabricated. Replace an abstract chapter panel with a real image only after choosing an appropriate photo and confirming permission to publish it. Give the image meaningful alternative text and remove private metadata before publishing.

Early life is intentionally restrained because detailed childhood memories have not been supplied. Do not fill that gap with invented anecdotes, quotations or achievements.

## Regenerate the single-file preview

After changing the source, run:

```bash
python tools/build-preview.py
```

The output is `Venkata-Always-Becoming.html` in the parent folder. To choose a destination:

```bash
python tools/build-preview.py ./preview.html
```

This embeds the existing CSS, JavaScript, map data and favicon. No network access or third-party Python packages are used.

## Check JavaScript syntax

```bash
npm run check
```

See `TEST_REPORT.md` for the browser checks actually performed on this delivery. Syntax checking alone is not a replacement for those interaction and visual checks.

## Privacy and publication boundaries

The site contains no tracking, analytics, cookies, externally hosted fonts, model API calls or live institutional connections. Its only persistent application storage is the motion preference in `localStorage`; the code handles browsers where storage is unavailable. The guide’s questions remain in page memory until the page is closed or reloaded.

Narration uses only local English voices reported by the browser, and only after the visitor presses Listen. Voice availability varies. Email links open the visitor’s own email application; there is no contact-form server.

All investigation-related examples are fictional. Internal record counts, private endpoints, real case data, internal screenshots and proprietary evidence are excluded. The public role description and high-level work descriptions still deserve the owner’s publication review. See `PUBLICATION_CHECKLIST.md`.

A private repository is not a guarantee that its GitHub Pages site is private. Treat the published site, its source, downloads and comments as public.

## Technical choices

This is a static HTML/CSS/JavaScript implementation rather than a server-rendered React application. Native WebGL, Canvas, SVG and CSS deliver the visual treatment without runtime package dependencies, third-party CDNs, build infrastructure or hosting secrets. A three-dimensional fallback is part of the product, not a screenshot of the main visual.

The application is intended for current browsers. Six viewport widths were tested in Chromium emulation; physical iPhone/Safari testing, a formal accessibility audit and live GitHub deployment were not performed in this session.
