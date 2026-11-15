# Validation

Validated on 15 November 2026.

- Production Next.js build passed, including TypeScript checking and static export.
- Rendered the provided PDF pages and inspected the source text and layout.
- Inspected the website in the connected browser at the desktop viewport.
- Verified mobile navigation and every page type at a measured CSS width of 375 pixels; no horizontal overflow or broken images were found.
- Verified combined project search and context filtering: 'Databricks' + 'Professional work' returned three expected EFSA entries.
- Verified no-results messaging and reset to all 22 entries.
- Verified navigation into a project page and its case-study content.
- Verified education timeline filtering, oldest-first ordering, and expandable details.
- Verified the copy-email interaction and success state, then restored the initially empty clipboard.
- No warning/error messages were returned by the browser log check.
- The résumé download points to the supplied PDF. No email was sent and no external profile or publication was modified.

The source and output files are separate from the original OIGI directory. The GitHub Pages production build and TypeScript checks passed. The previous GitHub version is retained on `backup/portfolio-before-2026-11-15`. Publication status is recorded in the chat after the deployment completes.

See the automated static-link check result in `static-check.json` for exported page counts, broken local references, and duplicate/missing headings.

- Removed diagonal upward arrows from buttons, cards, and external profile links.
- Added GitHub Pages base-path support for routes, JavaScript, CSS, portrait, favicon, and résumé.
- Added redirects for the six previous HTML section URLs.
