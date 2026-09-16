/* ==========================================================================
   MT5 Free Tools - single source of site configuration.
   Edit this file only. Nothing else in the site hard-codes these values.
   Never put tokens, API keys or secrets in this file: it is public.
   ========================================================================== */

window.MT5_CONFIG = {
  /* Public identity */
  siteName: "ابزارهای رایگان MT5",
  tagline: "اکسپرت‌ها و اندیکاتورهای رایگان برای متاتریدر ۵",

  /* Interface language and direction, used by the runtime for date and
     number formatting. Change both together if you translate the site. */
  locale: "fa-IR",
  direction: "rtl",

  /* Absolute site URL, used for canonical/OG metadata written by the build
     script. Change it once here (and in the <link rel="canonical"> tags of
     the HTML pages) if you move to a custom domain. */
  siteUrl: "https://aminlore030-dot.github.io/mt5-free-tools/",

  /* Repository used as the management interface */
  repoUrl: "https://github.com/aminlore030-dot/mt5-free-tools",
  issuesUrl: "https://github.com/aminlore030-dot/mt5-free-tools/issues",

  /* Generated product catalogue. Path is relative to the site root, so the
     site works at a domain root and at /USER.github.io/REPO/ alike. */
  catalog: "assets/data/catalog.json",

  /* Optional donation support.
     Leave `url` empty to hide every donation button on the site.
     `methods` is optional and renders as a plain list of alternatives. */
  donation: {
    enabled: true,
    url: "",
    label: "حمایت مالی",
    note: "حمایت مالی کاملاً اختیاری است و هیچ قابلیتی را باز نمی‌کند. همه ابزارها رایگان می‌مانند.",
    methods: []
    /* Example once you have real links:
    url: "https://ko-fi.com/yourname",
    methods: [
      { label: "Ko-fi", url: "https://ko-fi.com/yourname" },
      { label: "USDT (TRC20)", detail: "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" }
    ]
    */
  }
};
