(function () {
  "use strict";

  var homeUrl = "../index.html";

  /* ==========================================================================
     1. محرك عزل وتصحيح النصوص المختلطة الأسطوري (BiDi Isolation Engine)
     ========================================================================== */

  // 1. حقن قواعد التنسيق الصارمة لمنع المتصفح من قلب المعادلات والمصطلحات
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

  // 2. نمط المطابقة الشامل (معادلات رياضية، عناوين IP، مصطلحات إنجليزية، أقواس مدمجة، وحدات)
  var LTR_REGEX = new RegExp(
    "(" +
      // مجموعات معقوفة مثل {A, B, C}
      "\\{[a-zA-Z0-9_,\\s-]+\\}" +
      // نصوص بين أقواس تحتوي إنجليزي أو حسابات مثل (One-to-One) أو (d_prop)
      "|\\([a-zA-Z0-9_+\\-*\\/=<>.,\\s%≈~]+\\)" +
      // عناوين IP مع الـ CIDR مثل 144.76.56.7/23 أو 10.0.0.1
      "|\\b\\d{1,3}(?:\\.\\d{1,3}){3}(?:\\/\\d{1,2})?\\b" +
      // أقنعة CIDR منفردة مثل /25 أو /8
      "|\\/\\d{1,2}\\b" +
      // عناوين MAC مثل 01:00:5E
      "|\\b[0-9a-fA-F]{2}(?::[0-9a-fA-F]{2})+\\b" +
      // أرقام متبوعة بوحدات إنجليزية مثل 20 bytes أو 10 ms أو 1 Mbps أو 200 packets/s
      "|\\b\\d+(?:\\.\\d+)?\\s*(?:bits?|bytes?|kbps|Mbps|Gbps|ms|sec|s|packets?(?:\\/s)?|users?|RTT|km|m\\/s|%)\\b" +
      // معادلات وحسابات رياضية مثل 64 - 5 = 59 أو 212 = 11010100 أو 4 / 21 ≈ 0.19
      "|[a-zA-Z0-9_.%]+(?:\\s*[-+*\\/=<>≈×÷]\\s*[a-zA-Z0-9_.%]+)+" +
      // متغيرات وقيم مثل X = Pkt1 أو Y = Pkt0
      "|[a-zA-Z0-9_]+(?:\\s*=\\s*[a-zA-Z0-9_]+)+" +
      // مصطلحات وكلمات إنجليزية مدمجة مع أرقام أو رموز مثل TCP, IPv6, TTL, ACK84, Send_Base
      "|[a-zA-Z][a-zA-Z0-9_.*#\\-\\/]*" +
    ")",
    "g"
  );

  // دالة فحص العقد النصية ومعالجتها دون المساس بباقي الـ HTML
  function isolateTextNode(textNode) {
    var val = textNode.nodeValue;
    if (!val || !val.trim()) return;

    // الشرط الذهبي: لا تتدخل إلا إذا كان النص يحتوي على أحرف عربية (تداخل لغوي)
    if (!/[\u0600-\u06FF]/.test(val)) return;

    // استبعاد العقد المعالجة مسبقاً
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

  // فحص شجرة العناصر واستبعاد حقول الإدخال والوسوم البرمجية
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

  // تشغيل المحرك مع مراقب التغييرات لضمان العمل مع الأسئلة المولدة ديناميكياً
  var bidiObserver = null;
  function startBiDiEngine() {
    injectBiDiStyles();
    scanAndFixBiDi(document.body);

    if (!bidiObserver && window.MutationObserver) {
      bidiObserver = new MutationObserver(function (mutations) {
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
          bidiObserver.disconnect();
          scanAndFixBiDi(document.body);
          bidiObserver.observe(document.body, { childList: true, subtree: true });
        }
      });

      bidiObserver.observe(document.body, { childList: true, subtree: true });
    }
  }


  /* ==========================================================================
     2. تأثيرات التنقل الموحدة (Page Transitions)
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
     3. نافذة التبليغ المنبثقة (Bug Report Modal)
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
     4. القالب الموحد والتنقل العائم (Shell & Floating Nav)
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

  // تشغيل المحرك فوراً وعلى دفعات لضمان معالجة أي محتوى تم إنشاؤه عبر initQuiz
  startBiDiEngine();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startBiDiEngine);
  }
  window.addEventListener("load", startBiDiEngine);

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