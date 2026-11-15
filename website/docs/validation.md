# Validation — simplified résumé-based portfolio

## Project code links and contact simplification — 15 November 2026

- Production GitHub Pages build and TypeScript checks passed; all 42 exported HTML pages passed local link, asset, anchor and heading checks.
- Verified all six project GitHub destinations are accessible and exactly match the résumé annotations. Each project card and detail page includes a new-tab code link with `noopener noreferrer`.
- Confirmed the Projects filter shows all six code links; the Data Analyst Agent detail link works. Experience entries do not receive project repository links.
- Removed the email action buttons and unused client component. The email address remains a working mailto link.
- Desktop Work and Home and mobile Work, project detail, Contact, Home, Learning and Timeline were inspected. All checked mobile routes fit at 375 CSS pixels without horizontal overflow or broken images. No browser errors were observed.
- Refined glass gradients, blurred surfaces and border highlights without changing page structure. Added reduced-transparency fallbacks for the enhanced surfaces.
- Public résumé PDF is byte-for-byte unchanged for this update; the original desktop résumé was not edited.

15 November 2026.

- Production build and TypeScript checks passed after the layout and content rewrite.
- Compared the rewritten content against all three pages of the supplied résumé. Work entries now cover six roles and six résumé projects.
- Verified the 17-event timeline: Work filter returns six entries; Education returns three; oldest-first orders work start years 2019, 2021, 2024, 2025.
- Verified expand all, collapse all and individual event expansion. Verified year navigation moves focus and scrolls to the selected year.
- Verified project search, the no-results message and clearing search back to six projects.
- Verified mobile navigation opens and closes on navigation.
- Inspected the home page and timeline visually.
- Checked all six main pages and the WFP detail page at a measured CSS width of 375 pixels: no horizontal overflow, broken images or duplicate H1 headings.
- No email was sent. The résumé and professional links are the previously supplied assets and destinations.
- Static route, asset, anchor and heading checks are recorded in `static-check.json`.

GitHub Pages publication and live verification are reported in the chat once the deployment completes. Earlier pages are retained in Git history, and prior public URLs have redirects where content was consolidated.

## Approved homepage, name and biography update — 15 November 2026

- Production GitHub Pages build and TypeScript checks passed.
- Full name verified in shared headers, footers, page titles and legacy redirect titles.
- All six main pages and the WFP detail page checked on mobile; navigation opens and closes correctly.
- Responsive widths of 358, 375, 769, 901 and 1280 CSS pixels checked with no horizontal overflow or clipped names.
- Desktop and mobile homepage and About layouts inspected visually.
- Static name and local-link checks passed for all 41 exported HTML files.
- The owner approved publication after reviewing the updated draft.

## Consultant role, résumé titles and homepage H1 — 15 November 2026

- Production GitHub Pages build and TypeScript check passed.
- Static links, assets, anchors and headings passed for all 42 exported HTML pages.
- All 19 main and work-detail pages contain one visible occurrence of the full name, in the shared header. Metadata and portrait alternative text retain the name.
- Seven experience entries use matching titles in Work cards, detail headings and Timeline. Existing titles were checked against the supplied résumé; the consultant title and July 2026–present dates were supplied by the owner.
- Timeline shows 18 total events and seven Work events. Verified the new consultant entry is first in newest order and last in oldest order, its details expand, and its detail-page link works.
- Checked the homepage, About, Work, Timeline, consultant detail and longer WFP/EFSA detail headings at 375 CSS pixels with no overflow or broken images. Desktop homepage inspected visually.
- Homepage H1 is exactly “Enterprise AI Engineer & AI Solutions Architect”.

## Role detail, contact, credential links and glass surfaces — 15 November 2026

- Production build and TypeScript check passed. All 42 exported HTML pages passed local asset/link/anchor/heading checks.
- All five credential URLs match the original PDF annotations exactly and returned HTTP 200. Learning titles and verification links open the provider in a new tab; expanded Timeline certification entries expose the same URLs.
- No old email remains in generated HTML, scripts or route data. Contact mailto and copy actions use the new email.
- Eight main/detail routes checked at 375 CSS pixels with no horizontal overflow or broken images. Desktop and 769-pixel tablet layouts inspected; responsive overrides reset after testing.
- Verified mobile navigation, contact copy status, certification timeline filtering/expansion and five outgoing credential links. No browser errors observed.
- Removed WFP operational figures and scope from the earlier internship description. The expanded consultant narrative stays at public professional-focus level. No institutional reference content was copied into the portfolio.
- Rebuilt the public résumé from verified portfolio information as a clean two-page PDF, with only public role summaries, education, credentials and project names. Both pages were rendered and visually inspected. The five original certification links are included; no confidential WFP operational details are present.
- Confirmed the original desktop résumé is byte-for-byte unchanged from the original supplied copy. It is not the public download.
