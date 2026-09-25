(function () {
  "use strict";

  var homeUrl = "../index.html";

  /* ==========================================================================
     1. محرك عزل وتصحيح النصوص المختلطة الأسطوري (BiDi Isolation Engine)
     ========================================================================== */

  function injectBiDiStyles() {
    if (document.getElementById("snwat-bidi-style")) return;
    var style = document.createElement("style");
    style.id = "snwat-bidi-style";
    style.textContent = 
      ".bidi-ltr-isolate {" +
      "  direction: ltr !important;" +
      "  unicode-bidi: isolate !important;" +
      "  display: inline-block !important;" +
      "  text-align: left !important;" +
      "  vertical-align: baseline !important;" +
      "  white-space: nowrap !important;" +
      "  font-family: inherit !important;" +
      "}";
    document.head.appendChild(style);
  }

  var LTR_REGEX = new RegExp(
    "(" +
      "\\{[a-zA-Z0-9_,\\s-]+\\}" +
      "|\\([a-zA-Z0-9_+\\-*\\/=<>.,\\s%≈~]+\\)" +
      "|\\b\\d{1,3}(?:\\.\\d{1,3}){3}(?:\\/\\d{1,2})?\\b" +
      "|\\/\\d{1,2}\\b" +
      "|\\b[0-9a-fA-F]{2}(?::[0-9a-fA-F]{2})+\\b" +
      "|\\b\\d+(?:\\.\\d+)?\\s*(?:bits?|bytes?|kbps|Mbps|Gbps|ms|sec|s|packets?(?:\\/s)?|users?|RTT|km|m\\/s|%)\\b" +
      "|[a-zA-Z0-9_.%]+(?:\\s*[-+*\\/=<>≈×÷]\\s*[a-zA-Z0-9_.%]+)+" +
      "|[a-zA-Z0-9_]+(?:\\s*=\\s*[a-zA-Z0-9_]+)+" +
      "|[a-zA-Z][a-zA-Z0-9_.*#\\-\\/]*" +
    ")",
    "g"
  );

  function isolateTextNode(textNode) {
    var val = textNode.nodeValue;
    if (!val || !val.trim()) return;
    if (!/[\u0600-\u06FF]/.test(val)) return;
    if (textNode.parentNode && textNode.parentNode.closest(".bidi-ltr-isolate")) return;

    var parts = val.split(LTR_REGEX);
    if (parts.length <= 1) return;

    var frag = document.createDocumentFragment();
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      if (!part) continue;

      LTR_REGEX.lastIndex = 0;
      if (LTR_REGEX.test(part)) {
        var span = document.createElement("span");
        span.className = "bidi-ltr-isolate";
        span.dir = "ltr";
        span.textContent = part;
        frag.appendChild(span);
      } else {
        frag.appendChild(document.createTextNode(part));
      }
    }

    textNode.parentNode.replaceChild(frag, textNode);
  }

  function scanAndFixBiDi(root) {
    if (!root) root = document.body;
    if (!root) return;

    var walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          var p = node.parentNode;
          if (!p) return NodeFilter.FILTER_REJECT;
          var tag = p.nodeName;

          if (
            tag === "SCRIPT" || tag === "STYLE" || tag === "PRE" ||
            tag === "CODE" || tag === "TEXTAREA" || tag === "INPUT" ||
            tag === "SELECT" || tag === "SVG" ||
            p.classList.contains("bidi-ltr-isolate") ||
            p.closest("svg")
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      },
      false
    );

    var textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach(isolateTextNode);
  }

  /* ==========================================================================
     2. محرك التكبير والتحكم بالصور فوق اليمين بدون تغطية أو سحب مزعج (Zoom & Pan)
     ========================================================================== */

  function injectImageZoomStyles() {
    if (document.getElementById("snwat-img-zoom-style")) return;
    var style = document.createElement("style");
    style.id = "snwat-img-zoom-style";
    style.textContent = 
      ".q-image-container {" +
      "  position: relative !important;" +
      "  margin: 14px 0 !important;" +
      "  text-align: center !important;" +
      "}" +
      "/* شريط الأدوات أعلى اليمين بشكل مستقل دون حجب الصورة */" +
      ".img-zoom-toolbar {" +
      "  display: flex !important;" +
      "  align-items: center !important;" +
      "  justify-content: flex-end !important;" +
      "  margin-bottom: 6px !important;" +
      "  width: 100% !important;" +
      "  direction: ltr !important;" +
      "}" +
      ".img-zoom-controls {" +
      "  display: inline-flex !important;" +
      "  align-items: center !important;" +
      "  gap: 3px !important;" +
      "  background: rgba(28, 28, 30, 0.85) !important;" +
      "  backdrop-filter: blur(14px) !important;" +
      "  -webkit-backdrop-filter: blur(14px) !important;" +
      "  border: 1px solid rgba(255, 255, 255, 0.16) !important;" +
      "  border-radius: 8px !important;" +
      "  padding: 3px 6px !important;" +
      "  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35) !important;" +
      "}" +
      ".img-zoom-btn {" +
      "  background: transparent !important;" +
      "  border: none !important;" +
      "  color: #e5e5ea !important;" +
      "  width: 26px !important;" +
      "  height: 26px !important;" +
      "  border-radius: 6px !important;" +
      "  display: flex !important;" +
      "  align-items: center !important;" +
      "  justify-content: center !important;" +
      "  cursor: pointer !important;" +
      "  font-family: 'JetBrains Mono', Consolas, sans-serif !important;" +
      "  font-size: 14px !important;" +
      "  font-weight: bold !important;" +
      "  line-height: 1 !important;" +
      "  transition: background 0.15s, color 0.15s, transform 0.1s !important;" +
      "}" +
      ".img-zoom-btn:hover {" +
      "  background: rgba(255, 255, 255, 0.18) !important;" +
      "  color: #fff !important;" +
      "}" +
      ".img-zoom-btn:active {" +
      "  transform: scale(0.92) !important;" +
      "}" +
      "/* إطار عرض الصورة المعزول لمنع خروجها عند التكبير */" +
      ".img-zoom-viewport {" +
      "  position: relative !important;" +
      "  overflow: hidden !important;" +
      "  width: 100% !important;" +
      "  display: flex !important;" +
      "  justify-content: center !important;" +
      "  align-items: center !important;" +
      "  border-radius: 8px !important;" +
      "  border: 1px solid rgba(255, 255, 255, 0.1) !important;" +
      "  background: rgba(0, 0, 0, 0.2) !important;" +
      "}" +
      "/* منع المتصفح من سحب الصورة تلقائياً وإلغاء التحديد المزعج */" +
      ".img-zoom-viewport img {" +
      "  max-width: 100% !important;" +
      "  height: auto !important;" +
      "  border-radius: 6px !important;" +
      "  transition: transform 0.12s ease-out !important;" +
      "  transform-origin: center center !important;" +
      "  -webkit-user-drag: none !important;" +
      "  -khtml-user-drag: none !important;" +
      "  -moz-user-drag: none !important;" +
      "  -o-user-drag: none !important;" +
      "  user-drag: none !important;" +
      "  user-select: none !important;" +
      "  -webkit-user-select: none !important;" +
      "}" +
      "/* نافذة عرض ملء الشاشة */" +
      ".img-lightbox-modal {" +
      "  position: fixed;" +
      "  top: 0;" +
      "  left: 0;" +
      "  width: 100vw;" +
      "  height: 100vh;" +
      "  background: rgba(0, 0, 0, 0.9);" +
      "  backdrop-filter: blur(16px);" +
      "  -webkit-backdrop-filter: blur(16px);" +
      "  display: flex;" +
      "  align-items: center;" +
      "  justify-content: center;" +
      "  z-index: 9999;" +
      "  cursor: zoom-out;" +
      "  opacity: 0;" +
      "  pointer-events: none;" +
      "  transition: opacity 0.25s ease;" +
      "}" +
      ".img-lightbox-modal.active {" +
      "  opacity: 1;" +
      "  pointer-events: auto;" +
      "}" +
      ".img-lightbox-modal img {" +
      "  max-width: 92vw;" +
      "  max-height: 90vh;" +
      "  border-radius: 8px;" +
      "  box-shadow: 0 10px 30px rgba(0,0,0,0.6);" +
      "  cursor: default;" +
      "  -webkit-user-drag: none !important;" +
      "  user-drag: none !important;" +
      "}" +
      ".img-lightbox-close {" +
      "  position: absolute;" +
      "  top: 18px;" +
      "  right: 22px;" +
      "  background: rgba(255, 255, 255, 0.15);" +
      "  color: #fff;" +
      "  border: 1px solid rgba(255, 255, 255, 0.25);" +
      "  font-size: 20px;" +
      "  width: 38px;" +
      "  height: 38px;" +
      "  border-radius: 50%;" +
      "  display: flex;" +
      "  align-items: center;" +
      "  justify-content: center;" +
      "  cursor: pointer;" +
      "}";
    document.head.appendChild(style);
  }

  function getLightboxModal() {
    var modal = document.getElementById("snwat-img-lightbox");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "snwat-img-lightbox";
      modal.className = "img-lightbox-modal";
      modal.innerHTML = 
        '<button class="img-lightbox-close" aria-label="Close">✕</button>' +
        '<img src="" alt="Full preview" draggable="false" />';

      modal.addEventListener("click", function (e) {
        if (e.target !== modal.querySelector("img")) {
          modal.classList.remove("active");
        }
      });
      document.body.appendChild(modal);
    }
    return modal;
  }

  function setupImageZoomContainer(container) {
    if (container.dataset.zoomReady) return;
    var img = container.querySelector("img");
    if (!img) return;

    container.dataset.zoomReady = "1";

    // تغليف الصورة داخل إطار عرض Viewport معزول
    var viewport = container.querySelector(".img-zoom-viewport");
    if (!viewport) {
      viewport = document.createElement("div");
      viewport.className = "img-zoom-viewport";
      img.parentNode.insertBefore(viewport, img);
      viewport.appendChild(img);
    }

    // منع المتصفح من عمل Ghost Drag للصورة نهائياً
    img.setAttribute("draggable", "false");
    img.addEventListener("dragstart", function (e) {
      e.preventDefault();
      return false;
    });

    var scale = 1;
    var translateX = 0;
    var translateY = 0;
    var isDragging = false;
    var startX = 0;
    var startY = 0;

    function applyTransform() {
      img.style.transform = "translate(" + translateX + "px, " + translateY + "px) scale(" + scale + ")";
      var cursorStyle = scale > 1 ? (isDragging ? "grabbing" : "grab") : "default";
      img.style.cursor = cursorStyle;
      viewport.style.cursor = cursorStyle;
    }

    function resetZoom() {
      scale = 1;
      translateX = 0;
      translateY = 0;
      applyTransform();
    }

    // بناء شريط الأدوات ووضعه في الأعلى فوق اليمين دون أن يلمس أو يغطي الصورة
    var toolbar = container.querySelector(".img-zoom-toolbar");
    if (!toolbar) {
      toolbar = document.createElement("div");
      toolbar.className = "img-zoom-toolbar";

      var controls = document.createElement("div");
      controls.className = "img-zoom-controls";

      var btnIn = document.createElement("button");
      btnIn.className = "img-zoom-btn";
      btnIn.title = "تكبير (+)";
      btnIn.textContent = "+";
      btnIn.onclick = function (e) {
        e.stopPropagation();
        scale = Math.min(4, Math.round((scale + 0.3) * 10) / 10);
        applyTransform();
      };

      var btnOut = document.createElement("button");
      btnOut.className = "img-zoom-btn";
      btnOut.title = "تصغير (−)";
      btnOut.textContent = "−";
      btnOut.onclick = function (e) {
        e.stopPropagation();
        scale = Math.max(1, Math.round((scale - 0.3) * 10) / 10);
        if (scale === 1) { translateX = 0; translateY = 0; }
        applyTransform();
      };

      var btnReset = document.createElement("button");
      btnReset.className = "img-zoom-btn";
      btnReset.title = "إعادة الضبط الطبيعي";
      btnReset.textContent = "↺";
      btnReset.onclick = function (e) {
        e.stopPropagation();
        resetZoom();
      };

      var btnFull = document.createElement("button");
      btnFull.className = "img-zoom-btn";
      btnFull.title = "عرض ملء الشاشة";
      btnFull.textContent = "⤢";
      btnFull.onclick = function (e) {
        e.stopPropagation();
        var modal = getLightboxModal();
        var fullImg = modal.querySelector("img");
        fullImg.src = img.src || img.dataset.src;
        fullImg.setAttribute("draggable", "false");
        modal.classList.add("active");
      };

      controls.appendChild(btnIn);
      controls.appendChild(btnOut);
      controls.appendChild(btnReset);
      controls.appendChild(btnFull);
      toolbar.appendChild(controls);

      // إدراج شريط الأدوات قبل الـ viewport ليبقى في سطر مستقل بالأعلى
      container.insertBefore(toolbar, viewport);
    }

    // تفعيل السحب والتحريك السلس بالفأرة للـ PC دون تفعيل الـ Drag الخاص بالمتصفح
    viewport.addEventListener("mousedown", function (e) {
      if (scale <= 1 || e.target.closest(".img-zoom-toolbar")) return;
      e.preventDefault(); // يمنع شبح السحب للمتصفح نهائياً!
      isDragging = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
      applyTransform();
    });

    window.addEventListener("mousemove", function (e) {
      if (!isDragging) return;
      e.preventDefault();
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      applyTransform();
    });

    window.addEventListener("mouseup", function () {
      if (isDragging) {
        isDragging = false;
        applyTransform();
      }
    });

    // دعم السحب باللمس للهواتف
    viewport.addEventListener("touchstart", function (e) {
      if (scale <= 1 || e.touches.length !== 1 || e.target.closest(".img-zoom-toolbar")) return;
      isDragging = true;
      startX = e.touches[0].clientX - translateX;
      startY = e.touches[0].clientY - translateY;
    }, { passive: true });

    viewport.addEventListener("touchmove", function (e) {
      if (!isDragging || e.touches.length !== 1) return;
      translateX = e.touches[0].clientX - startX;
      translateY = e.touches[0].clientY - startY;
      applyTransform();
    }, { passive: true });

    viewport.addEventListener("touchend", function () {
      isDragging = false;
    });

    // النقر المزدوج للتكبير/إعادة الضبط
    viewport.addEventListener("dblclick", function (e) {
      if (e.target.closest(".img-zoom-toolbar")) return;
      e.preventDefault();
      if (scale > 1) {
        resetZoom();
      } else {
        scale = 2;
        applyTransform();
      }
    });
  }

  function scanAndInitImageZoom(root) {
    if (!root) root = document.body;
    if (!root) return;
    var containers = root.querySelectorAll(".q-image-container");
    containers.forEach(setupImageZoomContainer);
  }

  /* ==========================================================================
     3. تشغيل المحركات ومراقبة التغييرات (Engine Inits & Observers)
     ========================================================================== */

  var mainObserver = null;
  function startSiteEngines() {
    injectBiDiStyles();
    injectImageZoomStyles();

    scanAndFixBiDi(document.body);
    scanAndInitImageZoom(document.body);

    if (!mainObserver && window.MutationObserver) {
      mainObserver = new MutationObserver(function (mutations) {
        var needsScan = false;
        for (var i = 0; i < mutations.length; i++) {
          var m = mutations[i];
          if (m.addedNodes.length > 0) {
            for (var j = 0; j < m.addedNodes.length; j++) {
              var el = m.addedNodes[j];
              if (el.nodeType === 1 && !el.classList.contains("bidi-ltr-isolate")) {
                needsScan = true;
                break;
              }
            }
          }
          if (needsScan) break;
        }

        if (needsScan) {
          mainObserver.disconnect();
          scanAndFixBiDi(document.body);
          scanAndInitImageZoom(document.body);
          mainObserver.observe(document.body, { childList: true, subtree: true });
        }
      });

      mainObserver.observe(document.body, { childList: true, subtree: true });
    }
  }

  /* ==========================================================================
     4. تأثيرات التنقل الموحدة (Page Transitions)
     ========================================================================== */

  function setupPageTransition() {
    var transition = document.createElement("div");
    transition.className = "page-transition";
    transition.setAttribute("aria-hidden", "true");
    transition.innerHTML = '<span class="page-transition-mark"></span>';
    document.body.appendChild(transition);

    requestAnimationFrame(function () {
      transition.classList.add("is-ready");
    });

    return transition;
  }

  /* ==========================================================================
     5. نافذة التبليغ المنبثقة (Bug Report Modal)
     ========================================================================== */

  var openBtn = document.getElementById("openReportBtn");
  var closeBtn = document.getElementById("closeReportBtn");
  var overlay = document.getElementById("reportOverlay");
  var form = document.getElementById("bugReportForm");
  var statusDiv = document.getElementById("reportStatus");
  var submitBtn = document.getElementById("submitReportBtn");

  function openModal() {
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    statusDiv.className = "report-status";
    statusDiv.style.display = "none";
  }

  function closeModal() {
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
  }

  if (openBtn) openBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });
  }

  if (form) {
    var WORKER_ENDPOINT = "https://justsnwat-reporter.abdalserhan20.workers.dev/";

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var fileInput = document.getElementById("issue-file");
      var file = fileInput && fileInput.files ? fileInput.files[0] : null;

      if (file && file.size > 8 * 1024 * 1024) {
        statusDiv.className = "report-status error";
        statusDiv.style.display = "block";
        statusDiv.textContent = "حجم الصورة كبير جداً، الحد الأقصى هو 8 ميجابايت.";
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "جارِ الإرسال...";
      statusDiv.style.display = "none";

      var formData = new FormData();
      formData.append("issueType", document.getElementById("issue-type").value);
      formData.append("issueDesc", document.getElementById("issue-desc").value);
      formData.append("userContact", document.getElementById("user-contact").value.trim() || "غير محدد");
      formData.append("currentUrl", window.location.href);

      if (file) {
        formData.append("imageFile", file);
      }

      fetch(WORKER_ENDPOINT, {
        method: "POST",
        body: formData
      })
      .then(function (res) {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(function (data) {
        if (data.success) {
          statusDiv.className = "report-status success";
          statusDiv.style.display = "block";
          statusDiv.textContent = "تم إرسال البلاغ بنجاح، شكراً لك!";
          form.reset();

          setTimeout(function () {
            closeModal();
            submitBtn.disabled = false;
            submitBtn.textContent = "إرسال البلاغ";
          }, 2000);
        } else {
          throw new Error(data.error || "Server error");
        }
      })
      .catch(function () {
        statusDiv.className = "report-status error";
        statusDiv.style.display = "block";
        statusDiv.textContent = "حدث خطأ أثناء الإرسال، تأكد من اتصالك بالإنترنت.";
        submitBtn.disabled = false;
        submitBtn.textContent = "إرسال البلاغ";
      });
    });
  }

  /* ==========================================================================
     6. القالب الموحد والتنقل العائم (Shell & Floating Nav)
     ========================================================================== */

  function useSharedShell() {
    var oldHeader = document.querySelector("body > header.header");
    var oldFooter = document.querySelector("body > footer");

    if (oldHeader) {
      var header = document.createElement("header");
      header.className = "masthead";
      header.innerHTML =
        '<div class="brand-line">' +
          '<span class="brand-mark" aria-hidden="true"><span></span></span>' +
          '<a class="brand" href="' + homeUrl + '">JUSTSNWAT</a>' +
        '</div>' +
        '<div class="sub-brand">بنك أسئلة السنوات السابقة — كل مادة وأسئلتها بمكان واحد.</div>';
      oldHeader.replaceWith(header);
    }

    if (oldFooter) {
      var footer = document.createElement("footer");
      footer.innerHTML = "<p>Designed By Abdallah Al-serhan</p>";
      oldFooter.replaceWith(footer);
    }

    document.querySelectorAll('.bottom-nav-bar > a.btn-bottom-action:not(.btn-drive-action)').forEach(function (link) {
      link.remove();
    });

    var navBar = document.querySelector(".nav-bar");
    if (navBar) {
      function updateFloatingNav() {
        navBar.classList.toggle("is-floating", window.scrollY > 80);
      }
      window.addEventListener("scroll", updateFloatingNav, { passive: true });
      updateFloatingNav();
    }
  }

  var pageTransition = setupPageTransition();
  useSharedShell();

  startSiteEngines();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startSiteEngines);
  }
  window.addEventListener("load", startSiteEngines);

  document.addEventListener("click", function (event) {
    var link = event.target.closest("a");
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    var target = new URL(link.href, window.location.href);
    if (target.origin !== window.location.origin || target.pathname.indexOf("/index.html") === -1 || target.hash.indexOf("#/s/") !== 0) return;

    event.preventDefault();
    document.body.classList.add("page-leave");
    pageTransition.classList.remove("is-ready");
    pageTransition.classList.add("is-leaving");
    setTimeout(function () {
      window.location.href = link.href;
    }, 400);
  });
})();