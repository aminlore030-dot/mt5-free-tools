#!/usr/bin/env python3
"""Build the product catalogue index and the sitemap for MT5 Free Tools.

Scans every product.json under products/, validates it, records the real
downloadable files that exist on disk, and writes:

  assets/data/catalog.json   the index the website reads in the browser
  sitemap.xml                static pages plus one entry per product

Standard library only, so GitHub Actions needs no dependencies. Running it is
optional for local previews and automatic on every deploy.

Usage:
  python3 scripts/build_catalog.py [--site-url https://user.github.io/repo/] [--check] [--strict]

Exit status: 0 normally, 1 when --strict is given and any product produced a
warning. The deploy workflow uses --strict so that broken metadata never reaches
the published site.
"""

import argparse
import datetime
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTS_DIR = os.path.join(ROOT, "products")
CATALOG_PATH = os.path.join(ROOT, "assets", "data", "catalog.json")
SITEMAP_PATH = os.path.join(ROOT, "sitemap.xml")

DEFAULT_SITE_URL = "https://aminlore030-dot.github.io/mt5-free-tools/"

DOWNLOAD_EXTENSIONS = {
    ".ex5": "Compiled MT5 program",
    ".mq5": "MQL5 source code",
    ".mqh": "MQL5 include file",
    ".zip": "Archive",
    ".set": "Parameter preset",
    ".tpl": "Chart template",
    ".chr": "Chart profile",
    ".pdf": "Documentation",
    ".csv": "Data file",
}

PREVIEW_CANDIDATES = (
    "preview.png", "preview.jpg", "preview.jpeg", "preview.webp", "preview.svg",
    "screenshot.png", "screenshot.jpg",
)

TYPE_ALIASES = {
    "ea": "ea", "eas": "ea", "expert": "ea", "expert-advisor": "ea",
    "expert_advisor": "ea", "expertadvisor": "ea", "robot": "ea",
    "indicator": "indicator", "indicators": "indicator", "ind": "indicator",
    "script": "script", "scripts": "script",
}

STATIC_PAGES = [
    ("", "1.0"),
    ("products.html", "0.9"),
    ("ea.html", "0.9"),
    ("indicators.html", "0.9"),
    ("docs.html?page=installation", "0.7"),
    ("docs.html?page=faq", "0.6"),
    ("docs.html?page=changelog", "0.5"),
    ("about.html", "0.4"),
    ("donate.html", "0.4"),
]

warnings = []


def warn(message):
    warnings.append(message)
    print("  warning: %s" % message)


def normalize_type(raw, relative_path):
    value = str(raw or "").strip().lower().replace(" ", "-").replace("_", "-")
    if value in TYPE_ALIASES:
        return TYPE_ALIASES[value]
    parts = relative_path.split("/")
    if len(parts) > 1 and parts[1] in TYPE_ALIASES:
        return TYPE_ALIASES[parts[1]]
    return "other"


def collect_files(directory, relative_path, declared):
    """Only files that really exist are advertised on the site."""
    found = []
    for name in sorted(os.listdir(directory)):
        full = os.path.join(directory, name)
        if not os.path.isfile(full):
            continue
        extension = os.path.splitext(name)[1].lower()
        if extension not in DOWNLOAD_EXTENSIONS:
            continue
        found.append({
            "name": name,
            "path": "%s/%s" % (relative_path, name),
            "ext": extension.lstrip("."),
            "size": os.path.getsize(full),
            "label": DOWNLOAD_EXTENSIONS[extension],
            "primary": bool(declared) and name == declared,
        })
    if declared and not any(entry["primary"] for entry in found):
        if found:
            found[0]["primary"] = True
    return found


def find_preview(directory, relative_path, declared):
    if declared and os.path.isfile(os.path.join(directory, declared)):
        return declared
    for candidate in PREVIEW_CANDIDATES:
        if os.path.isfile(os.path.join(directory, candidate)):
            return candidate
    return ""


