# MT5 Free Tools

A static website that distributes MetaTrader 5 Expert Advisors and indicators
for free. No backend, no database, no accounts, no payment flow. HTML, CSS and
vanilla JavaScript, hosted on GitHub Pages, maintained entirely through this
repository.

Live site: https://aminlore030-dot.github.io/mt5-free-tools/

## What it does

- Catalogue generated from every `product.json` under `products/`
- Client-side search over name, description, symbol, timeframe, type and tags
- Combined filters: type, symbol, timeframe, featured
- Reusable product page with specification, install steps, file list, changelog
- Installation guide, FAQ and changelog written once as Markdown in `docs/`
- Light and dark theme, remembered in `localStorage`
- Optional donation section, configured in one file, hidden when unset
- Deploys itself on every push to `main` once the workflow is in place

## Repository structure

```
.
├── .github/deploy-pages.workflow.yml   move to .github/workflows/deploy.yml
├── assets/
│   ├── css/style.css              design system, components
│   ├── css/responsive.css         breakpoint overrides
│   ├── js/config.js               ALL site configuration lives here
│   ├── js/app.js                  helpers, theme, nav, donation rendering
│   ├── js/products.js             catalogue loading, listings, product page
│   ├── js/search.js               client-side search and ranking
│   ├── js/markdown.js             tiny Markdown renderer for docs + READMEs
│   ├── data/catalog.json          generated index (do not edit by hand)
│   └── images/                    logo.svg, favicon.svg, shared images
├── products/
│   ├── ea/<id>/product.json       one folder per Expert Advisor
│   └── indicators/<id>/product.json
├── docs/                          installation.md, faq.md, changelog.md
├── scripts/build_catalog.py       scanner: writes catalog.json + sitemap.xml
├── index.html products.html ea.html indicators.html product.html
├── docs.html about.html donate.html 404.html
├── robots.txt sitemap.xml manifest.webmanifest .nojekyll
└── README.md
```

## Adding a tool

1. Create a folder: `products/ea/my-tool/` (or `products/indicators/my-tool/`).
2. Add `product.json`:

```json
{
  "id": "my-tool",
  "type": "ea",
  "name": "My Tool",
  "version": "1.0.0",
  "symbol": "XAUUSD",
  "timeframe": "M15",
  "description": "One or two sentences shown in listings and search results.",
  "file": "MyTool.ex5",
  "preview": "preview.png",
  "free": true,
  "featured": false,
  "tags": ["gold", "trend"],
  "features": ["Fixed lot or risk percent sizing", "Session filter"],
  "install": [],
  "changelog": [
    { "version": "1.0.0", "date": "2026-09-15", "notes": ["First release."] }
  ]
}
```

3. Drop the compiled `MyTool.ex5` and a `preview.png` into the same folder.
4. Commit and push to `main`.

That is the whole process. No HTML file is ever edited to publish a product.
Field reference: [products/README.md](products/README.md).

If you deploy from the branch instead of Actions, run
`python3 scripts/build_catalog.py` once before committing so the catalogue index
includes the new folder.

Useful behaviour while a tool is not finished:

- No file in the folder yet: the page renders, the download button is disabled
  and says so. The site never links to a file that does not exist.
- No `preview.png`: a neutral placeholder tile is used, layout unchanged.
- Broken `product.json`: that product is skipped with a build warning, the rest
  of the site is unaffected.

Releasing a new version: replace the file, bump `version`, add a `changelog`
entry. The URL of the product page never changes.

## Configuration

Everything configurable lives in [`assets/js/config.js`](assets/js/config.js):
site name, absolute site URL, repository and issue links, catalogue path and the
donation block.

Donation is off until you set a URL:

```js
donation: {
  enabled: true,
  url: "https://your-donation-link",
  label: "Send a donation",
  note: "Donations are voluntary and never unlock anything.",
  methods: [
    { label: "Ko-fi", url: "https://ko-fi.com/yourname" },
    { label: "USDT (TRC20)", detail: "TXXXXXXXXXXXXXXXXXXXXXXXXXXXX" }
  ]
}
```

With `url` empty every donation button disappears and the pages explain that
nothing is being collected. There is no payment processing anywhere in this
project, and no secrets belong in this file: it is public.

## Local preview

```bash
python3 scripts/build_catalog.py      # regenerate catalog.json + sitemap.xml
python3 -m http.server 8080           # then open http://localhost:8080/
```

Validate product metadata without writing files:

```bash
python3 scripts/build_catalog.py --check
```

## Deployment

Two options, both free.

**A. Deploy from a branch, works immediately.** Open **Settings**, **Pages**,
**Build and deployment**, choose source **Deploy from a branch**, branch `main`,
folder `/ (root)`. The catalogue index is committed, so every page works right
away. Remember to run the build script locally when you add a product.

**B. Deploy with GitHub Actions, rebuilds the catalogue for you.** Move
`.github/deploy-pages.workflow.yml` to `.github/workflows/deploy.yml`, then set
the Pages source to **GitHub Actions**. Every push to `main` checks out the
repository, runs `scripts/build_catalog.py` with the Pages base URL, uploads the
whole site as an artifact and deploys it with the official Pages actions. The
workflow file sits outside `.github/workflows/` only because the token that
created this site was not allowed to write into that folder.

Either way: no third-party hosting, no paid service, no secrets beyond the
automatic Pages token.

Paths are relative everywhere, so the site works at
`https://user.github.io/repo/` and at a domain root. `404.html` computes a
`<base>` tag so it also works when GitHub Pages serves it from a deep path.

## Custom domain

Add a `CNAME` file containing the domain and update `siteUrl` in `config.js`,
the `canonical` tags in the HTML pages and the `Sitemap:` line in `robots.txt`.
Nothing else changes. No `CNAME` is committed, because no domain is configured
yet.

## Extending later

The frontend only consumes `assets/data/catalog.json`. A future backend,
licensing service, download counter or GitHub Releases integration can produce
or enrich that file without touching the pages. Unknown fields in `product.json`
are carried through to the catalogue for exactly that reason.

## Disclaimer

Trading carries risk. The tools are provided as-is with no warranty and no
guarantee of profitability, and nothing here is financial advice. MetaTrader 5
and MQL5 are products of MetaQuotes Ltd; this project is independent and not
affiliated with MetaQuotes.
