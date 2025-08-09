IPMARKET Demo — Static multi-page site
====================================

This demo implements a static, multi-page "IP marketplace" showcasing features described in the feasibility analysis:
- Marketplace with filterable listings
- Listing detail with mock AI summary & valuation
- Seller dashboard (simulated)
- Admin / metrics page (simulated)
- About / Roadmap / Contact pages

How to deploy (GitHub Pages):
1. Create a GitHub repo (e.g. ipmarket-demo).
2. Copy all files from the root of this project into the repo.
3. Commit and push to the main branch.
4. In GitHub, go to Settings → Pages → Source and set to 'main' / '/root'. After a minute the site will be available at:
   https://<your-username>.github.io/<repo-name>/

Or, upload the zipped files to Netlify (drag-and-drop) for instant deployment.

Notes:
- All AI features are mocked in browser. This is a presentation/demo site — NOT production.
- To connect to real APIs, replace the mock data in assets/app.js and add secure backend endpoints.
