/* Boat Garage / Boat Clean — ortak betik: menü, görünürlük animasyonu, form gönderimi, analitik olayları */
(function () {
  var LEAD_URL = 'https://nbzcqrgmbakgzlkpbilc.supabase.co/functions/v1/bg-lead';

  // mobil menü
  var burger = document.querySelector('nav .burger'), menu = document.querySelector('nav ul');
  if (burger && menu) burger.addEventListener('click', function () { menu.classList.toggle('open'); });

  // görünürlük animasyonu
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12 });
    document.querySelectorAll('.up').forEach(function (el) { io.observe(el); });
  } else document.querySelectorAll('.up').forEach(function (el) { el.classList.add('in'); });

  // analitik olayı (gtag varsa)
  window.bgEvent = function (name, params) { try { if (window.gtag) gtag('event', name, params || {}); } catch (e) {} };
  document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) { a.addEventListener('click', function () { bgEvent('whatsapp_click', { page: location.pathname }); }); });
  document.querySelectorAll('a[href^="tel:"]').forEach(function (a) { a.addEventListener('click', function () { bgEvent('phone_click', { page: location.pathname }); }); });

  // form
  document.querySelectorAll('form[data-lead]').forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var btn = form.querySelector('button[type=submit]'), ok = form.querySelector('.ok'), err = form.querySelector('.err');
      var data = {}; new FormData(form).forEach(function (v, k) { data[k] = v; });
      data.brand = form.dataset.lead; data.page = location.pathname;
      btn.disabled = true; var eski = btn.textContent; btn.textContent = form.dataset.sending || 'Gönderiliyor…';
      ok.style.display = err.style.display = 'none';
      // ÖNIZLEME (github.io): gerçek talep oluşturulmaz, panele/Telegram'a düşmez
      if (location.hostname.indexOf('github.io') > -1) {
        setTimeout(function () {
          ok.style.display = 'block';
          if (!ok.dataset.onizleme) { ok.dataset.onizleme = '1'; var n = document.createElement('div'); n.style.cssText = 'margin-top:6px;font-size:12px;opacity:.65'; n.textContent = 'Önizleme sayfası — bu form yayına alındığında çalışacak.'; ok.appendChild(n); }
          form.reset(); btn.disabled = false; btn.textContent = eski;
        }, 600);
        return;
      }
      fetch(LEAD_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().then(function (j) { return { s: r.status, j: j }; }); })
        .then(function (x) {
          if (x.j && x.j.ok) { ok.style.display = 'block'; form.reset(); bgEvent('lead_submit', { brand: data.brand }); }
          else { err.style.display = 'block'; }
        })
        .catch(function () { err.style.display = 'block'; })
        .finally(function () { btn.disabled = false; btn.textContent = eski; });
    });
  });
})();
