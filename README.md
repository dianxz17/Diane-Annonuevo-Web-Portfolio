# Portfolio

Buildless HTML, CSS and JavaScript portfolio. Edit `dist/data.js` to supply verified personal details, skills, experience, education and projects. Example projects are explicitly illustrative. Replace the examples with actual projects by populating `projects`.

Provide a same-origin PDF (for example `/assets/cv.pdf`) in `cv`; a profile photo path in `photo`; and an HTTPS email form provider endpoint in `contactEndpoint`. The endpoint must validate inputs, sanitize email headers, implement rate limiting and spam protection, and return non-2xx on failure. No email service credentials belong in frontend files. The form intentionally remains disabled until configured. Test actual delivery to the destination inbox after configuration. Local honeypot is supplemental only.

Serve `dist` as the static web root. Clean routes are generated as directory index files. After changing shared index metadata or adding project slugs, regenerate route copies. Deploy using the Sites source workflow; `.openai/hosting.json` records the assigned project ID. Keep its ID for all updates.

Preview intentionally uses noindex and robots disallow until real content is supplied. Before final professional launch, add the final canonical origin, per-page title/description/canonical/Open Graph data, an actual social preview image and sitemap.xml, then remove noindex and change robots.txt to allow indexing. Include only real public routes in sitemap.xml. Ensure root-relative assets use the public site root.

Outstanding verification: real photo, real projects, CV PDF download/view, real social links, production inbox delivery, browser layouts at 375/768/1440px, keyboard and screen reader interaction, public hosting/HTTPS and canonical metadata. No completed credentials or experience have been invented.

## Page content and resume routing

Skills categories, verified experience and education entries live in `dist/data.js`. Dedicated renderers in `dist/app.js` reuse the existing theme tokens in `dist/style.css`; Home keeps its compact toolkit. All shared navigation shells omit the separate CV tab. `/education` contains the academic timeline and `#resume` section. `/cv` is a legacy client-side redirect with a meta-refresh and ordinary fallback link to `/education#resume`.

The actual resume is `dist/assets/annonuevo_resume.pdf`; both buttons reuse this PDF. Change `cv` in the data model only when replacing the document. View opens a new tab; download preserves `annonuevo_resume.pdf`. No extra assets or dependencies are required for these pages.
