# Venkata Tarun — Personal Website

A personal portfolio and growing life archive, adapted from the supplied OIGI Next.js website. The original project remains separate.

## View the built website

The `out/` folder contains a complete static build. Node.js 20–22 is sufficient to run the included local preview; dependency installation is not needed for this step.

```sh
node scripts/preview.mjs
```

Open http://127.0.0.1:4177/. Stop the preview with Ctrl+C. If that port is occupied, use `PREVIEW_PORT=4178 node scripts/preview.mjs`.

Do not open `out/index.html` directly with a file:// URL: the exported routes and assets need an HTTP server.

## Develop and rebuild

```sh
npm ci
npm run dev
```

The development preview uses http://127.0.0.1:4177/. Stop the static preview first if it occupies that port.

```sh
npm run build
npm run typecheck
npm run preview
```

The production build exports six main pages, 12 detailed work pages, and a 404 page. The build also emits internal Next.js assets and route data.

## Add or change content

Most content is in `lib/content.ts`:

- `profile`: name, email and professional links.
- `work`: six professional roles and six résumé projects, with detailed descriptions and source references.
- `education`: three education programmes, their descriptions and subjects.
- `credentials`: seven certifications and professional programmes.
- `timeline`: generated from dated work, education and credential entries, plus the 2017 conference. Undated projects stay out of the chronology.

Biographical claims follow the supplied résumé. Editorial decisions are recorded in `docs/content-review.md`.

Home-page introductions and section copy live in `app/page.tsx`. Other section pages are under `app/`. Shared navigation and footer are in `components/layout/`. Responsive styling and design tokens are in `app/globals.css` and `tailwind.config.ts`.

The supplied résumé is available at `public/Venkata-Resume.pdf`; the portrait was extracted from that same résumé. Replace these assets when newer versions are available.

## What works

- A short home page with a portrait and direct navigation.
- Separate experience/project collections with search and detailed reading pages.
- A dedicated interactive timeline with category filters, date ordering, year jumps, individual details and expand/collapse all.
- Education, subjects, credentials, publication and conference details.
- Responsive navigation, keyboard focus, a skip link and reduced-motion support.
- Copy-email action, email link, professional profile links and résumé download.
- Redirects from earlier portfolio pages and consolidated work entries.

## Hosting

The deployment target is [GitHub Pages](https://venkatatarunkumarmavillapalli.github.io/Portfolio_website/). In the GitHub repository, editable source lives in `website/` and the generated static website lives at the repository root. The separate `always-becoming/` project and existing `assets/` are preserved.

To update the deployed site from a normal clone of `Portfolio_website`:

```sh
cd website
npm ci
npm run build:pages
npm run typecheck
node scripts/publish-pages.mjs
cd ..
git add .
git commit -m "Update personal portfolio"
git push origin main
```

`build:pages` applies the `/Portfolio_website` URL prefix, exports the website, adds `.nojekyll` so Next.js assets are served, and creates redirects for the previous portfolio URLs. `publish-pages.mjs` replaces only files tracked by `.pages-manifest.json`. It does not alter `always-becoming/`, `assets/`, or the editable source. GitHub's existing Pages pipeline publishes the root of `main`.

Use `npm run build` for a root-mounted static host instead. The preview script detects the Pages build prefix automatically. No custom domain is configured.

No database, backend, user accounts, analytics tracking, or email submission service is required. The contact action opens the visitor's email application; it does not claim to send a message itself.

## Design lineage

The site retains the original Next.js/React/TypeScript/Tailwind stack and blue accent. This revision uses smaller headings, lighter pages, straightforward lists and a short home page in response to the owner’s request for simplicity. OIGI-specific branding, password gate, request forms, local analytics, and sample ticket data are not included.

See `docs/content-review.md` for source conflicts and the information still to add, and `docs/validation.md` for the checks performed.
