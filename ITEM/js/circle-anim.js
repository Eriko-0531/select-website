// ========== circle-anim.js ==========

// ページ内の.circleを全て取得
const circles = document.querySelectorAll('.circle');

// Intersection Observerで監視
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 左から順に少しずつ遅延をかけてアニメーション表示
      circles.forEach((circle, index) => {
        setTimeout(() => {
          circle.classList.add('show');
        }, index * 250); // ← 順番ごとに0.25秒遅延
      });
      observer.disconnect(); // 一度だけ実行して監視解除
    }
  });
}, { threshold: 0.2 });

// 最初の.circle要素を監視開始（※まとめてでOK）
if (circles.length > 0) observer.observe(circles[0]);
