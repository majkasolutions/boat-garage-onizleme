/* Boat Garage / Boat Clean: film koreografisi (GSAP + ScrollTrigger). Hareket azaltma tercihinde her şey düz akar. */
(function () {
  var azalt = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav = document.querySelector('nav');

  // Önce / sonra sürgüsü (her koşulda çalışır)
  document.querySelectorAll('.karsi').forEach(function (k) {
    var r = k.querySelector('input[type=range]');
    if (!r) return;
    var yaz = function () { k.style.setProperty('--x', r.value + '%'); };
    r.addEventListener('input', function () { k.dataset.elle = '1'; yaz(); });
    yaz();
  });

  if (!window.gsap || !window.ScrollTrigger || azalt) {
    // hareketsiz: sahne fotoğrafı ve manifesto düz
    document.querySelectorAll('.man .w').forEach(function (w) { w.classList.add('on'); });
    if (nav) nav.classList.add('dolu');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  var E = 'expo.out';

  // Üst çubuk: 80px sonra dolu, aşağı kaydırınca gizli, yukarı kaydırınca geri
  if (nav) {
    ScrollTrigger.create({
      start: 80, end: 'max',
      onUpdate: function (st) { nav.classList.toggle('gizli', st.direction === 1 && st.scroll() > 200); },
      onToggle: function (st) { nav.classList.toggle('dolu', st.isActive); }
    });
  }

  // Açılış sahnesi: yavaş yakınlaşma, kelime kelime başlık, blok
  var sahne = document.querySelector('.sahne');
  if (sahne) {
    var foto = sahne.querySelector('.foto');
    var kelimeler = sahne.querySelectorAll('.kelime i');
    var tl = gsap.timeline({ defaults: { ease: E } });
    tl.fromTo(foto, { scale: 1.14 }, { scale: 1.04, duration: 2.6, ease: 'power2.out' }, 0)
      .from(sahne.querySelector('.rozet'), { y: 16, opacity: 0, duration: .9 }, .2)
      .from(kelimeler, { yPercent: 110, duration: 1.1, stagger: .07 }, .35)
      .from(sahne.querySelector('p'), { y: 16, opacity: 0, duration: .9 }, .9)
      .from(sahne.querySelector('.acts'), { y: 16, opacity: 0, duration: .9 }, 1.05);
    if (sahne.classList.contains('yikanir')) {
      gsap.set(sahne, { '--w': '100%', '--hz': 1 });
      tl.to(sahne, { '--w': '0%', duration: 2.4, ease: 'power2.inOut' }, .5).to(sahne, { '--hz': 0, duration: .4 }, 2.8);
    }
    // kaydırınca sahne hafif geride kalır
    gsap.to(sahne.querySelector('.blok'), { yPercent: 30, opacity: 0, ease: 'none', scrollTrigger: { trigger: sahne, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to(foto, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: sahne, start: 'top top', end: 'bottom top', scrub: true } });
  }

  // Manifesto: kelimeler kaydırdıkça canlanır
  document.querySelectorAll('.man p').forEach(function (p) {
    var ws = p.querySelectorAll('.w');
    gsap.to(ws, { className: '+=on', stagger: .08, ease: 'none', scrollTrigger: { trigger: p, start: 'top 75%', end: 'bottom 45%', scrub: .4 } });
  });

  // Perde yığını: her perde sabitlenir, sonraki gelirken küçülüp kararır
  document.querySelectorAll('.perdeler, .paketler-yigin').forEach(function (wrap) {
    var kartlar = gsap.utils.toArray(wrap.children);
    kartlar.forEach(function (k, i) {
      if (i === kartlar.length - 1) return;
      gsap.to(k, {
        scale: .9, '--dim': .65, ease: 'none',
        scrollTrigger: { trigger: kartlar[i + 1], start: 'top bottom', end: 'top top', scrub: true }
      });
    });
    // perde içi başlık girişi ve sıra göstergesi
    kartlar.forEach(function (k, i) {
      var y = k.querySelector('.y, .t');
      if (y) gsap.from(y.children, { y: 40, opacity: 0, duration: .9, ease: E, stagger: .08, scrollTrigger: { trigger: k, start: 'top 60%', once: true } });
      var sira = k.querySelectorAll('.sira b');
      sira.forEach(function (b, j) { b.classList.toggle('on', j <= i); });
    });
  });

  // Yıkama: sabitlenir, kaydırdıkça kir gider
  document.querySelectorAll('.yikama').forEach(function (s) {
    var olcu = s.querySelector('.olcu span');
    gsap.fromTo(s, { '--w': '100%' }, {
      '--w': '0%', ease: 'none',
      scrollTrigger: {
        trigger: s, start: 'top top', end: '+=1600', pin: true, scrub: .5,
        onUpdate: function (st) { if (olcu) olcu.textContent = st.progress < .05 ? 'Kışlama sonu' : st.progress > .95 ? 'Teslime hazır' : 'Yıkanıyor'; }
      }
    });
    gsap.from(s.querySelectorAll('.ui > div > *'), { y: 30, opacity: 0, duration: .9, ease: E, stagger: .1, scrollTrigger: { trigger: s, start: 'top 60%', once: true } });
  });

  // Hizmetler: yatay akış (dar ekranda dikey)
  var hiz = document.querySelector('.hizmetler');
  if (hiz && window.innerWidth > 900) {
    var ray = hiz.querySelector('.ray');
    var mesafe = function () { return ray.scrollWidth - window.innerWidth; };
    gsap.to(ray, {
      x: function () { return -mesafe(); }, ease: 'none',
      scrollTrigger: { trigger: hiz, start: 'top top', end: function () { return '+=' + mesafe(); }, pin: true, scrub: .6, invalidateOnRefresh: true }
    });
  }

  // Tesis ve kapanış fotoğrafları: paralaks
  document.querySelectorAll('.tesis .buyuk img, .kapanis figure img').forEach(function (img) {
    gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // Önce / sonra: görünür olunca bir kez süpürür (elle dokunulmadıysa)
  document.querySelectorAll('.karsi').forEach(function (k) {
    var r = k.querySelector('input[type=range]');
    ScrollTrigger.create({
      trigger: k, start: 'top 70%', once: true,
      onEnter: function () {
        if (k.dataset.elle) return;
        var o = { v: 50 };
        gsap.timeline().to(o, { v: 8, duration: .8, ease: 'power2.inOut', onUpdate: function () { if (!k.dataset.elle) { r.value = o.v; k.style.setProperty('--x', o.v + '%'); } } })
          .to(o, { v: 92, duration: 1.4, ease: 'power2.inOut', onUpdate: function () { if (!k.dataset.elle) { r.value = o.v; k.style.setProperty('--x', o.v + '%'); } } })
          .to(o, { v: 50, duration: .9, ease: 'power2.inOut', onUpdate: function () { if (!k.dataset.elle) { r.value = o.v; k.style.setProperty('--x', o.v + '%'); } } });
      }
    });
  });

  // Görseller yüklenince ölçüleri tazele
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
