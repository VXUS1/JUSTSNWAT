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

    // فحص حجم الصورة (حد أقصى 8 ميجابايت)
    if (file && file.size > 8 * 1024 * 1024) {
      statusDiv.className = "report-status error";
      statusDiv.style.display = "block";
      statusDiv.textContent = "حجم الصورة كبير جداً، الحد الأقصى هو 8 ميجابايت.";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "جارِ الإرسال...";
    statusDiv.style.display = "none";

    // استخدام FormData لإرسال النصوص والملف معاً
    var formData = new FormData();
    formData.append("issueType", document.getElementById("issue-type").value);
    formData.append("issueDesc", document.getElementById("issue-desc").value);
    formData.append("userContact", document.getElementById("user-contact").value.trim() || "غير محدد");
    formData.append("currentUrl", window.location.href);

    if (file) {
      formData.append("imageFile", file);
    }

    // تنبيه: لا نضع 'Content-Type' في الـ headers لكي يضبط المتصفح حدود الملف (boundary) تلقائياً
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