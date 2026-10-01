/* ProofMarket — i18n, mobile nav, marketplace filters, real form submission (Formspree-compatible + mailto fallback) */
(function () {
  "use strict";

  var CFG = window.PROOFMARKET_CONFIG || {};
  var LANG_KEY = "proofmarket_lang";

  function t(en, zh) {
    return '<span class="i18n-en">' + en + '</span><span class="i18n-zh">' + zh + "</span>";
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* —— Language —— */
  function getLang() {
    return document.documentElement.lang === "zh" ? "zh" : "en";
  }
  function setLang(lang) {
    lang = lang === "zh" ? "zh" : "en";
    document.documentElement.lang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    document.querySelectorAll(".lang-toggle").forEach(function (btn) {
      btn.setAttribute("aria-pressed", lang === "zh" ? "true" : "false");
      btn.textContent = lang === "zh" ? "EN" : "中文";
      btn.setAttribute("aria-label", lang === "zh" ? "Switch to English" : "切换到中文");
    });
    // <option>, placeholders and <title> can't hold <span>s — swap their text.
    document.querySelectorAll("[data-en][data-zh]").forEach(function (el) {
      el.textContent = el.getAttribute(lang === "zh" ? "data-zh" : "data-en");
    });
    document.querySelectorAll("[data-ph-en]").forEach(function (el) {
      el.setAttribute("placeholder", el.getAttribute(lang === "zh" ? "data-ph-zh" : "data-ph-en") || "");
    });
    var b = document.body;
    if (b && b.getAttribute("data-title-en")) {
      document.title = b.getAttribute(lang === "zh" ? "data-title-zh" : "data-title-en");
    }
    renderListings();
  }
  function initLang() {
    setLang(document.documentElement.lang); // head script already picked ?lang= / saved / browser language
    document.querySelectorAll(".lang-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLang(getLang() === "zh" ? "en" : "zh");
      });
    });
  }

  function initMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* —— Contact email from config —— */
  function initContact() {
    var email = CFG.CONTACT_EMAIL;
    if (!email) return;
    document.querySelectorAll("[data-contact-email]").forEach(function (a) {
      a.textContent = email;
      if (a.tagName === "A") a.setAttribute("href", "mailto:" + email);
    });
  }

  /* —— Marketplace (example listings) —— */
  var state = { category: "all", sort: "ask-asc" };

  function formatMoney(n) {
    return "$" + Number(n).toLocaleString("en-US");
  }
  function getFiltered() {
    var list = (window.PROOFMARKET_LISTINGS || []).slice();
    if (state.category !== "all") {
      list = list.filter(function (b) { return b.category === state.category; });
    }
    var s = state.sort;
    list.sort(function (a, b) {
      if (s === "ask-asc") return a.ask - b.ask;
      if (s === "ask-desc") return b.ask - a.ask;
      if (s === "mrr-desc") return b.mrr - a.mrr;
      if (s === "mrr-asc") return a.mrr - b.mrr;
      if (s === "profit-desc") return b.profit - a.profit;
      if (s === "hours-asc") return a.hours - b.hours;
      if (s === "age-desc") return b.ageMonths - a.ageMonths;
      return 0;
    });
    return list;
  }
  function cardHTML(b) {
    var base = document.body.getAttribute("data-base") || "";
    var href = base + "businesses/" + b.slug;
    return (
      '<article class="card" data-category="' + esc(b.category) + '">' +
      '<div class="card-top"><span class="badge">' + t(esc(b.categoryLabel), esc(b.categoryLabelZh)) + "</span>" +
      '<span class="badge badge-example">' + t("Example · not for sale", "示例 · 非在售") + "</span></div>" +
      '<h3><a href="' + href + '">' + esc(b.name) + "</a></h3>" +
      '<p class="card-tagline">' + t(esc(b.tagline), esc(b.taglineZh)) + "</p>" +
      '<dl class="stats">' +
      '<div class="stat"><dt>' + t("MRR", "月收入") + "</dt><dd>" + formatMoney(b.mrr) + "</dd></div>" +
      '<div class="stat"><dt>' + t("Profit", "月利润") + "</dt><dd>" + formatMoney(b.profit) + "</dd></div>" +
      '<div class="stat"><dt>' + t("Hours/wk", "每周工时") + "</dt><dd>" + b.hours + " " + t("h/wk", "小时/周") + "</dd></div>" +
      '<div class="stat"><dt>' + t("Age", "运营时长") + "</dt><dd>" + b.ageMonths + " " + t("mo", "个月") + "</dd></div>" +
      "</dl>" +
      '<div class="card-ask"><span>' + t("Example asking price", "示例要价") + "</span><strong>" + formatMoney(b.ask) + "</strong></div>" +
      '<a class="btn btn-secondary btn-sm" href="' + href + '">' + t("View example", "查看示例") + "</a>" +
      "</article>"
    );
  }
  function renderListings() {
    var grid = document.getElementById("listing-grid");
    if (!grid) return;
    var countEl = document.getElementById("results-count");
    var list = getFiltered();
    if (countEl) {
      countEl.innerHTML = t(
        "Showing " + list.length + " example listing" + (list.length === 1 ? "" : "s") + " (fictional, not for sale)",
        "显示 " + list.length + " 个示例挂牌（虚构，非在售）"
      );
    }
    grid.innerHTML = list.length
      ? list.map(cardHTML).join("")
      : '<div class="empty-state">' + t("No examples in this category. Try another filter.", "此分类下暂无示例，请尝试其他筛选。") + "</div>";
  }
  function initFilters() {
    var chips = document.querySelectorAll("[data-filter-category]");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        state.category = chip.getAttribute("data-filter-category");
        chips.forEach(function (c) {
          c.classList.toggle("active", c === chip);
          c.setAttribute("aria-pressed", c === chip ? "true" : "false");
        });
        renderListings();
      });
    });
    var sortSel = document.getElementById("sort-select");
    if (sortSel) {
      sortSel.addEventListener("change", function () {
        state.sort = sortSel.value;
        renderListings();
      });
    }
    renderListings();
  }

  /* —— Forms —— */
  function endpointConfigured() {
    var ep = (CFG.FORM_ENDPOINT || "").trim();
    return /^https?:\/\//i.test(ep) && !/YOUR_FORM_ID|TODO/i.test(ep) ? ep : "";
  }

  // Collect fields in DOM order. Checkbox groups with the same name are joined.
  function collect(form) {
    var data = {}, rows = [], seen = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.disabled || el.name.charAt(0) === "_" || el.type === "submit" || el.type === "button") return;
      var label = el.getAttribute("data-label") || el.name;
      var val;
      if (el.type === "checkbox") {
        if (el.hasAttribute("data-group")) {
          if (!seen[el.name]) { seen[el.name] = true; data[el.name] = []; rows.push({ key: el.name, label: label }); }
          if (el.checked) data[el.name].push(el.value);
          return;
        }
        val = el.checked ? "yes" : "no";
      } else {
        val = (el.value || "").trim();
        if (el.getAttribute("data-normalize") === "url" && val && !/^[a-z]+:\/\//i.test(val)) val = "https://" + val;
      }
      data[el.name] = val;
      rows.push({ key: el.name, label: label });
    });
    Object.keys(data).forEach(function (k) {
      if (Array.isArray(data[k])) data[k] = data[k].join(", ");
    });
    return { data: data, rows: rows };
  }

  function subjectFor(type, d) {
    if (type === "seller") return "ProofMarket seller application: " + (d.project_name || d.name || "");
    return "ProofMarket buyer interest: " + (d.name || "") + (d.budget ? " (" + d.budget + ")" : "");
  }

  function plainText(type, c) {
    var head = type === "seller"
      ? "ProofMarket — seller application / 卖家申请"
      : "ProofMarket — buyer interest / 买家意向";
    var lines = [head, ""];
    c.rows.forEach(function (r) {
      lines.push(r.label + ": " + (c.data[r.key] || "-"));
    });
    lines.push("", "Sent from / 来自: " + location.href.split("?")[0]);
    return lines.join("\n");
  }

  function buildMailto(type, c) {
    var to = CFG.CONTACT_EMAIL || "";
    var subject = subjectFor(type, c.data);
    var body = plainText(type, c);
    var MAX = 1900; // keep URLs short enough for common mail clients / webmail handlers
    var url = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    if (url.length > MAX && c.data.notes) {
      var trimmed = { data: Object.assign({}, c.data), rows: c.rows };
      var notes = c.data.notes;
      while (url.length > MAX && notes.length > 0) {
        notes = notes.slice(0, Math.max(0, notes.length - 100));
        trimmed.data.notes = notes + " … [truncated — full text in the copy box / 已截断，完整内容见复制框]";
        url = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(plainText(type, trimmed));
      }
    }
    return url;
  }

  function showPanel(card, kind, html) {
    var panel = card.querySelector(".form-status");
    panel.className = "form-status form-status-" + kind;
    panel.innerHTML = html;
    panel.hidden = false;
    panel.setAttribute("tabindex", "-1");
    try { panel.focus({ preventScroll: true }); } catch (e) {}
    panel.scrollIntoView({ block: "start" });
    return panel;
  }

  function fallbackHTML(mailto, text, auto) {
    var email = esc(CFG.CONTACT_EMAIL || "");
    return (
      "<p>" + (auto ? t(
        "Your email app should open with everything prefilled — please press <strong>Send</strong>. If nothing opened, copy the text below and email it to ",
        "你的邮件应用应会自动打开并预填全部内容——请点击<strong>发送</strong>。如果没有打开，请复制下方内容，发送至 "
      ) : t(
        "Click <strong>Open email app</strong> (everything is prefilled), or copy the text below and email it to ",
        "点击<strong>打开邮件应用</strong>（内容已预填），或复制下方内容发送至 "
      )) + '<a href="mailto:' + email + '">' + email + "</a>.</p>" +
      '<p class="form-status-actions"><a class="btn btn-primary btn-sm" data-mailto-link href="' + esc(mailto) + '">' +
      t("Open email app", "打开邮件应用") + "</a> " +
      '<button type="button" class="btn btn-secondary btn-sm" data-copy>' + t("Copy text", "复制内容") + "</button></p>" +
      '<textarea class="form-copy" readonly rows="8" aria-label="Application text">' + esc(text) + "</textarea>"
    );
  }

  function wireCopy(panel) {
    var btn = panel.querySelector("[data-copy]");
    var ta = panel.querySelector(".form-copy");
    if (!btn || !ta) return;
    btn.addEventListener("click", function () {
      ta.select();
      var done = function () { btn.innerHTML = t("Copied ✓", "已复制 ✓"); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ta.value).then(done, function () { try { document.execCommand("copy"); done(); } catch (e) {} });
      } else {
        try { document.execCommand("copy"); done(); } catch (e) {}
      }
    });
  }

  function successHTML(type, email) {
    var e = esc(email);
    return type === "seller"
      ? "<strong>" + t("Application sent — thank you.", "申请已发送，谢谢！") + "</strong>" +
        "<p>" + t(
          "The operator reviews every application manually and will reply to <strong>" + e + "</strong> by email with next steps (usually a request for ownership and revenue evidence). No automatic confirmation email is sent.",
          "运营者会人工审核每一份申请，并通过邮件回复至 <strong>" + e + "</strong>，告知下一步（通常是请你提供所有权与收入证明）。系统不会自动发送确认邮件。"
        ) + "</p>"
      : "<strong>" + t("Thanks — your buyer profile was sent.", "谢谢，你的买家意向已发送。") + "</strong>" +
        "<p>" + t(
          "When a verified listing matches your budget and interests, the operator will email <strong>" + e + "</strong> to arrange an introduction. Submitting does not guarantee a match.",
          "当有符合你预算和方向的核验挂牌时，运营者会发邮件至 <strong>" + e + "</strong> 安排对接。提交不代表一定能匹配。"
        ) + "</p>";
  }

  function initForms() {
    document.querySelectorAll("form.pm-form").forEach(function (form) {
      var type = form.getAttribute("data-form-type") || "seller";
      var card = form.closest(".form-card") || form.parentNode;
      var btn = form.querySelector('button[type="submit"]');
      var btnHTML = btn ? btn.innerHTML : "";

      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }

        var hp = form.querySelector('[name="_gotcha"]');
        var c = collect(form);
        var finish = function () {
          card.classList.add("submitted");
          showPanel(card, "success", successHTML(type, c.data.email));
          form.reset();
        };
        if (hp && hp.value) { finish(); return; } // bot: pretend success, send nothing

        var mailto = buildMailto(type, c);
        var text = plainText(type, c);
        var endpoint = endpointConfigured();

        if (!endpoint) {
          var p = showPanel(card, "fallback",
            "<strong>" + t("Almost done — send it from your email.", "差一步：请通过邮件发送。") + "</strong>" +
            fallbackHTML(mailto, text, true));
          wireCopy(p);
          window.location.href = mailto;
          return;
        }

        var payload = Object.assign({}, c.data, {
          form_type: type,
          page_lang: getLang(),
          page: location.href.split("?")[0],
          _subject: subjectFor(type, c.data)
        });
        if (btn) { btn.disabled = true; btn.innerHTML = t("Sending…", "发送中…"); }
        var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
        var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 20000) : null;

        fetch(endpoint, {
          method: "POST",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: ctrl ? ctrl.signal : undefined
        })
          .then(function (res) {
            return res.json().catch(function () { return {}; }).then(function (json) {
              return { ok: res.ok && json.ok !== false, status: res.status, json: json };
            });
          })
          .then(function (r) {
            if (r.ok) { finish(); return; }
            var msg = (r.json && r.json.errors && r.json.errors.length)
              ? r.json.errors.map(function (e) { return (e.field ? e.field + ": " : "") + (e.message || ""); }).join("; ")
              : (r.json && r.json.error) || ("HTTP " + r.status);
            throw new Error(msg);
          })
          .catch(function (err) {
            var reason = "<strong>" + t("Sorry — the form could not be sent.", "抱歉，表单发送失败。") + "</strong>" +
              '<p class="form-error-detail">' + esc(err && err.message ? err.message : String(err)) + "</p>" +
              "<p>" + t("Nothing is lost: you can send the same details by email instead.", "内容没有丢失：你可以改用邮件发送同样的信息。") + "</p>";
            var p = showPanel(card, "error", reason + fallbackHTML(mailto, text, false));
            wireCopy(p);
          })
          .then(function () {
            if (timer) clearTimeout(timer);
            if (btn) { btn.disabled = false; btn.innerHTML = btnHTML; }
          });
      });
    });
  }

  function init() {
    initContact();
    initLang();
    initMobileNav();
    initFilters();
    initForms();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init(); // e.g. when loaded dynamically (404.html)

  // exposed for tests / debugging only
  window.__proofmarket = { buildMailto: buildMailto, collect: collect, endpointConfigured: endpointConfigured };
})();
