/* ============================================================
   select-toggle.js
   TASTE STYLE / STORY STYLE のような、50:50タブでパネルを
   切り替えるだけの小さなスクリプト。custom-nav.js / slider.js とは独立。
============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.select-toggle').forEach(function (toggle) {
    var panelsWrap = toggle.nextElementSibling;
    if (!panelsWrap || !panelsWrap.classList.contains('select-panels')) return;

    var buttons = toggle.querySelectorAll('.select-toggle-btn');
    var panels = panelsWrap.querySelectorAll('.select-panel');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-target');

        buttons.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        panels.forEach(function (p) { p.hidden = true; });

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        var target_panel = panelsWrap.querySelector('.select-panel[data-panel="' + target + '"]');
        if (target_panel) target_panel.hidden = false;
      });
    });
  });
});
