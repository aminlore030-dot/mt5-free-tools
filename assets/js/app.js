/* ==========================================================================
   MT5 Free Tools - shared runtime: helpers, theme, navigation, donation.
   No dependencies. Loaded on every page before products.js.
   ========================================================================== */

(function () {
  "use strict";

  var CFG = window.MT5_CONFIG || (window.MT5_CONFIG = {});
  var MT5 = window.MT5 || (window.MT5 = {});
  var THEME_KEY = "mt5-theme";

  /* --------------------------------------------------------------- helpers */

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function clean(value) {
    if (value === null || value === undefined) return "";
    var out = String(value).trim();
    return out === "null" || out === "undefined" ? "" : out;
  }

  function fetchText(url) {
    return fetch(url, { credentials: "omit" }).then(function (res) {
      if (!res.ok) throw new Error("Request failed: " + res.status);
      return res.text();
    });
  }

  function fetchJSON(url) {
    return fetchText(url).then(function (text) { return JSON.parse(text); });
  }

  function param(name) {
    try {
      return new URLSearchParams(window.location.search).get(name);
    } catch (err) {
      return null;
    }
  }

  function formatBytes(bytes) {
    var n = Number(bytes);
    if (!isFinite(n) || n <= 0) return "";
    var units = ["B", "KB", "MB", "GB"];
    var i = 0;
    while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
    return (n < 10 && i > 0 ? n.toFixed(1) : Math.round(n)) + " " + units[i];
  }

  function formatDate(value) {
    var raw = clean(value);
    if (!raw) return "";
    var date = new Date(raw);
    if (isNaN(date.getTime())) return raw;
    return date.toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "2-digit"
    });
  }

  function setMeta(selector, attr, value) {
    var el = qs(selector);
    if (el && value) el.setAttribute(attr, value);
  }

  function setTitle(text) {
    if (!text) return;
    document.title = text;
    setMeta('meta[property="og:title"]', "content", text);
  }

  function setDescription(text) {
    var value = clean(text);
    if (!value) return;
    if (value.length > 300) value = value.slice(0, 297) + "...";
    setMeta('meta[name="description"]', "content", value);
    setMeta('meta[property="og:description"]', "content", value);
  }

  MT5.qs = qs;
  MT5.qsa = qsa;
  MT5.escape = escapeHtml;
  MT5.clean = clean;
  MT5.fetchText = fetchText;
  MT5.fetchJSON = fetchJSON;
  MT5.param = param;
  MT5.formatBytes = formatBytes;
  MT5.formatDate = formatDate;
  MT5.setTitle = setTitle;
  MT5.setDescription = setDescription;
  MT5.config = CFG;

  /* ----------------------------------------------------------------- theme */

  function activeTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function applyTheme(theme, persist) {
    var value = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", value);
    qsa("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", value === "dark" ? "true" : "false");
      btn.setAttribute("aria-label", value === "dark"
        ? "Switch to light theme"
        : "Switch to dark theme");
    });
    if (persist) {
      try { window.localStorage.setItem(THEME_KEY, value); } catch (err) { /* private mode */ }
    }
  }

  function initTheme() {
    applyTheme(activeTheme(), false);
    qsa("[data-theme-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyTheme(activeTheme() === "dark" ? "light" : "dark", true);
      });
    });
  }

  /* ------------------------------------------------------------ navigation */

  function initNav() {
    var nav = qs("#primary-nav");
    var toggle = qs("[data-nav-toggle]");
    if (nav && toggle) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && nav.classList.contains("is-open")) {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.focus();
        }
      });
    }

    var here = window.location.pathname.split("/").pop() || "index.html";
    var page = param("page");
    qsa("#primary-nav a, .doc-nav a").forEach(function (link) {
      var href = link.getAttribute("href") || "";
      var file = href.split("?")[0].split("/").pop() || "index.html";
      var linkPage = (href.split("?")[1] || "").indexOf("page=") === 0
        ? href.split("page=")[1]
        : null;
      var match = file === here && (!linkPage || !page || linkPage === page);
      if (match) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  /* ------------------------------------------------------- config bindings */

  function initBindings() {
    qsa("[data-site-name]").forEach(function (el) { el.textContent = clean(CFG.siteName) || "MT5 Free Tools"; });
    qsa("[data-repo-link]").forEach(function (el) {
      var url = clean(CFG.repoUrl);
      if (url) el.setAttribute("href", url);
      else el.hidden = true;
    });
    qsa("[data-issues-link]").forEach(function (el) {
      var url = clean(CFG.issuesUrl) || clean(CFG.repoUrl);
      if (url) el.setAttribute("href", url);
      else el.hidden = true;
    });
    qsa("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  }

  /* -------------------------------------------------------------- donation */

  function donationState() {
    var d = CFG.donation || {};
    var methods = Array.isArray(d.methods) ? d.methods.filter(function (m) {
      return m && (clean(m.url) || clean(m.detail));
    }) : [];
    return {
      enabled: d.enabled !== false,
      url: clean(d.url),
      label: clean(d.label) || "Send a donation",
      note: clean(d.note),
      methods: methods
    };
  }

  function initDonation() {
    var state = donationState();
    var active = state.enabled && !!state.url;
    var hasAny = state.enabled && (!!state.url || state.methods.length > 0);

    qsa("[data-donate-link]").forEach(function (el) {
      if (active) {
        el.setAttribute("href", state.url);
        el.setAttribute("rel", "noopener");
        el.hidden = false;
        if (!el.hasAttribute("data-keep-label")) el.textContent = state.label;
      } else {
        el.hidden = true;
        el.removeAttribute("href");
      }
    });

    qsa("[data-donate-note]").forEach(function (el) {
      if (state.note) { el.textContent = state.note; el.hidden = false; }
      else el.hidden = true;
    });

    qsa("[data-donate-unavailable]").forEach(function (el) { el.hidden = hasAny; });

    qsa("[data-donate-methods]").forEach(function (list) {
      if (!state.enabled || !state.methods.length) { list.hidden = true; list.innerHTML = ""; return; }
      list.hidden = false;
      list.innerHTML = state.methods.map(function (m) {
        var label = escapeHtml(clean(m.label) || "Donation link");
        var detail = clean(m.detail);
        var url = clean(m.url);
        var head = url
          ? '<a class="label" href="' + escapeHtml(url) + '" rel="noopener">' + label + "</a>"
          : '<span class="label">' + label + "</span>";
        return "<li>" + head + (detail ? '<div class="detail">' + escapeHtml(detail) + "</div>" : "") + "</li>";
      }).join("");
    });
  }

  MT5.donation = donationState;

  /* ------------------------------------------------------------------ boot */

  function boot() {
    initTheme();
    initNav();
    initBindings();
    initDonation();
    document.documentElement.classList.add("js-ready");
    if (typeof MT5.initPage === "function") MT5.initPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
