# Site changelog

Release history of the website itself. Individual tools carry their own version
numbers and changelog entries on their product pages.

## 1.0.0 - 2026-09-15

First public release of the static site.

- Product catalogue generated automatically from every `product.json` under
  `products/`, so publishing a tool means committing a folder.
- Client-side search across name, description, symbol, timeframe, type and tags.
- Combined filters for type, symbol, timeframe and featured status.
- Reusable product detail page with specification, installation steps, file
  list, documentation and per-tool changelog.
- Dark and light themes with the choice remembered locally.
- Installation guide, FAQ and this changelog rendered from Markdown in `docs/`.
- Optional donation section driven by a single configuration file, hidden
  entirely when no donation link is set.
- GitHub Actions workflow that rebuilds the catalogue and sitemap, then deploys
  to GitHub Pages on every push to `main`.
