/* G-SELECT お気に入りピックアップ機能（第1弾） - favorites.css と対で使用 */
(function () {
  "use strict";

  var STORAGE_KEY = "gsMeetingRecord_v1";
  var HEART_SVG =
    '<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-10.2-9.2C.3 8.6 1.4 5 4.9 4.1c2.1-.5 4.2.4 5.4 2.2l1.7 2.5 1.7-2.5c1.2-1.8 3.3-2.7 5.4-2.2 3.5.9 4.6 4.5 3.1 7.2C19.5 15.9 12 20.5 12 20.5z"/></svg>';

  function defaultState() {
    return { customerName: "", items: {}, memoText: "", memoDrawing: "" };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return defaultState();
      if (!parsed.items) parsed.items = {};
      if (typeof parsed.customerName !== "string") parsed.customerName = "";
      if (typeof parsed.memoText !== "string") parsed.memoText = "";
      if (typeof parsed.memoDrawing !== "string") parsed.memoDrawing = "";
      return parsed;
    } catch (e) {
      return defaultState();
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore quota errors */
    }
  }

  function countItems(state) {
    return Object.keys(state.items).length;
  }

  function keyFor(img) {
    return img ? img.src : "";
  }

  function buildPanel(state, onOutput, onClear, onMemoOpen) {
    var panel = document.createElement("div");
    panel.className = "gs-panel";
    panel.id = "gs-panel";
    panel.innerHTML =
      '<div class="gs-panel-header" id="gs-panel-header">' +
      '  <span class="gs-panel-header-title">お気に入りピックアップ<span class="gs-panel-count" id="gs-panel-count">0</span></span>' +
      '  <span class="gs-panel-toggle" id="gs-panel-toggle">▾</span>' +
      "</div>" +
      '<div class="gs-panel-body">' +
      '  <div class="gs-panel-label">顧客名</div>' +
      '  <input type="text" class="gs-panel-input" id="gs-panel-name" placeholder="例）山田様" autocomplete="off">' +
      '  <button type="button" class="gs-panel-btn gs-panel-memo-btn" id="gs-panel-memo">' +
      '    <span>メモを書く</span><span class="gs-panel-memo-dot" id="gs-panel-memo-dot"></span>' +
      "  </button>" +
      '  <div class="gs-panel-btns">' +
      '    <button type="button" class="gs-panel-btn" id="gs-panel-clear">クリア</button>' +
      '    <button type="button" class="gs-panel-btn gs-panel-btn--primary" id="gs-panel-output">記録を出力（PDF）</button>' +
      "  </div>" +
      "</div>";
    document.body.appendChild(panel);

    var nameInput = panel.querySelector("#gs-panel-name");
    nameInput.value = state.customerName || "";
    nameInput.addEventListener("input", function () {
      state.customerName = nameInput.value;
      saveState(state);
    });

    panel.querySelector("#gs-panel-header").addEventListener("click", function () {
      panel.classList.toggle("is-collapsed");
      panel.querySelector("#gs-panel-toggle").textContent = panel.classList.contains("is-collapsed") ? "▸" : "▾";
    });

    panel.querySelector("#gs-panel-output").addEventListener("click", onOutput);
    panel.querySelector("#gs-panel-clear").addEventListener("click", onClear);
    panel.querySelector("#gs-panel-memo").addEventListener("click", onMemoOpen);

    return panel;
  }

  function updateMemoIndicator(state) {
    var dot = document.getElementById("gs-panel-memo-dot");
    if (dot) dot.classList.toggle("is-visible", !!(state.memoText || state.memoDrawing));
  }

  function updateCount(state) {
    var el = document.getElementById("gs-panel-count");
    if (el) el.textContent = String(countItems(state));
  }

  function refreshBodyLock() {
    var lightbox = document.getElementById("gs-lightbox");
    var memo = document.getElementById("gs-memo-modal");
    var anyOpen =
      (lightbox && lightbox.classList.contains("is-open")) ||
      (memo && memo.classList.contains("is-open"));
    document.body.classList.toggle("gs-lightbox-lock", !!anyOpen);
  }

  function buildLightbox() {
    var box = document.createElement("div");
    box.className = "gs-lightbox";
    box.id = "gs-lightbox";
    box.innerHTML =
      '<button type="button" class="gs-lightbox-close" aria-label="閉じる">&times;</button>' +
      '<img class="gs-lightbox-img" src="" alt="">' +
      '<p class="gs-lightbox-caption"></p>';
    document.body.appendChild(box);

    var img = box.querySelector(".gs-lightbox-img");
    var caption = box.querySelector(".gs-lightbox-caption");

    function close() {
      box.classList.remove("is-open");
      img.src = "";
      refreshBodyLock();
    }

    box.querySelector(".gs-lightbox-close").addEventListener("click", close);
    box.addEventListener("click", function (evt) {
      if (evt.target === box) close();
    });
    document.addEventListener("keydown", function (evt) {
      if (evt.key === "Escape" && box.classList.contains("is-open")) close();
    });

    return function open(src, title) {
      img.src = src;
      img.alt = title || "";
      caption.textContent = title || "";
      box.classList.add("is-open");
      refreshBodyLock();
    };
  }

  function buildMemoModal(state) {
    var overlay = document.createElement("div");
    overlay.className = "gs-memo-modal";
    overlay.id = "gs-memo-modal";
    overlay.innerHTML =
      '<div class="gs-memo-card">' +
      '  <div class="gs-memo-header">' +
      '    <div class="gs-memo-tabs">' +
      '      <button type="button" class="gs-memo-tab is-active" data-mode="text">テキスト</button>' +
      '      <button type="button" class="gs-memo-tab" data-mode="draw">手描き</button>' +
      "    </div>" +
      '    <button type="button" class="gs-memo-close" aria-label="閉じる">&times;</button>' +
      "  </div>" +
      '  <div class="gs-memo-body">' +
      '    <textarea class="gs-memo-textarea" id="gs-memo-textarea" placeholder="商談メモを入力"></textarea>' +
      '    <div class="gs-memo-canvas-wrap" id="gs-memo-canvas-wrap">' +
      '      <canvas class="gs-memo-canvas" id="gs-memo-canvas"></canvas>' +
      "    </div>" +
      "  </div>" +
      '  <div class="gs-memo-footer">' +
      '    <button type="button" class="gs-panel-btn" id="gs-memo-clear">この内容をクリア</button>' +
      "  </div>" +
      "</div>";
    document.body.appendChild(overlay);

    var textarea = overlay.querySelector("#gs-memo-textarea");
    var canvasWrap = overlay.querySelector("#gs-memo-canvas-wrap");
    var canvas = overlay.querySelector("#gs-memo-canvas");
    var ctx = canvas.getContext("2d");
    var tabs = overlay.querySelectorAll(".gs-memo-tab");
    var currentMode = "text";
    var drawing = false;
    var lastX = 0;
    var lastY = 0;
    var canvasReady = false;

    function loadDrawingIntoCanvas() {
      var ratio = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (state.memoDrawing) {
        var image = new Image();
        image.onload = function () {
          ctx.drawImage(image, 0, 0, canvas.width / ratio, canvas.height / ratio);
        };
        image.src = state.memoDrawing;
      }
    }

    function setupCanvas() {
      var rect = canvasWrap.getBoundingClientRect();
      var ratio = window.devicePixelRatio || 1;
      var w = Math.max(1, Math.round(rect.width));
      var h = Math.max(1, Math.round(rect.height));
      if (canvasReady && canvas.width === Math.round(w * ratio) && canvas.height === Math.round(h * ratio)) return;

      canvas.width = Math.round(w * ratio);
      canvas.height = Math.round(h * ratio);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(ratio, ratio);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 2.5;
      canvasReady = true;
      loadDrawingIntoCanvas();
    }

    function setMode(mode) {
      currentMode = mode;
      tabs.forEach(function (t) {
        t.classList.toggle("is-active", t.getAttribute("data-mode") === mode);
      });
      textarea.style.display = mode === "text" ? "block" : "none";
      canvasWrap.style.display = mode === "draw" ? "block" : "none";
      if (mode === "draw") setupCanvas();
    }

    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        setMode(t.getAttribute("data-mode"));
      });
    });

    textarea.addEventListener("input", function () {
      state.memoText = textarea.value;
      saveState(state);
      updateMemoIndicator(state);
    });

    function pointerPos(evt) {
      var rect = canvas.getBoundingClientRect();
      return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
    }

    canvas.addEventListener("pointerdown", function (evt) {
      drawing = true;
      try {
        canvas.setPointerCapture(evt.pointerId);
      } catch (e) {
        /* ignore unsupported pointer capture */
      }
      var p = pointerPos(evt);
      lastX = p.x;
      lastY = p.y;
      evt.preventDefault();
    });

    canvas.addEventListener("pointermove", function (evt) {
      if (!drawing) return;
      var p = pointerPos(evt);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      lastX = p.x;
      lastY = p.y;
      evt.preventDefault();
    });

    function endStroke() {
      if (!drawing) return;
      drawing = false;
      state.memoDrawing = canvas.toDataURL("image/png");
      saveState(state);
      updateMemoIndicator(state);
    }

    canvas.addEventListener("pointerup", endStroke);
    canvas.addEventListener("pointerleave", endStroke);
    canvas.addEventListener("pointercancel", endStroke);

    overlay.querySelector("#gs-memo-clear").addEventListener("click", function () {
      if (currentMode === "text") {
        textarea.value = "";
        state.memoText = "";
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        state.memoDrawing = "";
      }
      saveState(state);
      updateMemoIndicator(state);
    });

    function close() {
      overlay.classList.remove("is-open");
      refreshBodyLock();
    }

    overlay.querySelector(".gs-memo-close").addEventListener("click", close);
    document.addEventListener("keydown", function (evt) {
      if (evt.key === "Escape" && overlay.classList.contains("is-open")) close();
    });

    return {
      open: function () {
        textarea.value = state.memoText || "";
        setMode("text");
        overlay.classList.add("is-open");
        refreshBodyLock();
      },
      reset: function () {
        textarea.value = "";
        canvasReady = false;
        if (canvas.width && canvas.height) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }

  function attachHearts(state, openLightbox) {
    var targets = document.querySelectorAll("[data-gs-fav]");
    targets.forEach(function (el) {
      var img = el.querySelector("img");

      // SELECT ITEM の「施工例を見る」ギャラリー付きカードは独自のクリックでモーダルを開くため、
      // ここでの拡大表示（gs-lightbox）は付けない（二重にモーダルが開くのを防ぐ）
      var hasOwnGallery = !!el.closest("[data-gallery]");

      if (img && !hasOwnGallery && !el.__gsLightboxBound) {
        el.__gsLightboxBound = true;
        el.classList.add("gs-zoomable");
        el.addEventListener("click", function () {
          openLightbox(img.src, el.getAttribute("data-gs-title"));
        });
      }

      if (el.querySelector(":scope > .gs-fav-btn")) return;

      var key = keyFor(img);
      if (!key) return;

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gs-fav-btn";
      btn.innerHTML = HEART_SVG;
      btn.setAttribute("aria-label", "気に入りに追加");

      if (state.items[key]) {
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
      } else {
        btn.setAttribute("aria-pressed", "false");
      }

      btn.addEventListener("click", function (evt) {
        evt.preventDefault();
        evt.stopPropagation();

        var isActive = btn.classList.toggle("is-active");
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
        btn.classList.remove("is-pop");
        void btn.offsetWidth;
        btn.classList.add("is-pop");

        if (isActive) {
          state.items[key] = {
            title: el.getAttribute("data-gs-title") || "",
            category: el.getAttribute("data-gs-category") || "",
            img: key,
            addedAt: Date.now()
          };
        } else {
          delete state.items[key];
        }

        saveState(state);
        updateCount(state);

        if (typeof gtag === "function") {
          gtag("event", isActive ? "favorite_add" : "favorite_remove", {
            item_title: el.getAttribute("data-gs-title") || "",
            item_category: el.getAttribute("data-gs-category") || ""
          });
        }
      });

      el.appendChild(btn);
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function buildPrintSheet(state) {
    var sheet = document.getElementById("gs-print-sheet");
    if (!sheet) {
      sheet = document.createElement("div");
      sheet.id = "gs-print-sheet";
      document.body.appendChild(sheet);
    }

    var items = Object.keys(state.items).map(function (k) {
      return state.items[k];
    });

    var groups = {};
    items.forEach(function (item) {
      var cat = item.category || "その他";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    var today = new Date();
    var dateStr =
      today.getFullYear() + "年" + (today.getMonth() + 1) + "月" + today.getDate() + "日";

    var html = "";
    html += '<img class="gs-print-logo" src="https://www.ground-f.com/assets/images/common/headLogo.svg?20230510" alt="グランド工房">';
    html += '<h1 class="gs-print-title">G-SELECT お気に入りピックアップ</h1>';
    html +=
      '<p class="gs-print-meta">顧客名：' +
      escapeHtml(state.customerName || "（未入力）") +
      "　／　記録日：" +
      dateStr +
      "　／　気に入り件数：" +
      items.length +
      "件</p>";

    if (state.memoText || state.memoDrawing) {
      html += '<div class="gs-print-memo">';
      html += "<h2>メモ</h2>";
      if (state.memoText) {
        html += '<p class="gs-print-memo-text">' + escapeHtml(state.memoText).replace(/\n/g, "<br>") + "</p>";
      }
      if (state.memoDrawing) {
        html += '<img class="gs-print-memo-drawing" src="' + state.memoDrawing + '" alt="手描きメモ">';
      }
      html += "</div>";
    }

    if (items.length === 0) {
      html += '<p class="gs-print-empty">気に入り登録された写真はありません。</p>';
    } else {
      Object.keys(groups)
        .sort()
        .forEach(function (cat) {
          html += '<div class="gs-print-group"><h2>' + escapeHtml(cat) + '</h2><div class="gs-print-grid">';
          groups[cat].forEach(function (item) {
            html +=
              '<div class="gs-print-card"><img src="' +
              item.img +
              '" alt=""><p>' +
              escapeHtml(item.title) +
              "</p></div>";
          });
          html += "</div></div>";
        });
    }

    sheet.innerHTML = html;
    return items.length;
  }

  function handleOutput(state) {
    try {
      var count = buildPrintSheet(state);
      if (count === 0 && !state.memoText && !state.memoDrawing) {
        alert("気に入り登録された写真もメモもありません。ハートをタップするかメモを入力してから出力してください。");
        return;
      }
      if (typeof window.print !== "function") {
        alert("この端末・ブラウザでは印刷機能を利用できません。");
        return;
      }

      if (typeof gtag === "function") {
        gtag("event", "pdf_export", {
          item_count: count,
          has_memo: !!(state.memoText || state.memoDrawing)
        });
      }

      var printStarted = false;
      var onBeforePrint = function () {
        printStarted = true;
      };
      window.addEventListener("beforeprint", onBeforePrint);

      window.print();

      setTimeout(function () {
        window.removeEventListener("beforeprint", onBeforePrint);
        if (!printStarted) {
          alert(
            "印刷画面が開けなかったようです。SlackやLINEなどアプリ内のブラウザで開いている場合は、Safari（または Chrome）で開き直してからもう一度お試しください。"
          );
        }
      }, 1200);
    } catch (e) {
      alert("出力中にエラーが発生しました。開発者に次の内容をお伝えください：\n" + (e && e.message ? e.message : e));
    }
  }

  function handleClear(state, memo) {
    if (!confirm("お気に入りピックアップの記録（顧客名・気に入り・メモ）をクリアします。よろしいですか？")) return;

    state.customerName = "";
    state.items = {};
    state.memoText = "";
    state.memoDrawing = "";
    saveState(state);

    var nameInput = document.getElementById("gs-panel-name");
    if (nameInput) nameInput.value = "";

    document.querySelectorAll(".gs-fav-btn.is-active").forEach(function (btn) {
      btn.classList.remove("is-active");
      btn.setAttribute("aria-pressed", "false");
    });

    if (memo) memo.reset();
    updateCount(state);
    updateMemoIndicator(state);
  }

  function attachPanelOpeners(panel) {
    document.querySelectorAll("[data-gs-open-panel]").forEach(function (btn) {
      btn.addEventListener("click", function (evt) {
        evt.preventDefault();
        panel.classList.remove("is-collapsed");
        var toggle = document.getElementById("gs-panel-toggle");
        if (toggle) toggle.textContent = "▾";

        panel.classList.remove("gs-panel-flash");
        void panel.offsetWidth;
        panel.classList.add("gs-panel-flash");

        var nameInput = document.getElementById("gs-panel-name");
        if (nameInput) nameInput.focus();
      });
    });
  }

  function init() {
    var state = loadState();
    var memo = buildMemoModal(state);
    var panel = buildPanel(
      state,
      function () {
        handleOutput(state);
      },
      function () {
        handleClear(state, memo);
      },
      function () {
        memo.open();
      }
    );
    attachPanelOpeners(panel);
    var openLightbox = buildLightbox();
    attachHearts(state, openLightbox);
    updateCount(state);
    updateMemoIndicator(state);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
