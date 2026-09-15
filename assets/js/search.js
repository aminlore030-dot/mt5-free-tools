/* ==========================================================================
   MT5 Free Tools - client side search.
   Matches every query token against name, description, symbol, timeframe,
   type and tags. All tokens must match (AND), results are ranked.
   ========================================================================== */

(function () {
  "use strict";

  var MT5 = window.MT5 || (window.MT5 = {});

  function tokenize(query) {
    return String(query || "")
      .toLowerCase()
      .split(/[^a-z0-9%._+#]+/)
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
    var value = parts.filter(Boolean).join(" ").toLowerCase();
    try {
      Object.defineProperty(product, "__haystack", { value: value, enumerable: false });
    } catch (err) {
      product.__haystack = value;
    }
    return value;
  }

  function score(product, tokens) {
    var hay = haystack(product);
    var name = String(product.name || "").toLowerCase();
    var total = 0;

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (hay.indexOf(token) === -1) return 0;
      var points = 1;
      if (name.indexOf(token) !== -1) points += 4;
      if (name.indexOf(token) === 0) points += 3;
      if (String(product.symbol || "").toLowerCase() === token) points += 3;
      if (String(product.timeframe || "").toLowerCase() === token) points += 2;
      if ((product.tags || []).some(function (tag) {
        return String(tag).toLowerCase() === token;
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

  MT5.search = { tokenize: tokenize, score: score, query: query };
})();
