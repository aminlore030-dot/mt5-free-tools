# Installing MetaTrader 5 tools

Everything on this site is a normal MetaTrader 5 file. There is no installer, no
account and no licence key. If you can copy a file into a folder, you can
install any tool published here.

You need the MetaTrader 5 desktop terminal (Windows, or MT5 running through Wine
or Parallels). The mobile apps cannot run Expert Advisors or custom indicators.

## Step 1: download the file

Open the page of the tool you want and press **Download**. You will get one of
these file types:

| File | What it is | Where it goes |
| --- | --- | --- |
| `.ex5` | Ready-to-run compiled program | `MQL5/Experts` or `MQL5/Indicators` |
| `.mq5` | Source code you can compile yourself | same folder as the compiled file |
| `.mqh` | Include file used by source code | `MQL5/Include` |
| `.set` | Saved input parameters (preset) | `MQL5/Presets` |
| `.tpl` | Chart template | `templates` |
| `.zip` | Several of the above together | unzip first, then follow this table |

If your browser warns about the file, that is the normal warning for any
executable-looking download. Keep the file, do not rename its extension.

## Step 2: open the MetaTrader 5 data folder

In MetaTrader 5 choose **File**, then **Open Data Folder**. A file explorer
window opens on the terminal's own folder. Inside it you will find the `MQL5`
folder. This is the only folder you need.

Do not copy files into the MetaTrader installation folder in `Program Files`.
That folder is not the data folder and MT5 will not see your tools there.

## Step 3: copy the file into the right subfolder

- **Expert Advisor (`.ex5`)** goes into `MQL5/Experts`
- **Indicator (`.ex5`)** goes into `MQL5/Indicators`
- **Script (`.ex5`)** goes into `MQL5/Scripts`
- **Include file (`.mqh`)** goes into `MQL5/Include`
- **Preset (`.set`)** goes into `MQL5/Presets`

You can create your own subfolder, for example `MQL5/Experts/MT5FreeTools`, to
keep downloads tidy. MT5 will show it as a group in the Navigator.

## Step 4: make MetaTrader see the file

Either restart MetaTrader 5, or right-click anywhere in the **Navigator** panel
(`Ctrl+N` if it is hidden) and choose **Refresh**. The tool now appears under
**Expert Advisors** or **Indicators**.

## Step 5: attach it to a chart

1. Open a chart for the symbol and timeframe listed on the tool page.
2. Drag the tool from the Navigator onto the chart, or double-click it.
3. Check the inputs on the **Inputs** tab, then press **OK**.

For Expert Advisors you also need automated trading switched on:

- Press the **Algo Trading** button in the toolbar so it turns green.
- In **Tools**, **Options**, **Expert Advisors**, allow algorithmic trading.
- A smiling face in the top-right corner of the chart means the EA is running.
  A sad face means algo trading is still off.

Indicators do not need Algo Trading and never place orders.

## Compiling a `.mq5` source file

Some tools also ship their source code. To build it yourself:

1. Put the `.mq5` file in the same folder the compiled file would use.
2. Put any `.mqh` include files into `MQL5/Include`.
3. Open the `.mq5` file in **MetaEditor** (`F4` from MT5).
4. Press **Compile** (`F7`). The `.ex5` appears next to the source file.
5. Refresh the Navigator in MT5.

Compilation errors almost always mean a missing include file. Check the tool
page for the full file list.

## Loading a preset (`.set`)

With the tool attached to a chart, open its settings, go to the **Inputs** tab
and press **Load**, then pick the `.set` file. Presets are starting points, not
guarantees: they were tuned on one broker's data, spread and symbol name.

## Testing before you go live

Use the **Strategy Tester** (`Ctrl+R`) with real ticks where possible, then run
the tool on a demo account for a while. Only after that, consider a small live
size. Broker conditions, spread, symbol suffixes such as `XAUUSD.m` and swap
rules all change results.

## Troubleshooting

**The tool is not in the Navigator.** Wrong folder, or MT5 was not refreshed.
Confirm the file sits in `MQL5/Experts` or `MQL5/Indicators` inside the data
folder you opened from **File**, **Open Data Folder**.

**A sad face appears on the chart.** Algo Trading is off, or the EA rejected the
current symbol or timeframe. Check the **Experts** tab in the Toolbox for the
exact message.

**Nothing shows on the chart.** Some indicators draw only under specific
conditions or need enough bars in history. Scroll back, change timeframe, or
check the tool page for required history.

**Errors about a DLL or WebRequest.** No tool published here needs external DLLs
or internet permissions. If a downloaded file asks for that, it did not come
from this site.

**Downloads open as text.** Right-click the download link and choose **Save link
as**, or use the Download button on the tool page.
