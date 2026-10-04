/* ProofMarket — early-stage track: example project cards + filters, investor-form prefill */
(function () {
  "use strict";
  function t(en, zh) {
    return '<span class="i18n-en">' + en + '</span><span class="i18n-zh">' + zh + "</span>";
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  var DATA = window.PROOFMARKET_RAISE_EXAMPLES || [];
  var state = { stage: "all", sector: "all", range: "all" };

  function cardHTML(p) {
    var base = document.body.getAttribute("data-base") || "";
    var href = base + "projects/" + p.slug;
    return (
      '<article class="card raise-card" data-stage="' + esc(p.stage) + '">' +
      '<div class="card-top"><span class="badge badge-stage">' + t(esc(p.stageLabel), esc(p.stageLabelZh)) + "</span>" +
      '<span class="badge badge-example">' + t("Example · not a real project", "示例 · 非真实项目") + "</span></div>" +
      '<h3><a href="' + href + '">' + esc(p.name) + "</a></h3>" +
      '<p class="card-tagline">' + t(esc(p.tagline), esc(p.taglineZh)) + "</p>" +
      '<dl class="stats stats-1">' +
      '<div class="stat"><dt>' + t("Sector", "领域") + "</dt><dd>" + t(esc(p.sectorLabel), esc(p.sectorLabelZh)) + "</dd></div>" +
      '<div class="stat"><dt>' + t("Traction", "数据表现") + "</dt><dd>" + t(esc(p.traction), esc(p.tractionZh)) + "</dd></div>" +
      '<div class="stat"><dt>' + t("Verification", "核验状态") + '</dt><dd><span class="vtag vtag-' + esc(p.verification) + '">' +
        t(esc(p.verificationLabel), esc(p.verificationLabelZh)) + "</span></dd></div>" +
      "</dl>" +
      '<div class="card-ask"><span>' + t("Founder seeking intros · indicative", "创始人寻求引荐 · 参考区间") + "</span><strong>" +
        t(esc(p.rangeLabel), esc(p.rangeLabelZh)) + "</strong></div>" +
      '<a class="btn btn-secondary btn-sm" href="' + href + '">' + t("Read example memo", "查看示例备忘录") + "</a>" +
      "</article>"
    );
  }

  function render() {
    var grid = document.getElementById("raise-grid");
    if (!grid) return;
    var list = DATA.filter(function (p) {
      return (state.stage === "all" || p.stage === state.stage) &&
        (state.sector === "all" || p.sector === state.sector) &&
        (state.range === "all" || p.range === state.range);
    });
    var count = document.getElementById("raise-count");
    if (count) {
      count.innerHTML = t(
        "Showing " + list.length + " example project" + (list.length === 1 ? "" : "s") + " (fictional, not real, not seeking investment)",
        "显示 " + list.length + " 个示例项目（虚构，非真实项目，未寻求投资）"
      );
    }
    grid.innerHTML = list.length
      ? list.map(cardHTML).join("")
      : '<div class="empty-state">' + t("No example projects match these filters. Try another combination.", "没有符合筛选条件的示例项目，请尝试其他组合。") + "</div>";
  }

  function initFilters() {
    var chips = document.querySelectorAll("[data-filter-stage]");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        state.stage = chip.getAttribute("data-filter-stage");
        chips.forEach(function (c) {
          c.classList.toggle("active", c === chip);
          c.setAttribute("aria-pressed", c === chip ? "true" : "false");
        });
        render();
      });
    });
    [["sector-select", "sector"], ["range-select", "range"]].forEach(function (pair) {
      var el = document.getElementById(pair[0]);
      if (el) el.addEventListener("change", function () { state[pair[1]] = el.value; render(); });
    });
    render();
  }

  // investor-apply.html?project=<id> → prefill "Projects you'd like an intro to"
  function initPrefill() {
    var field = document.querySelector('form[data-form-type="investor"] [name="projects_of_interest"]');
    if (!field) return;
    var m = location.search.match(/[?&]project=([a-z0-9-]+)/i);
    if (!m) return;
    var hit = DATA.filter(function (p) { return p.id === m[1].toLowerCase(); })[0];
    if (hit && !field.value) field.value = hit.name + " (example)";
  }

  function init() { initFilters(); initPrefill(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