def read_product(directory):
    relative_path = os.path.relpath(directory, ROOT).replace(os.sep, "/")
    manifest = os.path.join(directory, "product.json")
    try:
        with open(manifest, "r", encoding="utf-8") as handle:
            data = json.load(handle)
    except (ValueError, OSError) as error:
        warn("%s/product.json is not valid JSON and was skipped (%s)" % (relative_path, error))
        return None

    if not isinstance(data, dict):
        warn("%s/product.json must contain a JSON object, skipped" % relative_path)
        return None

    product = dict(data)  # unknown keys are preserved for future features
    product_id = str(product.get("id") or product.get("slug") or os.path.basename(directory)).strip()
    if not product_id:
        warn("%s has no usable id and was skipped" % relative_path)
        return None

    name = str(product.get("name") or product.get("title") or "").strip()
    if not name:
        name = product_id
        warn('%s has no "name", falling back to the folder name' % relative_path)

    product_type = normalize_type(product.get("type"), relative_path)
    if product_type == "other":
        warn('%s has an unknown "type", it will appear only under All tools' % relative_path)

    declared_file = str(product.get("file") or "").strip()
    files = collect_files(directory, relative_path, declared_file)
    if declared_file and not any(entry["name"] == declared_file for entry in files):
        warn('%s declares "%s" but that file is not in the folder, download stays disabled'
             % (relative_path, declared_file))

    product.update({
        "id": product_id,
        "name": name,
        "type": product_type,
        "path": relative_path,
        "files": files,
        "preview": find_preview(directory, relative_path, str(product.get("preview") or "").strip()),
        "readme": "README.md" if os.path.isfile(os.path.join(directory, "README.md")) else "",
        "free": product.get("free", True) is not False,
        "featured": product.get("featured") is True,
    })
    return product


def scan():
    products = []
    if not os.path.isdir(PRODUCTS_DIR):
        warn("products/ directory not found, writing an empty catalogue")
        return products
    for current, directories, files in os.walk(PRODUCTS_DIR):
        directories.sort()
        if "product.json" in files:
            product = read_product(current)
            if product:
                products.append(product)
    products.sort(key=lambda item: (not item["featured"], item["name"].lower()))
    return products


def write_catalog(products):
    payload = {
        "generated": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "count": len(products),
        "source": "scripts/build_catalog.py",
        "products": products,
    }
    os.makedirs(os.path.dirname(CATALOG_PATH), exist_ok=True)
    with open(CATALOG_PATH, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=False)
        handle.write("\n")


def escape(value):
    return (value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;").replace("'", "&apos;"))


def write_sitemap(products, site_url):
    base = site_url.strip()
    if not base:
        base = DEFAULT_SITE_URL
    if not base.endswith("/"):
        base += "/"
    today = datetime.date.today().isoformat()

    entries = [(base + path, priority, today) for path, priority in STATIC_PAGES]
    for product in products:
        updated = str(product.get("updated") or "").strip()[:10]
        try:
            datetime.date.fromisoformat(updated)
        except ValueError:
            updated = today
        entries.append(("%sproduct.html?id=%s" % (base, product["id"]), "0.8", updated))

    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for location, priority, lastmod in entries:
        lines.extend(["  <url>",
                      "    <loc>%s</loc>" % escape(location),
                      "    <lastmod>%s</lastmod>" % lastmod,
                      "    <priority>%s</priority>" % priority,
                      "  </url>"])
    lines.append("</urlset>")
    with open(SITEMAP_PATH, "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines) + "\n")


def main():
    parser = argparse.ArgumentParser(description="Build the MT5 Free Tools catalogue")
    parser.add_argument("--site-url", default=os.environ.get("SITE_URL", ""),
                        help="Absolute site URL used in sitemap.xml")
    parser.add_argument("--check", action="store_true",
                        help="Validate product files without writing anything")
    parser.add_argument("--strict", action="store_true",
                        help="Exit with status 1 when any product produced a warning")
    arguments = parser.parse_args()

    print("Scanning %s" % PRODUCTS_DIR)
    products = scan()
    for product in products:
        downloadable = len(product["files"])
        print("  %-28s %-10s v%-8s %s"
              % (product["id"], product["type"], product.get("version") or "-",
                 "%d file(s)" % downloadable if downloadable else "no file yet"))

    if arguments.check:
        print("Check finished: %d product(s), %d warning(s)" % (len(products), len(warnings)))
        return 1 if (arguments.strict and warnings) else 0

    write_catalog(products)
    write_sitemap(products, arguments.site_url)
    print("Wrote %s and %s" % (os.path.relpath(CATALOG_PATH, ROOT), os.path.relpath(SITEMAP_PATH, ROOT)))
    print("Done: %d product(s), %d warning(s)" % (len(products), len(warnings)))
    return 1 if (arguments.strict and warnings) else 0


if __name__ == "__main__":
    sys.exit(main())
