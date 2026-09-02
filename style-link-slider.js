/* ===========================================================
   style-link-slider.js
   ・「他のスタイルを見る」用の横自動スクロールスライダー
   ・auto-slider-youtube.js と同じ無限ループ／自動送りの仕組みを流用
   ・動画モーダルは無し。スライドは <a href> なのでクリックでそのまま遷移
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const container = document.querySelector(".style-link-carousel");
  if (!container) return;

  const track = container.querySelector(".slider-track");
  let slides = Array.from(container.querySelectorAll(".style-link-slide"));
  if (slides.length === 0) return;

  const prevBtn = container.querySelector(".arrow.prev");
  const nextBtn = container.querySelector(".arrow.next");
  const dotsWrap = container.querySelector(".dots");

  let index = 0;
  let slideWidth = 0;
  let autoPlay = true;
  let intervalId = null;
  let isAnimating = false;

  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);
  track.appendChild(firstClone);
  track.insertBefore(lastClone, track.firstChild);

  function calcSizesAndInit() {
    const style = window.getComputedStyle(slides[0]);
    const marginLeft = parseFloat(style.marginLeft) || 0;
    const marginRight = parseFloat(style.marginRight) || 0;
    slideWidth = slides[0].offsetWidth + marginLeft + marginRight;

    track.style.transition = "none";
    track.style.transform = `translateX(${-slideWidth}px)`;
  }
  calcSizesAndInit();

  function createDots() {
    dotsWrap.innerHTML = "";
    for (let i = 0; i < slides.length; i++) {
      const dot = document.createElement("span");
      dot.className = i === 0 ? "active" : "";
      dot.addEventListener("click", () => {
        index = i;
        moveToIndex(index);
        restartAuto();
      });
      dotsWrap.appendChild(dot);
    }
  }
  createDots();
  const dots = Array.from(dotsWrap.children);

  function updateDots() {
    const n = slides.length;
    const idx = ((index % n) + n) % n;
    dots.forEach((d, i) => d.classList.toggle("active", i === idx));
  }

  function moveToIndex(i) {
    if (isAnimating) return;
    isAnimating = true;
    const pos = -(slideWidth * (i + 1));
    track.style.transition = "transform 0.45s ease";
    track.style.transform = `translateX(${pos}px)`;

    setTimeout(() => {
      if (i >= slides.length) {
        track.style.transition = "none";
        i = 0;
        track.style.transform = `translateX(${-slideWidth}px)`;
      } else if (i < 0) {
        track.style.transition = "none";
        i = slides.length - 1;
        track.style.transform = `translateX(${-(slideWidth * (i + 1))}px)`;
      }
      index = i;
      updateDots();
      setTimeout(() => { isAnimating = false; }, 20);
    }, 480);
  }

  function startAuto() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      if (!autoPlay) return;
      index++;
      moveToIndex(index);
    }, 2200);
  }
  function stopAuto() {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
  }
  function restartAuto() {
    autoPlay = true;
    startAuto();
  }
  startAuto();

  nextBtn.addEventListener("click", () => {
    index++;
    moveToIndex(index);
    restartAuto();
  });
  prevBtn.addEventListener("click", () => {
    index--;
    moveToIndex(index);
    restartAuto();
  });

  container.addEventListener("mouseenter", () => { autoPlay = false; });
  container.addEventListener("mouseleave", () => { autoPlay = true; });

  let startX = 0;
  container.addEventListener("touchstart", (e) => {
    if (!e.touches) return;
    autoPlay = false;
    startX = e.touches[0].clientX;
  }, { passive: true });

  container.addEventListener("touchend", (e) => {
    if (!e.changedTouches) return;
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) index++;
      else index--;
      moveToIndex(index);
    }
    restartAuto();
  });

  window.addEventListener("resize", () => {
    calcSizesAndInit();
    const pos = -(slideWidth * (index + 1));
    track.style.transition = "none";
    track.style.transform = `translateX(${pos}px)`;
  });

});
