/* ==========================================================================
   MT5 Free Tools - product catalogue: loading, normalising, rendering,
   filtering and the product detail page.

   The catalogue is a generated JSON index (assets/data/catalog.json) built
   from every product.json under products/ in the repository, so adding a product
   folder is enough to publish it. Nothing here is hard-coded per product.
   ========================================================================== */

(function () {
  "use strict";

  var MT5 = window.MT5 || (window.MT5 = {});
  var CFG = window.MT5_CONFIG || {};

  var TYPES = {
    ea: { key: "ea", label: "Expert Advisor", plural: "Expert Advisors", short: "EA", folder: "MQL5/Experts", page: "ea.html" },
    indicator: { key: "indicator", label: "Indicator", plural: "Indicators", short: "IND", folder: "MQL5/Indicators", page: "indicators.html" },
    script: { key: "script", label: "Script", plural: "Scripts", short: "SCR", folder: "MQL5/Scripts", page: "products.html" },
    other: { key: "other", label: "Tool", plural: "Tools", short: "MT5", folder: "MQL5", page: "products.html" }
  };

  var FILE_LABELS = {
    ex5: "Compiled MT5 program",
    mq5: "MQL5 source code",
    mqh: "MQL5 include file",
    zip: "Archive",
    set: "Parameter preset",
    tpl: "Chart template",
    pdf: "Documentation",
    chr: "Chart profile",
    txt: "Text file",
    csv: "Data file"
  };

  function clean(value) { return MT5.clean ? MT5.clean(value) : (value == null ? "" : String(value).trim()); }
  function esc(value) { return MT5.escape(value); }

  function normalizeType(raw) {
    var value = clean(raw).toLowerCase().replace(/[\s_]+/g, "-");
    if (!value) return "other";
    if (value === "ea" || value.indexOf("expert") === 0 || value === "robot" || value === "eas") return "ea";
    if (value.indexOf("indicator") === 0 || value === "ind") return "indicator";
    if (value.indexOf("script") === 0) return "script";
    return "other";
  }

  function typeMeta(type) { return TYPES[normalizeType(type)] || TYPES.other; }

  function joinPath(base, name) {
    if (!name) return "";
    if (/^(https?:)?\/\//i.test(name) || name.indexOf("/") === 0) return name;
    if (name.indexOf("/") !== -1) return name;
    return base ? base.replace(/\/+$/, "") + "/" + name : name;
  }

  function stringList(value) {
    if (Array.isArray(value)) {
      return value.map(clean).filter(Boolean);
    }
    var single = clean(value);
    return single ? [single] : [];
  }

  function normalizeFile(raw, base) {
    if (!raw) return null;
    var file = typeof raw === "string" ? { name: raw } : raw;
    var name = clean(file.name) || clean(file.file) || clean(file.path).split("/").pop();
    var path = joinPath(base, clean(file.path) || name);
    if (!path) return null;
    var ext = (name.split(".").pop() || "").toLowerCase();
    return {
      name: name || path.split("/").pop(),
      path: path,
      ext: ext,
      size: Number(file.size) > 0 ? Number(file.size) : 0,
      label: clean(file.label) || FILE_LABELS[ext] || "Download",
      primary: file.primary === true
    };
  }

  function normalizeChangelog(value) {
    if (!Array.isArray(value)) return [];
    return value.map(function (entry) {
      if (!entry) return null;
      if (typeof entry === "string") return { version: "", date: "", notes: [entry] };
      return {
        version: clean(entry.version),
        date: clean(entry.date),
        notes: stringList(entry.notes || entry.changes || entry.note)
      };
    }).filter(function (entry) {
      return entry && (entry.version || entry.notes.length);
    });
  }

  function normalizeProduct(raw) {
    if (!raw || typeof raw !== "object") return null;

    var path = clean(raw.path).replace(/^\/+|\/+$/g, "");
    var id = clean(raw.id) || clean(raw.slug) || (path ? path.split("/").pop() : "");
    if (!id) return null;

    var type = normalizeType(raw.type || (path.indexOf("products/indicator") === 0 ? "indicator" : path.indexOf("products/ea") === 0 ? "ea" : ""));
    var meta = typeMeta(type);

    var files = (Array.isArray(raw.files) ? raw.files : [])
      .map(function (file) { return normalizeFile(file, path); })
      .filter(Boolean);

    var declared = clean(raw.file);
    if (declared) {
      var declaredPath = joinPath(path, declared);
      var existing = files.filter(function (f) { return f.path === declaredPath; })[0];
      if (existing) existing.primary = true;
    }

    var primary = files.filter(function (f) { return f.primary; })[0] || files[0] || null;
    var preview = clean(raw.preview);

    return {
      id: id,
      path: path,
      type: type,
      typeLabel: meta.label,
      typePlural: meta.plural,
      typeShort: meta.short,
      installFolder: clean(raw.installFolder) || meta.folder,
      name: clean(raw.name) || clean(raw.title) || id,
      version: clean(raw.version),
      symbol: clean(raw.symbol),
      timeframe: clean(raw.timeframe),
      description: clean(raw.description),
      longDescription: clean(raw.longDescription),
      tags: stringList(raw.tags),
      features: stringList(raw.features),
      requirements: stringList(raw.requirements),
      install: stringList(raw.install || raw.installation),
      changelog: normalizeChangelog(raw.changelog),
      updated: clean(raw.updated) || clean(raw.date),
      author: clean(raw.author),
      license: clean(raw.license),
      free: raw.free !== false,
      featured: raw.featured === true,
      preview: preview ? joinPath(path, preview) : "",
      readme: clean(raw.readme) ? joinPath(path, clean(raw.readme)) : "",
      files: files,
      primaryFile: primary,
      url: "product.html?id=" + encodeURIComponent(id)
    };
  }

  /* ------------------------------------------------------------ catalogue */

  var state = { promise: null, items: [], meta: {} };

  function load() {
    if (state.promise) return state.promise;
    var url = clean(CFG.catalog) || "assets/data/catalog.json";
    state.promise = MT5.fetchJSON(url).then(function (data) {
      var raw = Array.isArray(data) ? data : (data && Array.isArray(data.products) ? data.products : []);
      state.items = raw.map(normalizeProduct).filter(Boolean);
      state.meta = (data && !Array.isArray(data) && data.generated) ? { generated: data.generated } : {};
      return state.items;
    });
    return state.promise;
  }

  function byId(id) {
    var target = clean(id);
    for (var i = 0; i < state.items.length; i++) {
      if (state.items[i].id === target) return state.items[i];
    }
    return null;
  }

  /* -------------------------------------------------------------- markup */

  function previewMarkup(product, sizeClass) {
    var label = esc(product.typeShort + " preview pending");
    if (!product.preview) {
      return '<span class="preview preview--empty ' + (sizeClass || "") + '"><span>No preview yet</span></span>';
    }
    return '<span class="preview ' + (sizeClass || "") + '" data-label="' + label + '">' +
      '<img src="' + esc(product.preview) + '" alt="' + esc(product.name + " screenshot") +
      '" loading="lazy" decoding="async" data-preview></span>';
  }

  function bindPreviewFallbacks(root) {
    MT5.qsa("img[data-preview]", root).forEach(function (img) {
      img.addEventListener("error", function () {
        var host = img.parentNode;
        if (!host) return;
        host.classList.add("preview--empty");
        var label = host.getAttribute("data-label") || "No preview yet";
        img.remove();
        if (!host.querySelector("span")) {
          var span = document.createElement("span");
          span.textContent = label;
          host.appendChild(span);
        }
      });
    });
  }

  function specsMarkup(product) {
    var rows = [
      ["Type", product.typeLabel],
      ["Version", product.version ? "v" + product.version : "n/a"],
      ["Symbol", product.symbol || "any"],
      ["Timeframe", product.timeframe || "any"]
    ];
    return '<dl class="specs">' + rows.map(function (row) {
      return "<div><dt>" + esc(row[0]) + "</dt><dd>" + esc(row[1]) + "</dd></div>";
    }).join("") + "</dl>";
  }

  function badgesMarkup(product) {
    var out = '<span class="badge badge--type">' + esc(product.typeShort) + "</span>";
    if (product.free) out += '<span class="badge badge--free">Free</span>';
    if (product.featured) out += '<span class="badge">Featured</span>';
    return out;
  }

  function downloadMarkup(product, extraClass) {
    var cls = "btn " + (extraClass || "");
    if (!product.primaryFile) {
      return '<span class="' + cls + '" aria-disabled="true" role="button" title="No file published for this tool yet">File not published</span>';
    }
    var size = MT5.formatBytes(product.primaryFile.size);
    return '<a class="' + cls + '" href="' + esc(product.primaryFile.path) + '" download>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16"/></svg>Download' +
      (size ? ' <span class="mono small">' + esc(size) + "</span>" : "") + "</a>";
  }

  function toolMarkup(product) {
    return '<li class="tool">' +
      '<a class="preview-link" href="' + esc(product.url) + '" tabindex="-1" aria-hidden="true">' +
      previewMarkup(product) + "</a>" +
      '<div class="tool-main">' +
        '<div class="tool-title"><h3><a href="' + esc(product.url) + '">' + esc(product.name) + "</a></h3>" +
        badgesMarkup(product) + "</div>" +
        (product.description ? '<p class="tool-desc">' + esc(product.description) + "</p>" : "") +
        specsMarkup(product) +
      "</div>" +
      '<div class="tool-actions">' + downloadMarkup(product, "btn--sm") +
        '<a class="btn btn--sm btn--ghost" href="' + esc(product.url) + '">View details</a>' +
      "</div>" +
    "</li>";
  }

  function featureMarkup(product) {
    return '<article class="feature-card">' +
      '<a href="' + esc(product.url) + '" tabindex="-1" aria-hidden="true">' + previewMarkup(product) + "</a>" +
      '<div class="feature-card-body">' +
        '<div class="badge-row">' + badgesMarkup(product) + "</div>" +
        '<h3><a href="' + esc(product.url) + '">' + esc(product.name) + "</a></h3>" +
        (product.description ? "<p>" + esc(product.description) + "</p>" : "") +
        specsMarkup(product) +
        '<div class="actions">' + downloadMarkup(product, "btn--sm") +
          '<a class="btn btn--sm btn--ghost" href="' + esc(product.url) + '">Details</a>' +
        "</div>" +
      "</div>" +
    "</article>";
  }

  function emptyState(title, body, action) {
    return '<div class="state"><h3>' + esc(title) + "</h3><p>" + esc(body) + "</p>" + (action || "") + "</div>";
  }

  function renderList(container, items, emptyTitle, emptyBody) {
    if (!items.length) {
      container.innerHTML = emptyState(emptyTitle, emptyBody);
      return;
    }
    container.innerHTML = '<ul class="tool-list">' + items.map(toolMarkup).join("") + "</ul>";
    bindPreviewFallbacks(container);
  }

  /* ----------------------------------------------------------- home page */

  function initHome() {
    var statsHost = MT5.qs("[data-catalog-stats]");
    var featuredHost = MT5.qs("[data-featured]");
    var lists = MT5.qsa("[data-tool-list]");
    if (!statsHost && !featuredHost && !lists.length) return;

    load().then(function (items) {
      if (statsHost) {
        var counts = { ea: 0, indicator: 0 };
        items.forEach(function (p) { if (counts[p.type] !== undefined) counts[p.type]++; });
        var downloadable = items.filter(function (p) { return !!p.primaryFile; }).length;
        var rows = [
          ["Expert Advisors", String(counts.ea)],
          ["Indicators", String(counts.indicator)],
          ["Ready to download", String(downloadable)],
          ["Price", "Always free"]
        ];
        if (state.meta.generated) rows.push(["Catalogue built", MT5.formatDate(state.meta.generated)]);
        statsHost.innerHTML = rows.map(function (row) {
          return '<li><span class="k">' + esc(row[0]) + '</span><span class="v">' + esc(row[1]) + "</span></li>";
        }).join("");
      }

      if (featuredHost) {
        var featured = items.filter(function (p) { return p.featured; });
        if (!featured.length) featured = items.slice(0, 2);
        if (!featured.length) {
          featuredHost.innerHTML = emptyState(
            "No tools published yet",
            "The catalogue is empty. Add a folder under products/ea or products/indicators with a product.json file and it appears here automatically.",
            '<a class="btn btn--ghost" data-repo-link href="#">Open the repository</a>'
          );
          var link = MT5.qs("[data-repo-link]", featuredHost);
          if (link && CFG.repoUrl) link.setAttribute("href", CFG.repoUrl);
        } else {
          featuredHost.innerHTML = '<div class="featured-grid">' +
            featured.slice(0, 4).map(featureMarkup).join("") + "</div>";
          bindPreviewFallbacks(featuredHost);
        }
      }

      lists.forEach(function (host) {
        var type = normalizeType(host.getAttribute("data-tool-list"));
        var limit = parseInt(host.getAttribute("data-limit"), 10) || 4;
        var subset = items.filter(function (p) { return p.type === type; }).slice(0, limit);
        renderList(host, subset,
          "Nothing here yet",
          "No " + typeMeta(type).plural.toLowerCase() + " have been published so far. New releases show up here automatically.");
      });
    }).catch(function (err) {
      var hosts = [featuredHost].concat(lists).filter(Boolean);
      hosts.forEach(function (host) {
        host.innerHTML = emptyState("Catalogue unavailable",
          "The product catalogue could not be loaded (" + err.message + "). Reload the page or check the repository.");
      });
      if (statsHost) statsHost.innerHTML = '<li><span class="k">Catalogue</span><span class="v">unavailable</span></li>';
    });
  }

  /* -------------------------------------------------------- listing page */

  function uniqueValues(items, key) {
    var seen = {};
    items.forEach(function (item) {
      var value = clean(item[key]);
      if (value) seen[value] = true;
    });
    return Object.keys(seen).sort();
  }

  function fillSelect(select, values, allLabel) {
    if (!select) return;
    select.innerHTML = '<option value="all">' + esc(allLabel) + "</option>" +
      values.map(function (value) {
        return '<option value="' + esc(value) + '">' + esc(value) + "</option>";
      }).join("");
  }

  function initListing() {
    var root = MT5.qs("[data-listing]");
    if (!root) return;

    var host = MT5.qs("[data-results]", root);
    var countEl = MT5.qs("[data-result-count]", root);
    var searchInput = MT5.qs("[data-search-input]", root);
    var symbolSelect = MT5.qs("[data-filter-symbol]", root);
    var tfSelect = MT5.qs("[data-filter-timeframe]", root);
    var featuredToggle = MT5.qs("[data-filter-featured]", root);
    var sortSelect = MT5.qs("[data-sort]", root);
    var typeInputs = MT5.qsa("[data-filter-type]", root);

    var locked = clean(root.getAttribute("data-lock-type"));
    var filters = {
      type: locked || normalizeTypeParam(MT5.param("type")) || clean(root.getAttribute("data-default-type")) || "all",
      q: clean(MT5.param("q")),
      symbol: clean(MT5.param("symbol")) || "all",
      timeframe: clean(MT5.param("tf")) || "all",
      featured: MT5.param("featured") === "1",
      sort: clean(MT5.param("sort")) || "name"
    };

    function normalizeTypeParam(value) {
      var raw = clean(value).toLowerCase();
      if (!raw) return "";
      if (raw === "all") return "all";
      return normalizeType(raw);
    }

    host.innerHTML = '<div class="skeleton-list"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div>';

    load().then(function (items) {
      fillSelect(symbolSelect, uniqueValues(items, "symbol"), "Any symbol");
      fillSelect(tfSelect, uniqueValues(items, "timeframe"), "Any timeframe");

      if (searchInput) searchInput.value = filters.q;
      if (symbolSelect) symbolSelect.value = hasOption(symbolSelect, filters.symbol) ? filters.symbol : "all";
      if (tfSelect) tfSelect.value = hasOption(tfSelect, filters.timeframe) ? filters.timeframe : "all";
      if (featuredToggle) featuredToggle.checked = filters.featured;
      if (sortSelect) sortSelect.value = filters.sort;
      typeInputs.forEach(function (input) { input.checked = input.value === filters.type; });

      if (searchInput) {
        searchInput.addEventListener("input", function () {
          filters.q = searchInput.value;
          apply();
        });
      }
      typeInputs.forEach(function (input) {
        input.addEventListener("change", function () {
          if (input.checked) { filters.type = input.value; apply(); }
        });
      });
      if (symbolSelect) symbolSelect.addEventListener("change", function () { filters.symbol = symbolSelect.value; apply(); });
      if (tfSelect) tfSelect.addEventListener("change", function () { filters.timeframe = tfSelect.value; apply(); });
      if (featuredToggle) featuredToggle.addEventListener("change", function () { filters.featured = featuredToggle.checked; apply(); });
      if (sortSelect) sortSelect.addEventListener("change", function () { filters.sort = sortSelect.value; apply(); });

      var resetBtn = MT5.qs("[data-reset-filters]", root);
      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          filters.q = "";
          filters.symbol = "all";
          filters.timeframe = "all";
          filters.featured = false;
          if (!locked) filters.type = clean(root.getAttribute("data-default-type")) || "all";
          if (searchInput) searchInput.value = "";
          if (symbolSelect) symbolSelect.value = "all";
          if (tfSelect) tfSelect.value = "all";
          if (featuredToggle) featuredToggle.checked = false;
          typeInputs.forEach(function (input) { input.checked = input.value === filters.type; });
          apply();
        });
      }

      apply();

      function apply() {
        var result = items.filter(function (p) {
          if (filters.type !== "all" && p.type !== filters.type) return false;
          if (filters.symbol !== "all" && p.symbol !== filters.symbol) return false;
          if (filters.timeframe !== "all" && p.timeframe !== filters.timeframe) return false;
          if (filters.featured && !p.featured) return false;
          return true;
        });

        result = MT5.search.query(result, filters.q);

        if (filters.sort === "updated") {
          result = result.slice().sort(function (a, b) {
            return String(b.updated || "").localeCompare(String(a.updated || ""));
          });
        } else if (!clean(filters.q)) {
          result = result.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
        }

        renderList(host, result,
          items.length ? "No tools match these filters" : "No tools published yet",
          items.length
            ? "Try a different search term, or clear the filters to see the whole catalogue."
            : "Add a folder under products/ea or products/indicators with a product.json file and it appears here automatically.");

        if (countEl) {
          countEl.textContent = result.length === items.length
            ? result.length + (result.length === 1 ? " tool" : " tools")
            : result.length + " of " + items.length + " tools";
        }
        syncUrl();
      }

      function syncUrl() {
        if (!window.history || !window.history.replaceState) return;
        var params = new URLSearchParams();
        if (!locked && filters.type !== "all") params.set("type", filters.type);
        if (clean(filters.q)) params.set("q", filters.q);
        if (filters.symbol !== "all") params.set("symbol", filters.symbol);
        if (filters.timeframe !== "all") params.set("tf", filters.timeframe);
        if (filters.featured) params.set("featured", "1");
        if (filters.sort !== "name") params.set("sort", filters.sort);
        var query = params.toString();
        window.history.replaceState(null, "", window.location.pathname + (query ? "?" + query : ""));
      }
    }).catch(function (err) {
      host.innerHTML = emptyState("Catalogue unavailable",
        "The product catalogue could not be loaded (" + err.message + "). Reload the page or check the repository.");
      if (countEl) countEl.textContent = "unavailable";
    });

    function hasOption(select, value) {
      return MT5.qsa("option", select).some(function (option) { return option.value === value; });
    }
  }

  /* --------------------------------------------------------- detail page */

  function defaultInstallSteps(product) {
    var folder = product.installFolder || "MQL5/Experts";
    var attachStep = product.type === "indicator"
      ? "Drag the indicator from the Navigator onto a chart of your symbol."
      : "Drag the Expert Advisor onto a chart, then enable Algo Trading in the toolbar.";
    return [
      "Download the file from the panel on this page.",
      "In MetaTrader 5 open File, then Open Data Folder.",
      "Copy the file into " + folder + ".",
      "Restart MetaTrader 5, or right-click in the Navigator panel and choose Refresh.",
      attachStep,
      "Test on a demo account first and check the inputs against the documentation."
    ];
  }

  function fileRow(file) {
    var size = MT5.formatBytes(file.size);
    return "<li>" +
      '<a class="file-row" href="' + esc(file.path) + '" download>' +
        '<span class="name">' + esc(file.name) + "</span>" +
        '<span class="size">' + esc(size ? size : file.ext.toUpperCase()) + "</span>" +
      "</a></li>";
  }

  function structuredData(product) {
    var data = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: product.name,
      applicationCategory: "FinanceApplication",
      operatingSystem: "MetaTrader 5",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
    };
    if (product.description) data.description = product.description;
    if (product.version) data.softwareVersion = product.version;
    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  function renderDetail(product, hosts) {
    var siteName = clean(CFG.siteName) || "MT5 Free Tools";
    MT5.setTitle(product.name + (product.version ? " " + product.version : "") + " - " + siteName);
    MT5.setDescription(product.description || product.name + " for MetaTrader 5, free download.");
    structuredData(product);

    if (hosts.crumb) {
      hosts.crumb.innerHTML = '<a href="index.html">Home</a><span>/</span>' +
        '<a href="' + esc(typeMeta(product.type).page) + '">' + esc(product.typePlural) + "</a>" +
        "<span>/</span>" + esc(product.name);
    }

    hosts.head.innerHTML =
      '<p class="eyebrow">' + esc(product.typeLabel) + (product.version ? " &middot; Version " + esc(product.version) : "") + "</p>" +
      "<h1>" + esc(product.name) + "</h1>" +
      (product.description ? '<p class="lede">' + esc(product.description) + "</p>" : "") +
      '<div class="badge-row">' + badgesMarkup(product) +
      (product.updated ? '<span class="badge">Updated ' + esc(MT5.formatDate(product.updated)) + "</span>" : "") +
      "</div>";

    var body = [];

    if (product.preview) {
      body.push('<figure style="margin:0">' + previewMarkup(product) +
        '<figcaption class="small muted" style="margin-top:8px">' + esc(product.name) + " on a MetaTrader 5 chart</figcaption></figure>");
    }

    body.push("<div><h2>Specification</h2>" +
      '<dl class="spec-table">' +
      [["Type", product.typeLabel],
       ["Version", product.version ? "v" + product.version : "not set"],
       ["Symbol", product.symbol || "any"],
       ["Timeframe", product.timeframe || "any"],
       ["Install folder", product.installFolder],
       ["Licence", product.license || "Free to use"]]
      .map(function (row) { return "<div><dt>" + esc(row[0]) + "</dt><dd>" + esc(row[1]) + "</dd></div>"; }).join("") +
      "</dl></div>");

    if (product.longDescription) {
      body.push("<div><h2>Overview</h2><div class=\"prose\">" + MT5.markdown(product.longDescription) + "</div></div>");
    }

    if (product.features.length) {
      body.push("<div><h2>Features</h2><ul>" + product.features.map(function (item) {
        return "<li>" + esc(item) + "</li>";
      }).join("") + "</ul></div>");
    }

    if (product.requirements.length) {
      body.push("<div><h2>Requirements</h2><ul>" + product.requirements.map(function (item) {
        return "<li>" + esc(item) + "</li>";
      }).join("") + "</ul></div>");
    }

    var steps = product.install.length ? product.install : defaultInstallSteps(product);
    body.push('<div><h2>Installation</h2><ol class="steps">' + steps.map(function (step) {
      return "<li>" + esc(step) + "</li>";
    }).join("") + "</ol>" +
      '<p class="small muted">Full walkthrough with screenshots of the MetaTrader folders: ' +
      '<a href="docs.html?page=installation">installation guide</a>.</p></div>');

    if (product.readme) {
      body.push('<div data-readme hidden><h2>Documentation</h2><div class="prose" data-readme-body></div></div>');
    }

    if (product.changelog.length) {
      body.push('<div><h2>Changelog</h2><ul class="changelog">' + product.changelog.map(function (entry) {
        return "<li>" +
          '<div class="ver"><strong>' + esc(entry.version ? "v" + entry.version : "Update") + "</strong>" +
          (entry.date ? "<time>" + esc(MT5.formatDate(entry.date)) + "</time>" : "") + "</div>" +
          (entry.notes.length ? "<ul>" + entry.notes.map(function (note) {
            return "<li>" + esc(note) + "</li>";
          }).join("") + "</ul>" : "") +
          "</li>";
      }).join("") + "</ul></div>");
    } else {
      body.push('<div><h2>Changelog</h2><p class="muted small">No release notes recorded yet' +
        (product.version ? " for version " + esc(product.version) : "") +
        '. Site-wide release history lives in the <a href="docs.html?page=changelog">changelog</a>.</p></div>');
    }

    hosts.body.innerHTML = body.join("");
    bindPreviewFallbacks(hosts.body);

    if (product.readme) {
      MT5.fetchText(product.readme).then(function (text) {
        var wrap = MT5.qs("[data-readme]", hosts.body);
        var target = MT5.qs("[data-readme-body]", hosts.body);
        if (!wrap || !target || !clean(text)) return;
        target.innerHTML = MT5.markdown(text);
        wrap.hidden = false;
      }).catch(function () { /* documentation is optional */ });
    }

    var download = [];
    download.push('<h2>Download</h2><p class="price">Free &middot; no account needed</p>');
    download.push(downloadMarkup(product, "btn--block"));
    if (!product.primaryFile) {
      download.push('<p class="small muted" style="margin-top:12px">No binary has been published for this tool yet. ' +
        'Once the file is committed to <code>' + esc(product.path || "the product folder") + '</code> the button activates automatically.</p>');
    } else {
      download.push('<p class="small muted" style="margin-top:12px">Primary file: <code>' +
        esc(product.primaryFile.name) + "</code>" +
        (product.primaryFile.label ? " &middot; " + esc(product.primaryFile.label) : "") + "</p>");
    }
    if (product.files.length > 1) {
      download.push('<h3 class="small" style="margin-top:16px">All files</h3><ul class="file-list">' +
        product.files.map(fileRow).join("") + "</ul>");
    }
    hosts.download.innerHTML = download.join("");
  }

  function initDetail() {
    var root = MT5.qs("[data-product-detail]");
    if (!root) return;

    var hosts = {
      crumb: MT5.qs("[data-crumbs]"),
      head: MT5.qs("[data-product-head]", root),
      body: MT5.qs("[data-product-body]", root),
      download: MT5.qs("[data-product-download]", root),
      missing: MT5.qs("[data-product-missing]", root),
      shell: MT5.qs("[data-product-shell]", root)
    };

    function fail(title, message) {
      if (hosts.shell) hosts.shell.hidden = true;
      if (hosts.missing) {
        hosts.missing.hidden = false;
        hosts.missing.innerHTML = '<div class="center-state"><p class="code">Not found</p><h1>' + esc(title) + "</h1>" +
          '<p class="lede" style="margin-inline:auto">' + esc(message) + "</p>" +
          '<div class="actions"><a class="btn" href="products.html">Browse all tools</a>' +
          '<a class="btn btn--ghost" href="index.html">Back to home</a></div></div>';
      }
      MT5.setTitle("Tool not found - " + (clean(CFG.siteName) || "MT5 Free Tools"));
    }

    var id = clean(MT5.param("id"));
    if (!id) {
      fail("No tool selected", "This page needs a tool reference, for example product.html?id=my-tool. Pick a tool from the catalogue instead.");
      return;
    }

    load().then(function () {
      var product = byId(id);
      if (!product) {
        fail("That tool is not in the catalogue", "The reference \"" + id + "\" does not match any published tool. It may have been renamed or not published yet.");
        return;
      }
      renderDetail(product, hosts);
    }).catch(function (err) {
      fail("Catalogue unavailable", "The product catalogue could not be loaded (" + err.message + ").");
    });
  }

  /* ------------------------------------------------------------ docs page */

  function initDocs() {
    var host = MT5.qs("[data-doc-body]");
    if (!host) return;
    var allowed = {
      installation: { file: "docs/installation.md", title: "Installation guide" },
      faq: { file: "docs/faq.md", title: "FAQ" },
      changelog: { file: "docs/changelog.md", title: "Changelog" }
    };
    var key = clean(MT5.param("page")) || "installation";
    var doc = allowed[key] || allowed.installation;
    var siteName = clean(CFG.siteName) || "MT5 Free Tools";
    MT5.setTitle(doc.title + " - " + siteName);

    MT5.fetchText(doc.file).then(function (text) {
      if (!clean(text)) throw new Error("empty document");
      host.innerHTML = MT5.markdown(text);
    }).catch(function (err) {
      host.innerHTML = emptyState("Document unavailable",
        "This page could not be loaded (" + err.message + "). The same content is readable in the repository under docs/.",
        '<a class="btn btn--ghost" href="' + esc(clean(CFG.repoUrl) || "#") + '">Open the repository</a>');
    });
  }

  MT5.products = {
    load: load,
    byId: byId,
    all: function () { return state.items.slice(); },
    normalize: normalizeProduct,
    normalizeType: normalizeType,
    typeMeta: typeMeta,
    renderList: renderList
  };

  MT5.initPage = function () {
    initHome();
    initListing();
    initDetail();
    initDocs();
  };
})();
