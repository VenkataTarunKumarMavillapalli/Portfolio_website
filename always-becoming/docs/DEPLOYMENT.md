# Deployment and repository integration

## Scope and current state

This document describes a future deployment. The current change is limited to a separate public source-review branch. It does not authorize or perform a Pages-setting change, merge to main or live publication.

The intended repository is [VenkataTarunKumarMavillapalli/Portfolio_website](https://github.com/VenkataTarunKumarMavillapalli/Portfolio_website). Read-only repository inspection on **8 November 2026**, with the main head and branch list rechecked on **9 November 2026**, found:

- Repository visibility: public. Default branch: `main`.
- `main` and `review/always-becoming-2026` both pointed to **`86d73c392af2471e9c9a17da334a2916daa7ea7a`**.
- Root tree: **`51f0144e7bc0b4057766a480bf3eb5353c9ed0de`**.
- Commit message: “Add Always Becoming site in an isolated review directory”, dated 7 November 2026.
- An existing `always-becoming/` tree already occupies the proposed app destination. Its tree SHA is `d1aed1a6f154fc211f4be43e61837d3d7fcbef3c`.
- The non-recursive root tree includes legacy `index.html`, `about.html`, `achievements.html`, `contact.html`, `experience.html`, `indivProject.html`, `projects.html`, `assets/` and legacy `main.*` bundles. There is **no root `.github/` directory** in that tree, so no checked-in Actions workflow is present at this ref.
- The connector rejected the Actions workflow-list endpoint as unsupported. Workflow inventory outside this checked-in tree, historical runs, active Pages settings, deployment source, custom domain and environment protections were **not verified**.

Sources: [baseline commit](https://github.com/VenkataTarunKumarMavillapalli/Portfolio_website/commit/86d73c392af2471e9c9a17da334a2916daa7ea7a), [baseline root tree](https://github.com/VenkataTarunKumarMavillapalli/Portfolio_website/tree/86d73c392af2471e9c9a17da334a2916daa7ea7a), [existing app README](https://github.com/VenkataTarunKumarMavillapalli/Portfolio_website/blob/86d73c392af2471e9c9a17da334a2916daa7ea7a/always-becoming/README.md).

**Before changing main or publishing, re-read the current head and actual Pages settings.** The existing README describes branch-based Pages from `main` / repository root, but that is documentation, not proof of the active setting. If branch-based Pages is enabled, pushing to that branch can publish immediately. A new manual workflow does not disable an existing publishing source.

## Proposed change boundary

The proposed integration, subject to review, is:

1. Replace the reviewed application's source/configuration/docs inside **`always-becoming/`** with this React/Vite project.
2. Add **repository-root `.github/workflows/deploy-pages.yml`** from the supplied template. GitHub does not discover workflows inside `always-becoming/.github/workflows/`.
3. Preserve legacy root HTML, `assets/`, `main.*`, other root files and repository settings.
4. Review obsolete old files inside `always-becoming/` explicitly before any deletion. The earlier project was directly served static HTML, so do not mix its `assets/content.js`, `assets/app.js`, previous preview tools or old test-report claims with the new TypeScript application.
5. Exclude `node_modules/`, `dist/`, TypeScript build-info files, temporary screenshots, caches and private review notes from source changes. Commit the lockfile with the source.

The existing remote `review/always-becoming-2026` branch is preserved. The new source-review branch is `review/27-years-cinematic-v4`, separate from both existing branches. Do not force-push, merge, alter the root site or invoke a deployment as a side effect of source preparation.

## Two supported layouts

### Existing repository: nested app

The repository keeps its existing website at the root and the new source under `always-becoming/`:

```text
Portfolio_website/
  index.html                         # existing legacy site, preserved
  assets/                            # existing legacy assets, preserved
  .github/workflows/deploy-pages.yml  # manual workflow at repository root
  always-becoming/
    package.json
    package-lock.json
    vite.config.ts
    src/
    public/
    docs/
    README.md
```

Select workflow **App directory: `always-becoming`**. Installation, checks and build run in that directory. The staged Pages artifact contains the legacy root static files plus the new `dist/` contents at `/always-becoming/`. The source directory itself is not uploaded as the new app.

The template stages root HTML/CSS/JS, common static image/text formats, `CNAME` if already present, and `assets/`. This covers the inspected legacy tree. If other root static directories have since appeared, review them and deliberately update the staging allowlist. It does not indiscriminately publish the entire checkout.

If default GitHub Pages project hosting is enabled without a custom domain, the **expected, unverified pattern** is:

```text
https://venkatatarunkumarmavillapalli.github.io/Portfolio_website/always-becoming/
```

Do not present that pattern as a confirmed live link. The actual deployment URL and routing must be checked after approved publication. Keep the trailing slash on directory URLs.

### Standalone app at repository root

If the project is intentionally used in a separate standalone repository, put `package.json`, `src/`, `public/` and `vite.config.ts` at that repository's root, with the workflow in root `.github/workflows/`.

Select **App directory: `.`**. The workflow stages only `dist/` at the Pages artifact root. It does not preserve another legacy root site in this mode. A project repository is served beneath its repository name; an account homepage or custom domain may use `/`. This layout is optional documentation, not an instruction to replace the current repository root or create a new repository.

## Asset paths and routing

`vite.config.ts` uses **`base: './'`**. Vite-generated scripts and styles resolve relative to the built entry point, so the same build can be served from a repository subpath.

- Use source imports for bundled application assets.
- Use `import.meta.env.BASE_URL` for files in `public/`, as the professional-overview links do.
- A file at `public/images/example.webp` is referenced as `images/example.webp` relative to the app base, not `/images/example.webp`.
- Preserve relative links inside `public/profile.html` and other static documents.
- Do not introduce leading-root `/assets/` or repository-specific hardcoded asset URLs.
- This app has no SPA router dependency or path-based routes. Chapter navigation uses anchors and page state. No catch-all server rewrite or copied `404.html` is required.
- Serve production files with HTTP. The source `index.html` depends on Vite and is not a self-contained `file://` preview.

The app requires no environment variables, API keys, hosting secrets, analytics service or backend. GitHub supplies the workflow token/OIDC for an explicitly approved Pages deployment; never add a personal access token to source.

## Manual workflow behavior

The only event in `.github/workflows/deploy-pages.yml` is `workflow_dispatch`. There are no push, pull-request, scheduled or workflow-completion triggers.

A manual run:

1. Checks out the selected ref.
2. Installs **Node.js 24** and runs `npm ci` with the committed lockfile.
3. Runs TypeScript, tests and `npm run build` as separate steps.
4. Stages the selected layout without publishing app source or `node_modules`.
5. Uploads a `github-pages` artifact retained for seven days.
6. **Skips deployment by default.** Only when the manual **Publish** checkbox is selected can the deploy job use `pages: write` and `id-token: write`.
7. Runs that deploy job in the **`github-pages` environment**.

Configure a required reviewer and appropriate branch policy on `github-pages` before using Publish. The YAML environment declaration does **not** create approval rules. The explicit checkbox and environment review are separate gates. Do not describe this as enforced human review until the repository setting has been checked.

A manual workflow normally must exist on the repository's default branch before its Run workflow control appears. Landing the workflow itself is a remote change and needs its own reviewed diff. Do not merge application changes simply to expose a Run button.

## Before an approved first publication

1. Complete [PUBLICATION_CHECKLIST.md](../PUBLICATION_CHECKLIST.md), including exact role wording, missing-content decisions and browser QA.
2. Verify current branch/head, existing Pages source, live URL and domain. Record the previous known-good revision.
3. Review the proposed source changes and any workflow/settings changes. No existing site should disappear unintentionally.
4. If authorized to use Actions publishing, configure **Settings → Pages → Build and deployment → Source: GitHub Actions**. Changing the publishing source is not part of this documentation task.
5. Configure and verify `github-pages` reviewer/branch protections. Do not accept unrelated permission prompts or introduce persistent credentials.
6. Run the workflow with Publish **unchecked**, correct app directory and reviewed ref. Review the build/test results and staged artifact.
7. After explicit live-publication approval, run with Publish checked and approve the environment deployment through the configured reviewer.
8. Verify the exact deployed commit and actual URL. Check the preserved root site, nested experience, lazy chunks, downloads, print profile, link targets and a hard refresh.

GitHub documentation: [publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [deployment environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment).

## Local and browser verification

From the app directory:

```bash
npm ci
npm run check
npm run preview
```

Use the URL printed by the preview server. For subpath testing, serve an isolated temporary document root containing `dist/` under a directory such as `Portfolio_website/always-becoming/`, then test that exact path and its trailing slash. Do not test by renaming or overwriting the live repository's legacy root files.

All nine chapters and their panels are integrated. The genuine Canvas 2D perspective-rendered 3D fallback passed the first transition in both scroll directions, and all ten poses were rendered at 1180 × 757. All six labs and all 28 years were browser-exercised; narrow layouts at 400 × 596 and 333 × 497 were inspected without horizontal dialog overflow. The completed run after mobile CSS/source-formatting changes passed TypeScript, 232 tests across eight suites and the build; `npm audit --omit=dev` reported zero known production-dependency vulnerabilities. A separate clean source copy installed the committed lockfile using Node.js 24 and cached registry packages, then passed the same checks. This was not a GitHub Actions run.

The production build loaded under `/always-becoming/`, including lazy JavaScript/CSS, the software renderer and printable profile. Actual-browser reading mode mounted no canvas and preserved the visible chapter; all eight UN principles and their source example were exercised. The final production-browser pointer retest passed after correcting an invisible SVG input layer: canvas hit testing, visible globe rotation by drag, London-marker selection and HTML globe controls all worked. TypeScript, all 232 tests and the build passed again afterward. The large WebGL dependency chunk retains a build-size warning. The cloud test browser has WebGL disabled. Actual GPU rendering, Safari, physical mobile devices, performance and context-loss recovery remain unverified. Read [QA_REPORT.md](../QA_REPORT.md) for exact completed coverage and final results. These review results do not authorize publication or establish production readiness.

## Rollback

Keep the previous known-good deployment and source SHA before publication. An approved rollback can redeploy that known-good ref through the same manual workflow, provided its source layout and workflow are compatible. If rolling back to the old branch-published static site requires a Pages-source change, review and authorize that change separately.

Do not use a force push or delete unrelated legacy files to roll back. After any rollback, verify both the root site and nested app and record the deployed revision. A rollback is another live action, not automatic cleanup.
