/* ===========================================================
   auto-slider-youtube.js
   ・YouTube用（軽量・安定・無限ループ・1.5s 自動）
   ・クリックでモーダル再生（自動スライド停止）
   ・スライド内に iframe または data-src の両方をサポート
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const container = document.querySelector(".youtube-slider");
  if (!container) return; // 該当がなければ終了

  const track = container.querySelector(".slider-track");
  let slides = Array.from(container.querySelectorAll(".youtube-slide"));
  const prevBtn = container.querySelector(".arrow.prev");
  const nextBtn = container.querySelector(".arrow.next");
  const dotsWrap = container.querySelector(".dots");

  /********** モーダル要素 **********/
  const modal = document.getElementById("yt-modal");
  const modalPlayer = modal.querySelector(".yt-modal-player");
  const modalClose = modal.querySelector(".yt-modal-close");
  const modalBackdrop = modal.querySelector(".yt-modal-backdrop");

  /********** 内部状態 **********/
  let index = 0;                     // 現在のスライド index（0 から）
  let slideWidth = 0;                // 1スライド幅（ピクセル）
  let autoPlay = true;               // 自動スライド許可フラグ
  let intervalId = null;             // 自動スライドの setInterval ID

  /********** 事前準備：スライド内の動画ソース抽出 & サムネ作成 **********/
  // 各スライドについて以下を実行：
  // - iframe があれば src を取得（そして DOM から iframe を削除）
  // - data-src があればそれを使う
  // - 取得した動画URLから thumbnail を生成して <img class="thumb"> を挿入

  slides.forEach((slide) => {
    // 優先：iframe の src を使う
    const iframe = slide.querySelector("iframe");
    let src = null;

    if (iframe && iframe.src) {
      src = iframe.src;
      // iframe を DOM から削除（ページロード時に重複読み込みしないため）
      iframe.remove();
    }

    // もし data-src 属性があるならそちらを使う（例: data-src="https://www.youtube.com/embed/ID"）
    if (!src && slide.dataset && slide.dataset.src) {
      src = slide.dataset.src;
    }

    // 最終的にソースが取れなければ空文字（クリックしても何もしない）
    slide.dataset.video = src || "";

    // サムネイル画像を自動で作る（YouTube の標準 URL を使用）
    if (src) {
      // src から video ID を抽出（embed/VIDEO_ID の形式を想定）
      const m = src.match(/\/embed\/([a-zA-Z0-9_-]{6,})/);
      const vid = m ? m[1] : null;
      const thumbUrl = vid ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg` : "";

      // 既にサムネがない場合は挿入
      if (thumbUrl) {
        const img = document.createElement("img");
        img.className = "thumb";
        img.alt = "YouTubeサムネイル";
        img.src = thumbUrl;
        slide.prepend(img);
      }
    } else {
      // 動画ソースが無い場合はプレースホルダ
      const ph = document.createElement("div");
      ph.style.padding = "20px";
      ph.style.color = "#fff";
      ph.style.textAlign = "center";
      ph.textContent = "動画が設定されていません";
      slide.prepend(ph);
    }
  });

  // 再取得（iframe が削除されているので純粋なスライド要素群）
  slides = Array.from(container.querySelectorAll(".youtube-slide"));

  /********** 無限ループのための複製（複製は軽い要素のみ） **********/
  // 複製は"サムネのあるノード"のみ（iframeは入っていない）
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);
  track.appendChild(firstClone);
  track.insertBefore(lastClone, track.firstChild);

  // スライド要素を再取得（クローン含む）
  const allSlides = Array.from(track.children);

  /********** 幅計算 & 初期位置設定 **********/
  function calcSizesAndInit() {
    // スライド幅は最初の実際スライド（クローンではない）を使う
    // 注意：スライドの margin を含めた幅を計算する
    const style = window.getComputedStyle(slides[0]);
    const marginLeft = parseFloat(style.marginLeft) || 0;
    const marginRight = parseFloat(style.marginRight) || 0;
    slideWidth = slides[0].offsetWidth + marginLeft + marginRight;

    // 初期位置（先頭クローンの分だけ左へ）
    const initialPos = -slideWidth;
    track.style.transition = "none";
    track.style.transform = `translateX(${initialPos}px)`;
  }

  calcSizesAndInit();

  /********** ドット生成 **********/
  function createDots() {
    dotsWrap.innerHTML = "";
    // ドット数は実際スライド数（クローンの元の枚数）
    for (let i = 0; i < slides.length; i++) {
      const dot = document.createElement("span");
      dot.className = (i === 0) ? "active" : "";
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

  /********** ドット更新 **********/
  function updateDots() {
    const n = slides.length;
    const idx = ((index % n) + n) % n; // 正規化
    dots.forEach((d, i) => d.classList.toggle("active", i === idx));
  }

  /********** スライド移動 **********/
  let isAnimating = false;
  function moveToIndex(i) {
    if (isAnimating) return;
    isAnimating = true;
    // 計算位置（クローン分 + index）
    const pos = -(slideWidth * (i + 1));
    track.style.transition = "transform 0.45s ease";
    track.style.transform = `translateX(${pos}px)`;

    // 補正用タイマー（transition 完了後）
    setTimeout(() => {
      // 無限ループ補正
      if (i >= slides.length) {
        // 末尾を通過 → 本来の先頭へ
        track.style.transition = "none";
        i = 0;
        track.style.transform = `translateX(${-slideWidth}px)`;
      } else if (i < 0) {
        // 先頭を通過 → 本来の末尾へ
        track.style.transition = "none";
        i = slides.length - 1;
        track.style.transform = `translateX(${-(slideWidth * (i + 1))}px)`;
      }
      index = i;
      updateDots();
      // small delay to allow next animation
      setTimeout(() => { isAnimating = false; }, 20);
    }, 480);
  }

  /********** 自動スライド（1.5秒） **********/
  function startAuto() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      if (!autoPlay) return;
      index++;
      moveToIndex(index);
    }, 1500);
  }
  function stopAuto() {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
  }
  function restartAuto() {
    autoPlay = true;
    startAuto();
  }

  // 初回スタート
  startAuto();

  /********** 矢印操作 **********/
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

  /********** タッチスワイプ（簡易版） **********/
  let startX = 0;
  container.addEventListener("touchstart", (e) => {
    if (!e.touches) return;
    startX = e.touches[0].clientX;
  }, { passive: true });

  container.addEventListener("touchend", (e) => {
    if (!e.changedTouches) return;
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) index++;
      else index--;
      moveToIndex(index);
      restartAuto();
    }
  });

  /********** クリックでモーダルを開く（サムネまたはiframeをクリック） **********/
  slides.forEach((slide, i) => {
    slide.addEventListener("click", (e) => {
      const videoSrc = slide.dataset.video || "";
      if (!videoSrc) return; // 動画情報が無ければ無視

      // 一旦停止してモーダルを開く
      autoPlay = false;
      stopAuto();

      openModalWithVideo(videoSrc);
    });
  });

  /********** モーダル制御 **********/
  function openModalWithVideo(src) {
    // src に autoplay=1 を付与（既にパラメータがあれば &autoplay=1 を追加）
    let url = src;
    if (!/autoplay=1/.test(url)) {
      url += (url.indexOf("?") === -1) ? "?autoplay=1" : "&autoplay=1";
    }
    // セキュア属性追加（optional）
    // 埋め込みを生成（sandbox等が必要ならここで付ける）
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.width = "100%";
    iframe.height = "100%";
    iframe.frameBorder = "0";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;

    // 既存プレーヤーをクリアして新しく追加
    modalPlayer.innerHTML = "";
    modalPlayer.appendChild(iframe);

    // show modal
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    // iframe を完全に消して再生停止
    modalPlayer.innerHTML = "";
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");

    // 自動再開は行わない（仕様：再生後は手動で再開して欲しい）。もし再開したければ次行を有効化：
    // autoPlay = true; startAuto();

    // 仕様通り：自動スライドを停止したままにしておく（安全）
  }

  modalClose.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", closeModal);

  // Escキーで閉じる
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) {
      closeModal();
    }
  });

  /********** リサイズ時の挙動（幅再計算） **********/
  window.addEventListener("resize", () => {
    calcSizesAndInit();
    // 現在インデックスに合わせて位置を即時反映
    const pos = -(slideWidth * (index + 1));
    track.style.transition = "none";
    track.style.transform = `translateX(${pos}px)`;
  });

}); // DOMContentLoaded end
