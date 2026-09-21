(function () {
  "use strict";

  var homeUrl = "../index.html";

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

  function reportMarkup() {
    return '<button class="btn-bug-float" id="openReportBtn" aria-label="الإبلاغ عن خطأ أو مشكلة">' +
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="14" x="8" y="6" rx="4"></rect><path d="m19 7-3 2"></path><path d="m5 7 3 2"></path><path d="m19 19-3-2"></path><path d="m5 19 3-2"></path><path d="M20 13h-4"></path><path d="M4 13h4"></path><path d="m10 4 1 2"></path><path d="m14 4-1 2"></path></svg>' +
      '<span>إبلاغ عن خطأ</span></button>' +
      '<div class="report-modal-overlay" id="reportOverlay" role="dialog" aria-modal="true" aria-hidden="true">' +
        '<div class="report-modal"><div class="report-modal-header"><h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>إبلاغ عن خطأ أو ملاحظة</h3><button class="btn-close-modal" id="closeReportBtn" aria-label="إغلاق">✕</button></div>' +
        '<form class="report-form" id="bugReportForm">' +
          '<div class="form-group"><label for="issue-type">نوع المشكلة</label><select id="issue-type" name="issue_type" required><option value="سؤال أو إجابة خاطئة">خطأ في سؤال أو إجابة</option><option value="رابط لا يعمل أو ملف تالف">رابط لا يعمل / ملف تالف</option><option value="خلل في التصميم أو الموقع">مشكلة في عرض الصفحة أو الموقع</option><option value="اقتراح أو أخرى">اقتراح / أخرى</option></select></div>' +
          '<div class="form-group"><label for="issue-desc">وصف المشكلة <span style="color:var(--apple-red)">*</span></label><textarea id="issue-desc" placeholder="حدد السؤال أو المشكلة التي واجهتك بالتفصيل..." required></textarea></div>' +
          '<div class="form-group"><label for="user-contact">وسيلة تواصل (اختياري)</label><input type="text" id="user-contact" placeholder="إيميلك أو حسابك للمتابعة معك إن لزم"></div>' +
          '<button type="submit" class="btn-submit-report" id="submitReportBtn">إرسال البلاغ</button><div class="report-status" id="reportStatus"></div>' +
        '</form></div></div>';
  }

  function setupReportWidget() {
    if (document.getElementById("openReportBtn")) return;
    document.body.insertAdjacentHTML("beforeend", reportMarkup());

    var openBtn = document.getElementById("openReportBtn");
    var closeBtn = document.getElementById("closeReportBtn");
    var overlay = document.getElementById("reportOverlay");
    var form = document.getElementById("bugReportForm");
    var statusDiv = document.getElementById("reportStatus");
    var submitBtn = document.getElementById("submitReportBtn");

    var WORKER_ENDPOINT = "https://justsnwat-reporter.abdalserhan20.workers.dev/";

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
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = "جارِ الإرسال...";
        statusDiv.style.display = "none";

        var payload = {
          issueType: document.getElementById("issue-type").value,
          issueDesc: document.getElementById("issue-desc").value,
          userContact: document.getElementById("user-contact").value.trim() || "غير محدد",
          currentUrl: window.location.href
        };

        fetch(WORKER_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        .then(function (res) {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(function () {
          statusDiv.className = "report-status success";
          statusDiv.style.display = "block";
          statusDiv.textContent = "تم إرسال البلاغ بنجاح لديسكورد، شكراً لك!";
          form.reset();
          setTimeout(function () {
            closeModal();
            submitBtn.disabled = false;
            submitBtn.textContent = "إرسال البلاغ";
          }, 2000);
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
  }

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
  setupReportWidget();

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