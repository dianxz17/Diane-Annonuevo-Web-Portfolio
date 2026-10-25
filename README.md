# Portfolio

Existing buildless HTML, CSS, and JavaScript portfolio. Serve **dist/** as the web root. The existing navigation, footer, theme switch, typography, and unrelated page renderers are preserved.

## CEEL 301 coursework

The four completed projects live in **dist/data.js**, with two Prelim and two Midterm entries. The shared **dist/projects.js** renderer handles cards, metadata search, academic period buttons, project details, and a keyboard-accessible image dialog. Home uses the same cards for selected work.

- Apple of My Eye: Activity 1; traditional illustration.
- PUR-DYN — Personal Brand Identity: Activity 2, verified on the sketch; Adobe Photoshop verified in workstation screenshots.
- Typography & Advertising Poster Studies: Activities 4 and 5; the original PDF is preserved alongside its rendered preview. No software or exact drawing medium is claimed without evidence.
- Tech Week Digital Marketing Campaign: Activity 3, verified on its sketch; Canva verified in its workstation screenshot.

All coursework is dated **2026**, supported by the photographed identification and/or supplied academic context. The campaign designs retain “Tech Week 2025” in their original event artwork; the Activity 3 sketch is dated September 1, 2026. The detail page explains this without altering the artwork.

## Assets and provenance

**dist/assets/ceel/** contains 19 downloaded originals from the authenticated shared CEEL Google Drive folder (18 images and one PDF). No Drive URL is used as an image source. The galleries contain 19 local artwork/process images, including the PDF preview, plus four lightweight covers.

Original JPEG/PNG/PDF files remain available locally. Four photographed artworks have separate upright copies: the apple, Activity 4 lettering, PUR-DYN sketch, and campaign logo sketch. Each was deliberately rotated 90 degrees counterclockwise after visual inspection. The PDF has one page, rendered at 2200px on its longer side. WebP gallery previews are capped at 1800px; the lightbox loads the larger original or upright copy. Artwork is not redrawn, recolored, or cropped.

Source folders:
- [CEEL](https://drive.google.com/drive/folders/1zxMez-siHrwmm2rAzKFjwSPHD95gfqZA)
- [Prelim branding](https://drive.google.com/drive/folders/1hBySLn7sYec6wasSkYe4Gh_zz6tijNrF)
- [Midterm typography/poster](https://drive.google.com/drive/folders/1E1oj9dIBz6yDe2hRNAsHHC487oSiiZxn)
- [Midterm campaign](https://drive.google.com/drive/folders/1UOvVhAQrhw2fiV5_ju0EFdvW8AqKgSd3)

These source links may require the visitor’s Google Drive permission; the website previews do not.

## Add future Finals work

Append a real project to **window.PORTFOLIO.projects** in **dist/data.js**. The project model is:

- id, slug, title
- academicPeriod: **prelim**, **midterm**, or **finals** only
- category, projectType, activityNumber (array of verified numbers)
- year, role, status, description, overview, designFocus
- tools, technologies, keywords (arrays; leave unverified tools empty)
- coverImage, coverAlt
- gallery: objects with src, fullSrc, alt, title, caption, width, height
- externalLinks: objects with label and url

Copy real artwork into **dist/assets/ceel/** and set local paths. Use a new lowercase hyphenated slug. Run **npm run routes** to generate its directory index for direct access and refresh. No layout changes are required.

Finals always remains selectable. Until actual Finals entries exist it shows “Final projects are coming soon.” and the supplied Figma/wireframe supporting text. This message is not project data and cannot match a Figma search.

Search matches title, descriptions, academic period, category, verified activities, tools, technologies, year, type, keywords, and gallery captions. Matching is case-insensitive, supports partial terms and multiple terms, and combines with the period selection. “Activity N” queries check verified activity numbers to avoid accidental matches against dates. Clearing search preserves the selected period. “typography” also matches PUR-DYN because its verified description discusses customized typography.

## Development checks

No build step or runtime dependencies are required. Development-only artwork and browser tools are installed through **npm ci**.

- **npm run check** — syntax, schema/assets/routes, search/filter cases, existing page and theme regression checks.
- **npm run test:browser** — headless Chrome (installed Chrome required), 375/768/1440px layouts, both themes, live search/counts, periods/empty states, all direct/refreshed project URLs, all images, keyboard/lightbox controls, PDF, legacy routes, navigation and unrelated pages. The test owns and closes an ephemeral static server. Screenshots go to ignored **outputs/**.
- **npm run prepare:artwork** — regenerate upright copies, PDF preview, inspection sheet, WebP previews and covers from the downloaded originals.
- **npm run routes** — regenerate project HTML shells and page-specific metadata from the project data.

Old sample project URLs redirect to /projects. Only shared script/cache references change in unrelated HTML shells.

## Hosting and existing features

**.openai/hosting.json** retains the existing Sites project ID and static dist root. Keep its current public audience when deploying updates.

The actual résumé is **dist/assets/annonuevo_resume.pdf**. /education contains its download/view section; /cv redirects to /education#resume. The contact page uses FormSubmit AJAX to deliver to annonuevodyn@gmail.com. This Gmail address is used throughout the site; the GitHub account is https://github.com/dianxz17. The owner must confirm the one-time FormSubmit activation email before delivery can be verified. No API keys or Gmail credentials belong in frontend files. Contact submission checks provider acknowledgement, handles timeout/failure without clearing the message, and includes a honeypot. Run npm run test:contact for browser tests with mocked provider responses. These tests do not prove inbox delivery.

The design-preview banner is removed from all pages. Existing noindex/robots directives are preserved. Public access does not require search-engine indexing. Finals Figma design and low-fidelity wireframe are the only requested coursework assets still to be supplied.

## GitHub Pages

The repository is ready for publication as **dianxz17/dianxz17.github.io**. This account-site repository name serves the existing root-relative navigation and assets at the domain root.

**.github/workflows/pages.yml** validates and publishes only **dist/** on pushes to main/master or a manual run. Select **GitHub Actions** under repository **Settings → Pages → Build and deployment → Source**. The workflow uses GitHub’s automatically supplied token; no personal access token belongs in the code.

The GitHub repository and live Pages URL are not created by adding this workflow; authenticated GitHub access and a successful deployment are required. Development dependencies and output archives are excluded by .gitignore.

