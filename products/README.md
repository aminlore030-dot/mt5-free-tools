# Product folders

One folder per tool. Expert Advisors live under `products/ea/<id>/`, indicators
under `products/indicators/<id>/`. Nothing else in the repository needs editing
when you add a tool: the build step scans this directory and writes
`assets/data/catalog.json`, which the website reads.

```
products/ea/my-tool/
├── product.json      required, metadata
├── MyTool.ex5        optional until you are ready to publish the file
├── preview.png       optional screenshot (16:10 looks best)
└── README.md         optional documentation, rendered on the product page
```

## product.json fields

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | URL-safe, unique. Used as `product.html?id=<id>` |
| `type` | yes | `ea`, `indicator` or `script` |
| `name` | yes | Display name |
| `version` | recommended | Plain string, for example `1.2.0` |
| `symbol` | recommended | For example `XAUUSD`, or `All` for any symbol. Omit when unknown: the page then says "not set" instead of claiming something |
| `timeframe` | recommended | For example `M1`, `All`, or `Multi` for multi-timeframe tools |
| `description` | recommended | One or two sentences, used in listings and meta tags |
| `file` | when published | Exact file name inside the folder, for example `MyTool.ex5`. Leave it out while nothing is published |
| `preview` | optional | Image file name. Auto-detected if called `preview.png` |
| `free` | optional | Defaults to `true` |
| `featured` | optional | `true` puts it in the homepage featured row |
| `tags` | optional | Array of strings, included in search. Persian tags work too |
| `features` | optional | Array of bullet points |
| `requirements` | optional | Array of bullet points |
| `install` | optional | Array of custom installation steps, replaces the defaults |
| `changelog` | optional | Array of `{ "version", "date", "notes": [] }` |
| `updated` | optional | `YYYY-MM-DD`, used for sorting and the sitemap |
| `license` | optional | Free text |
| `author` | optional | Free text, kept in the catalogue |
| `shortDescription` | optional | One-line summary, kept for listings |
| `longDescription` | optional | Markdown, rendered as an overview section |

Unknown fields are preserved in the catalogue, so you can start using new
metadata before the frontend reads it.

There is no `files` object in the schema. Every recognised file that really
exists in the folder is listed automatically; `file` only decides which one is
the primary download button.

## Rules the build step follows

- Only files that actually exist are advertised. A missing `.ex5` leaves the
  download button disabled instead of producing a broken link.
- Any `.ex5`, `.mq5`, `.mqh`, `.zip`, `.set`, `.tpl`, `.chr`, `.pdf` or `.csv`
  in the folder is listed as a download with its real size. This means a
  **placeholder file with a real extension is published as a real download**:
  never commit a text file as `MyTool.ex5`, and never commit a fake
  `preview.png`. Leave the file out instead.
- A broken `product.json` is skipped with a warning; the rest of the site keeps
  working.
- Missing `preview` falls back to a neutral placeholder tile.

Validate before pushing (the deploy workflow runs the same command with
`--strict`, so a warning fails the build instead of shipping):

```bash
python3 scripts/build_catalog.py --check --strict
```
