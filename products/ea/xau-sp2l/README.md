# XAU SP2L EA

This folder is the working example of how an Expert Advisor is published on the
site. Its metadata is real and live; the compiled program is not published yet,
so the site shows the specification and keeps the download button disabled
instead of linking to a file that does not exist.

## Publishing the real tool

1. Drop the compiled file into this folder as `XAU_SP2L_EA.ex5` (or change the
   `file` field in `product.json` to match your file name).
2. Add a chart screenshot as `preview.png`.
3. Fill in `features`, `requirements` and the real `description` in
   `product.json`, and bump `version` plus the `changelog` entry.
4. Commit and push to `main`. The deploy workflow rebuilds the catalogue and the
   product appears with an active download button.

## Installation

Standard MT5 Expert Advisor installation: copy the `.ex5` into
`MQL5/Experts` inside **File**, **Open Data Folder**, refresh the Navigator, drag
it onto an `XAUUSD` M1 chart and enable Algo Trading. The full walkthrough is in
[docs/installation.md](../../../docs/installation.md).

Test on a demo account first. Automated trading carries real risk.
