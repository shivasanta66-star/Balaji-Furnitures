/* Balaji Furnitures — the DCLogic state machine rebuilt as vanilla JS.
   Every {{ }} binding from the original bundle has an equivalent here. */
(function () {
  'use strict';

  var BF = window.BF;
  var MOBILE_QUERY = '(max-width: 768px)';

  /* ---- helpers --------------------------------------------------------- */

  var SLOT_DIMS = {
    'hero-photo': [1600, 900],
    'owner-photo': [600, 600],
    'custom-orders': [800, 600]
  };
  BF.categories.forEach(function (c) { SLOT_DIMS[c.slotId] = [600, 600]; });
  BF.featured.forEach(function (p) { SLOT_DIMS[p.slotId] = [800, 600]; });
  BF.galleryItems.forEach(function (g) { SLOT_DIMS[g.slotId] = [800, 800]; });

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* Remote placeholder, sized per slot and tinted to the brand palette.
     Swap these for real photos with scripts/install-photos.mjs. */
  var PLACEHOLDER_HOST = 'https://placehold.co/';

  function placeholderUrl(slotId, label) {
    var d = SLOT_DIMS[slotId] || [800, 600];
    return PLACEHOLDER_HOST + d[0] + 'x' + d[1] + '/3E2A1E/C89B3C?text=' +
      encodeURIComponent(label || slotId);
  }

  /* A real photo once one is installed, the placeholder until then. */
  function imgSrc(slotId, label) {
    var photos = window.BF_PHOTOS || {};
    return photos[slotId] ? 'images/' + photos[slotId] : placeholderUrl(slotId, label);
  }

  /* Replaces the bundle's <image-slot id="..."> with a real <img>. */
  function img(slotId, alt, cls, label) {
    var d = SLOT_DIMS[slotId] || [800, 600];
    return '<img src="' + esc(imgSrc(slotId, label)) + '" alt="' + esc(alt) + '"' +
      (cls ? ' class="' + cls + '"' : '') +
      ' width="' + d[0] + '" height="' + d[1] + '" loading="lazy">';
  }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---- 2. Open / Closed badge (Mon-Sat 9:00-21:00, Sunday closed) ------- */

  function isOpenNow(now) {
    now = now || new Date();
    var day = now.getDay();
    var hour = now.getHours() + now.getMinutes() / 60;
    return day !== 0 && hour >= 9 && hour < 21;
  }

  function initStatusBadge() {
    var badges = $$('[data-status-badge]');
    if (!badges.length) return;
    function paint() {
      var open = isOpenNow();
      badges.forEach(function (b) {
        b.classList.toggle('is-closed', !open);
        var label = $('[data-status-label]', b);
        if (label) label.textContent = open ? 'Open now' : 'Closed now';
      });
    }
    paint();
    setInterval(paint, 60000);
  }

  /* ---- 1. Mobile menu -------------------------------------------------- */

  function initMobileMenu() {
    var btn = $('[data-hamburger]');
    var menu = $('[data-mobile-menu]');
    if (!btn || !menu) return;

    var mq = window.matchMedia(MOBILE_QUERY);
    var open = false;

    function render() {
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    btn.addEventListener('click', function () { open = !open; render(); });
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () { open = false; render(); });
    });

    function onChange() { if (!mq.matches) { open = false; render(); } }
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    onChange();
    render();
  }

  /* ---- 3. Category grid ------------------------------------------------ */

  function initCategories() {
    var host = $('[data-categories]');
    if (!host) return;
    host.innerHTML = BF.categories.map(function (cat) {
      return '<a href="products.html?category=' + encodeURIComponent(cat.slug) + '" class="cat-card fr">' +
        img(cat.slotId, cat.name, null, cat.name) +
        '<div class="cat-scrim"></div>' +
        '<div class="cat-name">' + esc(cat.name) + '</div>' +
        '</a>';
    }).join('');
  }

  /* ---- 4. Featured products ------------------------------------------- */

  function featuredCard(p) {
    var wa = BF.waLink('Hi, I would like to enquire about the ' + p.name + '.');
    return '<div class="feat-card fr">' +
      img(p.slotId, p.name + ' — ' + p.material, null, p.name) +
      '<div class="feat-body">' +
      '<div class="chip-material">' + esc(p.material) + '</div>' +
      '<div class="feat-name">' + esc(p.name) + '</div>' +
      '<div class="feat-desc">' + esc(p.desc) + '</div>' +
      '<a href="' + esc(wa) + '" target="_blank" rel="noopener" class="btn-wa-xs">Enquire on WhatsApp</a>' +
      '</div></div>';
  }

  function initFeatured() {
    var host = $('[data-featured]');
    if (!host) return;
    host.innerHTML = BF.featured.map(featuredCard).join('');
  }

  /* ---- generic list sections ------------------------------------------ */

  function initTrust() {
    var host = $('[data-trust]');
    if (!host) return;
    host.innerHTML = BF.trustItems.map(function (item) {
      return '<div class="trust-item fr">' +
        '<div class="trust-icon">' + esc(item.icon) + '</div>' +
        '<div class="trust-label">' + esc(item.label) + '</div>' +
        '</div>';
    }).join('');
  }

  function initWood() {
    var host = $('[data-wood]');
    if (!host) return;
    host.innerHTML = BF.woodTypes.map(function (w) {
      return '<div class="fr">' +
        '<div class="wood-title">' + esc(w.title) + '</div>' +
        '<div class="wood-body">' + esc(w.body) + '</div>' +
        '</div>';
    }).join('');
  }

  function initBrands() {
    var host = $('[data-brands]');
    if (!host) return;
    host.innerHTML = BF.brands.map(function (b) {
      return '<div class="brand-chip fr">' + esc(b) + '</div>';
    }).join('');
  }

  function initServices() {
    var host = $('[data-services]');
    if (!host) return;
    host.innerHTML = BF.serviceCards.map(function (s) {
      return '<div class="service-card fr">' +
        '<div class="service-icon">' + esc(s.icon) + '</div>' +
        '<div class="service-title">' + esc(s.title) + '</div>' +
        '<div class="service-body">' + esc(s.body) + '</div>' +
        '</div>';
    }).join('');
  }

  function initAreas() {
    var host = $('[data-areas]');
    if (!host) return;
    host.innerHTML = BF.deliveryAreas.map(function (a) {
      return '<span class="area-chip fr">' + esc(a) + '</span>';
    }).join('');
  }

  /* ---- 5. Gallery + lightbox ------------------------------------------ */

  function initGallery() {
    var host = $('[data-gallery]');
    var box = $('[data-lightbox]');
    if (!host) return;

    host.innerHTML = BF.galleryItems.map(function (g, i) {
      return '<button type="button" class="gallery-thumb fr" data-index="' + i +
        '" aria-label="Open showroom photo ' + g.n + '">' +
        img(g.slotId, 'Balaji Furnitures showroom photo ' + g.n, null, 'Showroom ' + g.n) +
        '</button>';
    }).join('');

    if (!box) return;
    var frame = $('[data-lb-frame]', box);
    var total = BF.galleryItems.length;
    var index = null;
    var lastFocus = null;

    function render() {
      var isOpen = index !== null;
      box.hidden = !isOpen;
      if (isOpen) {
        var g = BF.galleryItems[index];
        frame.innerHTML = img(g.slotId, 'Balaji Furnitures showroom photo ' + g.n, null, 'Showroom ' + g.n);
        $('[data-lb-close]', box).focus();
      }
    }
    function open(i) { lastFocus = document.activeElement; index = i; render(); }
    function close() {
      index = null; render();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    /* wrap around 0 <-> 9, exactly as prevImage/nextImage did */
    function prev() { index = (index + total - 1) % total; render(); }
    function next() { index = (index + 1) % total; render(); }

    $$('[data-index]', host).forEach(function (btn) {
      btn.addEventListener('click', function () { open(Number(btn.getAttribute('data-index'))); });
    });
    $('[data-lb-close]', box).addEventListener('click', close);
    $('[data-lb-prev]', box).addEventListener('click', prev);
    $('[data-lb-next]', box).addEventListener('click', next);
    box.addEventListener('click', function (e) { if (e.target === box) close(); });

    document.addEventListener('keydown', function (e) {
      if (index === null) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    });
  }

  /* ---- 6. FAQ accordion (first one open by default) -------------------- */

  function initFaq() {
    var host = $('[data-faq]');
    if (!host) return;
    var openIndex = 0;

    host.innerHTML = BF.faqs.map(function (f, i) {
      return '<div class="faq-item fr">' +
        '<button type="button" class="faq-q" data-faq-toggle="' + i + '" aria-expanded="false" aria-controls="faq-a-' + i + '">' +
        '<span>' + esc(f.q) + '</span><span class="faq-sign">+</span></button>' +
        '<div class="faq-a" id="faq-a-' + i + '" hidden>' + esc(f.a) + '</div>' +
        '</div>';
    }).join('');

    var buttons = $$('[data-faq-toggle]', host);
    var panels = $$('.faq-a', host);

    function render() {
      buttons.forEach(function (b, i) {
        var on = openIndex === i;
        b.setAttribute('aria-expanded', on ? 'true' : 'false');
        $('.faq-sign', b).textContent = on ? '-' : '+';
        panels[i].hidden = !on;
      });
    }
    buttons.forEach(function (b, i) {
      b.addEventListener('click', function () {
        openIndex = openIndex === i ? -1 : i;
        render();
      });
    });
    render();
  }

  /* ---- 7. Reviews carousel -------------------------------------------- */

  function initReviews() {
    var viewport = $('[data-reviews-viewport]');
    if (!viewport) return;
    var track = $('[data-reviews-track]', viewport);
    var prevBtn = $('[data-rev-prev]');
    var nextBtn = $('[data-rev-next]');
    var dotsHost = $('[data-rev-dots]');
    var GAP = 20;
    var MIN = 240; /* same minmax(240px,1fr) math the original grid used */
    var total = BF.reviews.length;
    var page = 0;
    var timer = null;

    track.innerHTML = BF.reviews.map(function (r) {
      return '<div class="review-card fr">' +
        '<div class="review-stars">★★★★★</div>' +
        '<div class="review-quote">"' + esc(r.quote) + '"</div>' +
        '<div class="review-name">' + esc(r.name) + '</div>' +
        '</div>';
    }).join('');
    var cards = $$('.review-card', track);

    function perView() {
      var w = viewport.clientWidth;
      return Math.max(1, Math.min(total, Math.floor((w + GAP) / (MIN + GAP))));
    }
    function pageCount() { return Math.max(1, Math.ceil(total / perView())); }

    function layout() {
      var n = perView();
      var cardW = (viewport.clientWidth - GAP * (n - 1)) / n;
      cards.forEach(function (c) { c.style.width = cardW + 'px'; });
      if (page > pageCount() - 1) page = pageCount() - 1;
      renderDots();
      move();
    }
    function move() {
      var n = perView();
      var cardW = (viewport.clientWidth - GAP * (n - 1)) / n;
      var offset = page * n * (cardW + GAP);
      var max = Math.max(0, total * (cardW + GAP) - GAP - viewport.clientWidth);
      track.style.transform = 'translateX(-' + Math.min(offset, max) + 'px)';
      if (dotsHost) {
        $$('.rev-dot', dotsHost).forEach(function (d, i) {
          d.classList.toggle('is-active', i === page);
          d.setAttribute('aria-current', i === page ? 'true' : 'false');
        });
      }
    }
    function renderDots() {
      if (!dotsHost) return;
      var count = pageCount();
      if ($$('.rev-dot', dotsHost).length !== count) {
        var html = '';
        for (var i = 0; i < count; i++) {
          html += '<button type="button" class="rev-dot" data-rev-go="' + i + '" aria-label="Go to review page ' + (i + 1) + '"></button>';
        }
        dotsHost.innerHTML = html;
        $$('.rev-dot', dotsHost).forEach(function (d) {
          d.addEventListener('click', function () {
            page = Number(d.getAttribute('data-rev-go'));
            move(); restart();
          });
        });
      }
    }
    function go(delta) {
      var count = pageCount();
      page = (page + delta + count) % count;
      move();
    }
    function start() {
      stop();
      timer = setInterval(function () { go(1); }, 5000);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { start(); }

    if (prevBtn) prevBtn.addEventListener('click', function () { go(-1); restart(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { go(1); restart(); });

    /* pause on hover, and on keyboard focus inside the carousel */
    viewport.addEventListener('mouseenter', stop);
    viewport.addEventListener('mouseleave', start);
    viewport.addEventListener('focusin', stop);
    viewport.addEventListener('focusout', start);

    window.addEventListener('resize', layout);
    layout();
    start();
  }

  /* ---- 8. Hours table, today highlighted ------------------------------ */

  function initHours() {
    var host = $('[data-hours]');
    if (!host) return;
    var today = new Date().getDay();
    host.innerHTML = BF.dayNames.map(function (d, i) {
      return '<tr class="' + (i === today ? 'is-today' : '') + '">' +
        '<td class="day">' + esc(d) + '</td>' +
        '<td class="hrs">' + (i === 0 ? 'Closed' : '9:00 AM - 9:00 PM') + '</td>' +
        '</tr>';
    }).join('');
  }

  /* ---- 11. Scroll-to-top ---------------------------------------------- */

  function initToTop() {
    var btn = $('[data-to-top]');
    if (!btn) return;
    function onScroll() { btn.hidden = window.scrollY <= 400; }
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    onScroll();
  }

  /* ---- 12. Active nav highlighting ------------------------------------ */

  function initActiveNav() {
    var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    $$('[data-nav] a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').toLowerCase();
      if (href && href.indexOf('#') !== 0 && href === page) a.classList.add('is-active');
    });

    var sections = $$('section[id], header[id]');
    if (!sections.length || !('IntersectionObserver' in window)) return;
    var anchors = $$('[data-nav] a[href^="#"], .footer-links a[href^="#"]');
    if (!anchors.length) return;

    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
      var best = null, bestRatio = 0;
      Object.keys(visible).forEach(function (id) {
        if (visible[id] > bestRatio) { bestRatio = visible[id]; best = id; }
      });
      anchors.forEach(function (a) {
        a.classList.toggle('is-active', best !== null && a.getAttribute('href') === '#' + best);
      });
    }, { rootMargin: '-72px 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });

    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---- 7/STEP 7. Enquiry form -> POST /api/enquiry -------------------- */

  function initForm() {
    var form = $('[data-enquiry-form]');
    if (!form) return;
    var nameEl = $('[name="name"]', form);
    var phoneEl = $('[name="phone"]', form);
    var categoryEl = $('[name="category"]', form);
    var messageEl = $('[name="message"]', form);
    var errorEl = $('[data-phone-error]', form);
    var statusEl = $('[data-form-status]', form);
    var submitEl = $('[data-submit]', form);
    var validPhone = /^[6-9][0-9]{9}$/;

    if (categoryEl && !categoryEl.options.length) {
      categoryEl.innerHTML = BF.categories.map(function (c) {
        return '<option value="' + esc(c.name) + '">' + esc(c.name) + '</option>';
      }).join('');
      categoryEl.value = 'Beds';
    }

    phoneEl.addEventListener('input', function () {
      errorEl.hidden = true;
      errorEl.textContent = '';
    });

    function setStatus(msg, isError) {
      statusEl.textContent = msg;
      statusEl.classList.toggle('is-error', !!isError);
      statusEl.hidden = !msg;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var phone = phoneEl.value.trim();
      if (!validPhone.test(phone)) {
        errorEl.textContent = 'Enter a valid 10-digit Indian mobile number.';
        errorEl.hidden = false;
        phoneEl.focus();
        return;
      }
      errorEl.hidden = true;
      setStatus('', false);

      var payload = {
        name: nameEl.value.trim(),
        phone: phone,
        category: categoryEl.value,
        message: messageEl.value.trim()
      };

      /* The WhatsApp message the original submitForm() composed, unchanged. */
      var lines = [
        'Enquiry from website:',
        'Name: ' + payload.name,
        'Phone: ' + phone,
        'Category: ' + payload.category,
        'Message: ' + payload.message
      ];
      var fallbackWa = BF.waLink(lines.join('\n'));

      submitEl.disabled = true;
      fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        return res.json().then(function (body) { return { ok: res.ok, status: res.status, body: body }; });
      }).then(function (r) {
        if (!r.ok || !r.body.success) {
          var msg = (r.body && r.body.error) || 'Could not save your enquiry. Please try again.';
          setStatus(msg, true);
          return;
        }
        setStatus('Thanks — your enquiry has been sent. We will call you back on ' + phone + '. Opening WhatsApp now.', false);
        form.reset();
        if (categoryEl) categoryEl.value = 'Beds';
        window.open(r.body.waLink || fallbackWa, '_blank', 'noopener');
      }).catch(function () {
        setStatus('Network problem saving your enquiry — opening WhatsApp instead.', true);
        window.open(fallbackWa, '_blank', 'noopener');
      }).then(function () {
        submitEl.disabled = false;
      });
    });
  }

  /* ---- shared chrome bindings ----------------------------------------- */

  function initLinks() {
    var generic = BF.waLink('Hi Balaji Furnitures, I would like to know more about your furniture.');
    var map = {
      'wa-generic': generic,
      'wa-offer': BF.waLink("Hi, I'd like details on this month's offer."),
      'wa-custom': BF.waLink("Hi, I'd like to ask about a custom furniture piece."),
      'directions': BF.directionsLink,
      'reviews': BF.reviewsLink
    };
    $$('[data-link]').forEach(function (a) {
      var key = a.getAttribute('data-link');
      if (map[key]) a.href = map[key];
    });
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---- boot ------------------------------------------------------------ */

  function boot() {
    initLinks();
    initMobileMenu();
    initStatusBadge();
    initTrust();
    initCategories();
    initFeatured();
    initWood();
    initBrands();
    initServices();
    initGallery();
    initAreas();
    initFaq();
    initReviews();
    initHours();
    initToTop();
    initActiveNav();
    initForm();
    if (window.BFPage && typeof window.BFPage.init === 'function') window.BFPage.init({ img: img, esc: esc, featuredCard: featuredCard });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
