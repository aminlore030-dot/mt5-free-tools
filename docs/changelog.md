# Site changelog

Release history of the website itself. Individual tools carry their own version
numbers and changelog entries on their product pages.

## 2026-09-18 - repository cleanup

- Removed every placeholder file that was being published as if it were a real
  download (`.ex5`, `.mq5` and `preview.png` files containing text), plus the
  unused `downloads/` tree, the per-product `download.json` files and the two
  upload scripts they came from. Product pages now say honestly that nothing is
  published yet, with the download button disabled.
- The catalogue is rebuilt automatically: the deploy workflow validates every
  `product.json` (`--check --strict`, a warning fails the build), regenerates
  `assets/data/catalog.json` and `sitemap.xml`, then publishes the site.
- All six product manifests now use one documented schema, so search and the
  symbol, timeframe and type filters work for every tool. Missing symbol or
  timeframe shows as "not set" instead of claiming "any".
- Client-side search now understands Persian: the query and the indexed text are
  normalised (Arabic/Persian letter variants, zero width non-joiner, diacritics,
  Persian digits), so `تایم‌فریم` and `تایمفریم` match the same tools.
- Added an MIT `LICENSE` for the site, and `docs/publishing.md`, a maintainer
  guide in Persian for publishing a tool.

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
