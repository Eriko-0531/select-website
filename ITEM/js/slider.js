/* ============================================================
   slider.js ― マルチスライダー対応・無制限カード・ループ安定版
============================================================ */

document.addEventListener("DOMContentLoaded", function () {

  const sliders = document.querySelectorAll(".slider-container");

  sliders.forEach((slider) => {

    const track = slider.querySelector(".slider-track");
    const slides = Array.from(slider.querySelectorAll(".card"));
    const prevBtn = slider.querySelector(".arrow.prev");
    const nextBtn = slider.querySelector(".arrow.next");
    const dotsWrap = slider.querySelector(".dots");

    let slidesPerView = window.innerWidth <= 768 ? 1 : 3;
    let currentIndex = 0;
    const slideCount = slides.length;

    // ドット生成
    function createDots() {
      dotsWrap.innerHTML = "";
      for (let i = 0; i < slideCount; i++) {
        const dot = document.createElement("span");
        if (i === 0) dot.classList.add("active");
        dot.addEventListener("click", () => {
          currentIndex = i;
          updateSlider();
        });
        dotsWrap.appendChild(dot);
      }
      return Array.from(dotsWrap.querySelectorAll("span"));
    }

    let dots = createDots();

    // スライド幅取得
    function getSlideWidth() {
      const style = getComputedStyle(slides[0]);
      const margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
      return slides[0].offsetWidth + margin;
    }

    // スライド更新
    function updateSlider() {
      const slideWidth = getSlideWidth();
      track.style.transform = `translateX(${-slideWidth * currentIndex}px)`;

      // ドット更新
      dots.forEach((d, i) => d.classList.toggle("active", i === currentIndex));
    }

    // 次へ
    function nextSlide() {
      const maxIndex = slideCount - slidesPerView;
      currentIndex++;

      if (currentIndex > maxIndex) {
        currentIndex = 0;
      }
      updateSlider();
    }

    // 前へ
    function prevSlide() {
      const maxIndex = slideCount - slidesPerView;
      currentIndex--;

      if (currentIndex < 0) {
        currentIndex = maxIndex;
      }
      updateSlider();
    }

    // ボタンイベント
    nextBtn.addEventListener("click", nextSlide);
    prevBtn.addEventListener("click", prevSlide);

// スワイプ対応（iPhone安定版）
let startX = 0;

// slider === .slider-container
slider.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
}, { passive: true });

slider.addEventListener("touchend", (e) => {
  const diff = e.changedTouches[0].clientX - startX;
  if (Math.abs(diff) > 50) {
    diff < 0 ? nextSlide() : prevSlide();
  }
});



    // 画面リサイズ対応
    window.addEventListener("resize", () => {
      slidesPerView = window.innerWidth <= 768 ? 1 : 3;
      updateSlider();
    });

    updateSlider();
  });

});
