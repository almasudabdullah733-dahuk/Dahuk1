/* =========================================================
   DAHUK — main.js
   Handles: mobile nav, scroll reveal, FAQ accordion,
   contact + report forms (AJAX to PHP with offline fallback)
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Mobile nav toggle ---------- */
  var header   = document.querySelector('.site-header');
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks  = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      header.classList.toggle('menu-open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // close menu when a link is tapped (mobile)
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        header.classList.remove('menu-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- FAQ: category switching ---------- */
  var faqCatButtons = document.querySelectorAll('.faq-cat-btn');
  var faqPanels = document.querySelectorAll('.faq-panel');
  faqCatButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-cat');
      faqCatButtons.forEach(function (b) { b.classList.remove('active'); });
      faqPanels.forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var panel = document.querySelector('.faq-panel[data-cat="' + target + '"]');
      if (panel) panel.classList.add('active');
    });
  });

  /* ---------- FAQ: accordion open/close ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      // close siblings within the same panel for a clean accordion feel
      var panel = item.closest('.faq-panel');
      if (panel) {
        panel.querySelectorAll('.faq-item.open').forEach(function (openItem) {
          if (openItem !== item) {
            openItem.classList.remove('open');
            openItem.querySelector('.faq-a').style.maxHeight = null;
          }
        });
      }
      item.classList.toggle('open', !isOpen);
      a.style.maxHeight = !isOpen ? a.scrollHeight + 'px' : null;
    });
  });

  /* ---------- Toast helper ---------- */
  function showToast(message, type) {
    var toast = document.getElementById('dahuk-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'dahuk-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'toast show' + (type ? ' ' + type : '');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.remove('show');
    }, 4200);
  }
  window.dahukToast = showToast;

  /* ---------- Generic form validation + submit ---------- */
  function validateForm(form) {
    var valid = true;
    form.querySelectorAll('[required]').forEach(function (field) {
      var group = field.closest('.form-group');
      var value = field.value.trim();
      var fieldValid = value.length > 0;
      if (field.type === 'email' && value) {
        fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }
      if (group) group.classList.toggle('has-error', !fieldValid);
      if (!fieldValid) valid = false;
    });
    return valid;
  }

  function handleFormSubmit(formId, endpoint, successMessage) {
    var form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var statusBox = form.querySelector('.form-status');

      if (!validateForm(form)) {
        if (statusBox) {
          statusBox.textContent = 'Please fill in the required fields highlighted below.';
          statusBox.className = 'form-status error show';
        }
        var firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
        if (firstError) firstError.focus();
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalLabel = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending…';
      }

      var formData = new FormData(form);

      fetch(endpoint, { method: 'POST', body: formData })
        .then(function (res) {
          if (!res.ok) throw new Error('Server responded with an error.');
          return res.json().catch(function () { return { success: true }; });
        })
        .then(function (data) {
          onSuccess(data && data.message ? data.message : successMessage);
        })
        .catch(function () {
          // Offline / no PHP server available (e.g. opened as a local file).
          // Save locally so nothing the person wrote is lost, and confirm softly.
          try {
            var key = 'dahuk_' + formId + '_' + Date.now();
            var payload = {};
            formData.forEach(function (v, k) { payload[k] = v; });
            localStorage.setItem(key, JSON.stringify(payload));
          } catch (err) { /* ignore storage errors */ }
          onSuccess(successMessage + ' (Saved locally — connect a PHP server to deliver this automatically.)');
        });

      function onSuccess(message) {
        if (statusBox) {
          statusBox.textContent = message;
          statusBox.className = 'form-status success show';
          statusBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        showToast(message.split('(')[0].trim(), 'success');
        form.reset();
        form.querySelectorAll('.has-error').forEach(function (g) { g.classList.remove('has-error'); });
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalLabel;
        }
      }
    });
  }

  handleFormSubmit('contact-form', 'php/submit_contact.php', "Thank you — your message has been sent. Our team will respond within 24-48 hours.");
  handleFormSubmit('report-form', 'php/submit_report.php', "Your report has been received. If you shared an email, we'll follow up within 48 hours.");

  /* ---------- Live-clear error state while typing ---------- */
  document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(function (field) {
    field.addEventListener('input', function () {
      var group = field.closest('.form-group');
      if (group) group.classList.remove('has-error');
    });
  });

});
