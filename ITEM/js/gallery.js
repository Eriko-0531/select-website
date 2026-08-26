/* ============================================================
   gallery.js ― iOS含め完全安定版（サムネ再生成なし）
============================================================ */

document.addEventListener("DOMContentLoaded", function () {

  const modal = document.querySelector(".gallery-modal");
  const mainImg = modal.querySelector(".gallery-main-img");
  const caption = modal.querySelector(".gallery-caption");
  const closeBtn = modal.querySelector(".gallery-close");
  const prevBtn = modal.querySelector(".gallery-arrow.left");
  const nextBtn = modal.querySelector(".gallery-arrow.right");
  const thumbsContainer = modal.querySelector(".gallery-thumbs");

  let galleryData = [];
  let index = 0;

  /* ------------------------------------------------------------
     ▼ ギャラリーを開く（サムネは1回だけ生成）
  ------------------------------------------------------------ */
  function openGallery(data) {
    galleryData = data.map(g => ({
      src: g.src,
      text: g.text || "",
      thumb: g.src.replace("/1200/", "/150/")
    }));

    if (!galleryData.length) return;

    index = 0;

    // ✅ サムネは最初に1回だけ作る
    thumbsContainer.innerHTML = "";
    galleryData.forEach((g, i) => {
      const img = document.createElement("img");
      img.src = g.thumb;
      if (i === 0) img.classList.add("active");

      img.addEventListener("click", () => {
        index = i;
        updateGallery();
      });

      thumbsContainer.appendChild(img);
    });

    updateGallery();
    modal.style.display = "block";
  }

  /* ------------------------------------------------------------
     ▼ メイン画像更新 + active切り替えのみ
  ------------------------------------------------------------ */
  function updateGallery() {
    const item = galleryData[index];
    mainImg.src = item.src;
    caption.textContent = item.text;

    [...thumbsContainer.children].forEach((t, i) => {
      t.classList.toggle("active", i === index);
    });

    updateThumbnailPosition();
  }

  /* ------------------------------------------------------------
     ▼ サムネ自動追従（iOS Safari 完全対応）
  ------------------------------------------------------------ */
  function updateThumbnailPosition() {
    const container = thumbsContainer;
    const thumb = container.children[index];
    if (!thumb) return;

    const target =
      thumb.offsetLeft -
      (container.clientWidth / 2) +
      (thumb.offsetWidth / 2);

    const max = container.scrollWidth - container.clientWidth;

    // ✅ iOS対策：同期DOM確定後にスクロール
    requestAnimationFrame(() => {
      container.scrollLeft = Math.max(0, Math.min(target, max));
    });
  }

  /* ------------------------------------------------------------
     ▼ 次・前（ループ）
  ------------------------------------------------------------ */
  function nextImg() {
    index = (index + 1) % galleryData.length;
    updateGallery();
  }

  function prevImg() {
    index = (index - 1 + galleryData.length) % galleryData.length;
    updateGallery();
  }

  nextBtn.addEventListener("click", nextImg);
  prevBtn.addEventListener("click", prevImg);

  /* ------------------------------------------------------------
     ▼ スワイプ対応（縦スクロール阻害なし）
  ------------------------------------------------------------ */
  let startX = 0;

  mainImg.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  mainImg.addEventListener("touchend", e => {
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 40) {
      diff < 0 ? nextImg() : prevImg();
    }
  });

  /* ------------------------------------------------------------
     ▼ 閉じる
  ------------------------------------------------------------ */
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  /* ------------------------------------------------------------
     ▼ カードクリック → ギャラリー起動
  ------------------------------------------------------------ */
  document.querySelectorAll(".card").forEach(card => {
    const trigger = card.querySelector(".card-img-wrapper");
    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const json = card.dataset.gallery;
      if (!json) return;

      try {
        openGallery(JSON.parse(json));
      } catch (e) {
        console.warn("ギャラリーJSONエラー", e);
      }
    });
  });

});

  /* ------------------------------------------------------------
     ▼ キーボード操作（アクセシビリティ）
  ------------------------------------------------------------ */
  document.addEventListener("keydown", (e) => {
    // ギャラリーが閉じているときは何もしない
    if (modal.style.display !== "block") return;

    switch (e.key) {
      case "ArrowRight":
        nextImg();
        break;

      case "ArrowLeft":
        prevImg();
        break;

      case "Escape":
        modal.style.display = "none";
        break;
    }
  });
