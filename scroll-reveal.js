/* ============================================================
   scroll-reveal.js
   各ブロックがスクロールで画面に入った時に、ふわっと浮き出るように
   表示するだけの小さなスクリプト。他のJS（custom-nav.js / select-toggle.js /
   auto-slider.js）とは独立して動作する。
============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  var selector = [
    '.section-philosophy',
    '.media-row',
    '.select-heading-block',
    '.select-toggle',
    '.select-panels',
    '.section-select .card-white',
    '.section-video-muted',
    '.reveal-block'
  ].join(', ');

  var targets = Array.prototype.slice.call(document.querySelectorAll(selector));
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(function (el) { observer.observe(el); });

  /* 5色の丸：本家サイト（circle-anim.js）と同じ、1つずつ順番に浮き出る動き */
  var circles = document.querySelectorAll('.design-tags span');
  if (!circles.length) return;

  if (!('IntersectionObserver' in window)) {
    circles.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var circleObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        circles.forEach(function (circle, index) {
          setTimeout(function () {
            circle.classList.add('is-visible');
          }, index * 250);
        });
        circleObserver.disconnect();
      }
    });
  }, { threshold: 0.2 });

  circleObserver.observe(circles[0]);
});
