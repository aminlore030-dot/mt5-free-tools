/* ==========================================================================
   MT5 Free Tools - client side search.
   Matches every query token against name, description, symbol, timeframe,
   type and tags. All tokens must match (AND), results are ranked.
   ========================================================================== */

(function () {
  "use strict";

  var MT5 = window.MT5 || (window.MT5 = {});

  /* Persian and Arabic text has to be folded before matching: the same word can
     be written with different letter shapes, with or without a zero width
     non-joiner, and with or without diacritics. "تایم‌فریم" and "تایمفریم",
     "نرم‌افزار" and "نرمافزار" are the same word to a reader but not to a
     string comparison, so both the query and the indexed text are normalised. */
  var LETTER_EQUIVALENTS = {
    "ي": "ی", "ى": "ی", "ك": "ک", "ة": "ه", "ۀ": "ه",
    "أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا", "ؤ": "و", "ئ": "ی"
  };
  var DIGIT_EQUIVALENTS = {
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
    "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9"
  };
  var DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
  var INVISIBLE = /[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g;
  var EQUIVALENT = /[يىكۀةأإآٱؤئ]/g;
  var DIGITS = /[۰-۹٠-٩]/g;

  function normalize(text) {
    return String(text === null || text === undefined ? "" : text)
      .toLowerCase()
      .replace(DIACRITICS, "")
      .replace(INVISIBLE, "")
      .replace(EQUIVALENT, function (ch) { return LETTER_EQUIVALENTS[ch] || ch; })
      .replace(DIGITS, function (ch) { return DIGIT_EQUIVALENTS[ch] || ch; });
  }

  /* Any letter or digit of any script is a valid token character, so Persian
     queries are tokenised instead of being dropped. */
  function tokenize(query) {
    var splitter = /[^\p{L}\p{N}%._+#]+/u;
    return normalize(query)
      .split(splitter)
      .filter(function (token) { return token.length > 0; });
  }

  function haystack(product) {
    if (product.__haystack) return product.__haystack;
    var parts = [
      product.name, product.id, product.description, product.symbol,
      product.timeframe, product.type, product.typeLabel, product.version,
      (product.tags || []).join(" "),
      (product.features || []).join(" ")
    ];
    var value = normalize(parts.filter(Boolean).join(" "));
    try {
      Object.defineProperty(product, "__haystack", { value: value, enumerable: false });
    } catch (err) {
      product.__haystack = value;
    }
    return value;
  }

  function score(product, tokens) {
    var hay = haystack(product);
    var name = normalize(product.name);
    var total = 0;

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (hay.indexOf(token) === -1) return 0;
      var points = 1;
      if (name.indexOf(token) !== -1) points += 4;
      if (name.indexOf(token) === 0) points += 3;
      if (normalize(product.symbol) === token) points += 3;
      if (normalize(product.timeframe) === token) points += 2;
      if ((product.tags || []).some(function (tag) {
        return normalize(tag) === token;
      })) points += 2;
      total += points;
    }
    if (product.featured) total += 0.5;
    return total;
  }

  function query(items, text) {
    var tokens = tokenize(text);
    if (!tokens.length) return items.slice();
    return items
      .map(function (item) { return { item: item, score: score(item, tokens) }; })
      .filter(function (row) { return row.score > 0; })
      .sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return String(a.item.name || "").localeCompare(String(b.item.name || ""));
      })
      .map(function (row) { return row.item; });
  }

  MT5.search = { tokenize: tokenize, normalize: normalize, score: score, query: query };
})();
