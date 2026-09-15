# XAU Level Map

This folder is the working example of how an indicator is published on the site.
The metadata is real and live; the compiled program is not published yet, so the
product page shows the specification with the download button disabled rather
than linking to a missing file.

## Publishing the real tool

1. Drop the compiled file into this folder as `XAU_Level_Map.ex5` (or change the
   `file` field in `product.json` to match your file name).
2. Add a chart screenshot as `preview.png`.
3. Fill in `features`, the real `description` and any custom `install` steps in
   `product.json`, then bump `version` and add a `changelog` entry.
4. Commit and push to `main`. The catalogue rebuilds and the download activates.

## Installation

Standard MT5 indicator installation: copy the `.ex5` into `MQL5/Indicators`
inside **File**, **Open Data Folder**, refresh the Navigator, then drag it onto
any `XAUUSD` chart. Indicators never place orders and do not need Algo Trading.
Full guide: [docs/installation.md](../../../docs/installation.md).
