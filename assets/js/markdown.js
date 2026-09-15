/* ==========================================================================
   MT5 Free Tools - tiny markdown renderer (no dependencies).
   Used to render docs/*.md and per-product README.md inside the site so
   documentation has a single source of truth in the repository.
   Input is escaped before any inline parsing, so untrusted HTML cannot pass.
   ========================================================================== */

(function () {
  "use strict";

  var MT5 = window.MT5 || (window.MT5 = {});

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function safeUrl(url) {
    var value = String(url || "").trim();
    if (/^\s*javascript:/i.test(value) || /^\s*data:/i.test(value)) return "#";
    return value;
  }

  function inline(text) {
    var out = escapeHtml(text);
    var codes = [];
    out = out.replace(/`([^`]+)`/g, function (_m, code) {
      codes.push(code);
      return "CODE" + (codes.length - 1) + "";
    });
    out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (_m, alt, src) {
      return '<img src="' + safeUrl(src) + '" alt="' + alt + '" loading="lazy">';
    });
    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_m, label, href) {
      var url = safeUrl(href);
      var external = /^https?:/i.test(url);
      return '<a href="' + url + '"' + (external ? ' rel="noopener"' : "") + ">" + label + "</a>";
    });
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    out = out.replace(/(^|[\s(])_([^_\n]+)_/g, "$1<em>$2</em>");
    out = out.replace(/CODE(\d+)/g, function (_m, index) {
      return "<code>" + escapeHtml(codes[Number(index)]) + "</code>";
    });
    return out;
  }

  function tableRow(line, cell) {
    var cells = line.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|");
    return "<tr>" + cells.map(function (value) {
      return "<" + cell + ">" + inline(value.trim()) + "</" + cell + ">";
    }).join("") + "</tr>";
  }

  function render(source) {
    var lines = String(source || "").replace(/\r\n?/g, "\n").split("\n");
    var html = [];
    var i = 0;

    function listBlock(ordered) {
      var tag = ordered ? "ol" : "ul";
      var items = [];
      var pattern = ordered ? /^\s*\d+[.)]\s+(.*)$/ : /^\s*[-*+]\s+(.*)$/;
      while (i < lines.length && pattern.test(lines[i])) {
        var indented = /^\s{2,}/.test(lines[i]);
        var text = lines[i].match(pattern)[1];
        if (indented && items.length) {
          items[items.length - 1] += "<br>" + inline(text);
        } else {
          items.push(inline(text));
        }
        i++;
      }
      html.push("<" + tag + ">" + items.map(function (item) {
        return "<li>" + item + "</li>";
      }).join("") + "</" + tag + ">");
    }

    while (i < lines.length) {
      var line = lines[i];

      if (!line.trim()) { i++; continue; }

      if (/^\s*```/.test(line)) {
        i++;
        var code = [];
        while (i < lines.length && !/^\s*```/.test(lines[i])) { code.push(lines[i]); i++; }
        i++;
        html.push("<pre><code>" + escapeHtml(code.join("\n")) + "</code></pre>");
        continue;
      }

      var heading = line.match(/^(#{1,6})\s+(.*)$/);
      if (heading) {
        var level = Math.min(heading[1].length + 1, 6);
        html.push("<h" + level + ">" + inline(heading[2].trim()) + "</h" + level + ">");
        i++;
        continue;
      }

      if (/^\s*(---+|\*\*\*+|___+)\s*$/.test(line)) { html.push("<hr>"); i++; continue; }

      if (/^\s*>\s?/.test(line)) {
        var quote = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
          quote.push(lines[i].replace(/^\s*>\s?/, ""));
          i++;
        }
        html.push("<blockquote>" + render(quote.join("\n")) + "</blockquote>");
        continue;
      }

      if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
        var head = tableRow(line, "th");
        i += 2;
        var body = [];
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
          body.push(tableRow(lines[i], "td"));
          i++;
        }
        html.push("<table><thead>" + head + "</thead><tbody>" + body.join("") + "</tbody></table>");
        continue;
      }

      if (/^\s*[-*+]\s+/.test(line)) { listBlock(false); continue; }
      if (/^\s*\d+[.)]\s+/.test(line)) { listBlock(true); continue; }

      var paragraph = [];
      while (i < lines.length && lines[i].trim() &&
        !/^\s*(#{1,6}\s|```|>|\||[-*+]\s|\d+[.)]\s)/.test(lines[i]) &&
        !/^\s*(---+|\*\*\*+|___+)\s*$/.test(lines[i])) {
        paragraph.push(lines[i].trim());
        i++;
      }
      if (paragraph.length) html.push("<p>" + inline(paragraph.join(" ")) + "</p>");
      else i++;
    }

    return html.join("\n");
  }

  MT5.markdown = render;
})();
