(function () {
  "use strict";

  var homeUrl = "../index.html";

  function reportMarkup() {
    return '<button class="btn-bug-float" id="openReportBtn" aria-label="الإبلاغ عن خطأ أو مشكلة">' +
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>' +
      '<span>إبلاغ عن خطأ</span></button>' +
      '<div class="report-modal-overlay" id="reportOverlay" role="dialog" aria-modal="true" aria-hidden="true">' +
        '<div class="report-modal"><div class="report-modal-header"><h3>إبلاغ عن خطأ أو ملاحظة</h3><button class="btn-close-modal" id="closeReportBtn" aria-label="إغلاق">✕</button></div>' +
        '<form class="report-form" name="bug-report" id="bugReportForm" method="POST" data-netlify="true" enctype="multipart/form-data">' +
          '<input type="hidden" name="form-name" value="bug-report"><input type="hidden" name="current-page" id="reportCurrentPage">' +
          '<div class="form-group"><label for="issue-type">نوع المشكلة</label><select id="issue-type" name="issue_type" required><option value="سؤال أو إجابة خاطئة">خطأ في سؤال أو إجابة</option><option value="رابط لا يعمل أو ملف تالف">رابط لا يعمل / ملف تالف</option><option value="خلل في التصميم أو الموقع">مشكلة في عرض الصفحة أو الموقع</option><option value="اقتراح أو أخرى">اقتراح / أخرى</option></select></div>' +
          '<div class="form-group"><label for="issue-desc">وصف المشكلة</label><textarea id="issue-desc" name="description" placeholder="حدد السؤال أو المشكلة التي واجهتك بالتفصيل..." required></textarea></div>' +
          '<div class="form-group"><label for="user-contact">وسيلة تواصل (اختياري)</label><input type="text" id="user-contact" name="contact" placeholder="إيميلك أو حسابك للمتابعة معك إن لزم"></div>' +
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
    var status = document.getElementById("reportStatus");
    var submit = document.getElementById("submitReportBtn");
    var pageInput = document.getElementById("reportCurrentPage");

    function closeModal() {
      overlay.classList.remove("active");
      overlay.setAttribute("aria-hidden", "true");
    }

    openBtn.addEventListener("click", function () {
      overlay.classList.add("active");
      overlay.setAttribute("aria-hidden", "false");
      pageInput.value = document.title + " | " + window.location.href;
      status.className = "report-status";
      status.textContent = "";
    });
    closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", function (event) { if (event.target === overlay) closeModal(); });
    document.addEventListener("keydown", function (event) { if (event.key === "Escape") closeModal(); });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      submit.disabled = true;
      submit.textContent = "جارِ الإرسال...";
      fetch("/", { method: "POST", body: new FormData(form) })
        .then(function (response) {
          if (!response.ok) throw new Error("Form submission failed");
          status.className = "report-status success";
          status.textContent = "تم إرسال البلاغ بنجاح، شكراً لمساعدتك!";
          form.reset();
          setTimeout(function () { closeModal(); submit.disabled = false; submit.textContent = "إرسال البلاغ"; }, 2000);
        })
        .catch(function () {
          status.className = "report-status error";
          status.textContent = "حدث خطأ أثناء الإرسال، تأكد من اتصالك بالإنترنت.";
          submit.disabled = false;
          submit.textContent = "إرسال البلاغ";
        });
    });
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

  useSharedShell();
  setupReportWidget();

  document.addEventListener("click", function (event) {
    var link = event.target.closest('a[href*="../index.html#/s/"]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    document.body.classList.add("page-leave");
    setTimeout(function () {
      window.location.href = link.href;
    }, 200);
  });
})();
