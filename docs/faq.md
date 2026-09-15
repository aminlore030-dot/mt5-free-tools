# Frequently asked questions

## Is this really free?

Yes. Every Expert Advisor and indicator on this site can be downloaded and used
without paying anything, without an account, and without a licence key. There is
no trial period and no locked "pro" version.

## Do I have to donate?

No. Donation links, when they exist, are voluntary. Donating changes nothing:
you get the same files, the same versions and the same documentation as everyone
else. If no donation link is configured, no donation button appears at all.

## Do you collect my data?

The site is static. There is no account system, no server-side code and no
database. Search and filtering run in your browser, so what you type never
leaves your machine. GitHub, which hosts the pages, keeps its own standard
server logs.

## Which MetaTrader version do I need?

MetaTrader 5 desktop, reasonably up to date. MT4 cannot run `.ex5` files, and
the MT5 mobile apps cannot run Expert Advisors or custom indicators at all.

## Can I use these on a real account?

You can, and the risk is entirely yours. Test in the Strategy Tester, then on a
demo account with your own broker's symbols and spread, before risking real
money. Nothing here is financial advice or a promise of profit.

## Why is a download button disabled?

Because that tool's file has not been published yet. The product page and its
specification exist, but the site never links to a file that is not in the
repository. When the file is committed, the button activates automatically.

## Do you include the source code?

Only when a tool's page lists an `.mq5` file. Some tools ship compiled `.ex5`
only. When source is included you may read, compile and modify it for your own
use.

## How do I know a file is safe?

Every file lives in the public repository, so you can see when it was added and
what changed. No tool published here needs DLL imports or internet access. If
MT5 asks for those permissions for a file you downloaded from this site, stop
and report it in the issue tracker.

## How do updates work?

Each tool carries a version number in its metadata. When a new version is
published, the same product page shows the new version and its changelog, and
the download serves the new file. There are no update notifications: check the
tool page or the repository history.

## The EA does nothing on my chart

Check three things in order: Algo Trading is enabled and the chart shows a
smiling face; the symbol and timeframe match what the tool page specifies; the
**Experts** tab in the Toolbox has no error messages. Broker symbol names with
suffixes, such as `XAUUSD.m`, are a common cause.

## Can I redistribute or resell these tools?

You can share them, but check each tool's licence field. Nothing here may be
sold as your own commercial product, and reselling free tools to beginners is a
bad look anyway.

## Can I request a tool or report a bug?

Yes, through the repository issue tracker. Include your MT5 build, broker,
symbol, timeframe and what you expected to happen. Public issues help everyone
who hits the same problem later.

## Do you offer support?

Best effort, in public, through issues. There is no paid support tier, no
private support channel and no service level promise.
