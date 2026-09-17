/* products.html — category filtering driven by ?category=<slug> */
window.BFPage = {
  init: function (helpers) {
    'use strict';
    var BF = window.BF;
    var img = helpers.img, esc = helpers.esc, featuredCard = helpers.featuredCard;

    var filterRow = document.querySelector('[data-filter-row]');
    var host = document.querySelector('[data-products]');
    if (!filterRow || !host) return;

    var ALL_TITLE = document.title;

    /* filter chips: All + the 10 categories */
    filterRow.innerHTML = '<button type="button" class="filter-chip" data-slug="all">All</button>' +
      BF.categories.map(function (c) {
        return '<button type="button" class="filter-chip" data-slug="' + esc(c.slug) + '">' + esc(c.name) + '</button>';
      }).join('');

    var chips = Array.prototype.slice.call(filterRow.querySelectorAll('.filter-chip'));
    var valid = BF.categories.map(function (c) { return c.slug; });

    function categoryFor(slug) {
      return BF.categories.filter(function (c) { return c.slug === slug; })[0];
    }

    function enquireLink(label, text) {
      return '<p class="cat-block-cta"><a href="' + esc(BF.waLink(text)) + '" target="_blank"' +
        ' rel="noopener" class="btn-wa-xs">' + esc(label) + '</a></p>';
    }

    /* Everything in one grid, so the cards run across the page rather than
       stacking one per row down it. */
    function renderAll() {
      return '<div class="feat-grid">' + BF.catalogue.map(featuredCard).join('') + '</div>' +
        enquireLink('Ask about anything in the showroom',
          'Hi Balaji Furnitures, I would like to know more about your furniture.');
    }

    /* One category: its picture, then whatever is listed under it. */
    function renderCategory(cat) {
      var items = BF.catalogue.filter(function (p) { return p.category === cat.name; });
      return '<div class="cat-block fr">' +
        '<h2 class="cat-block-title">' + esc(cat.name) + '</h2>' +
        '<div class="rule rule--18"></div>' +
        '<div class="cat-block-media">' + img(cat.slotId, cat.name + ' at Balaji Furnitures') + '</div>' +
        (items.length
          ? '<div class="feat-grid">' + items.map(featuredCard).join('') + '</div>'
          : '<p class="cat-block-body">Come and see this range in the showroom, or ask us what is in stock right now.</p>') +
        enquireLink('Enquire on WhatsApp', 'Hi, I would like to enquire about ' + cat.name + '.') +
        '</div>';
    }

    function apply(slug, push) {
      if (valid.indexOf(slug) === -1) slug = 'all';
      chips.forEach(function (ch) { ch.classList.toggle('is-active', ch.getAttribute('data-slug') === slug); });

      var cat = categoryFor(slug);
      host.innerHTML = cat ? renderCategory(cat) : renderAll();

      var url = cat ? 'products.html?category=' + encodeURIComponent(slug) : 'products.html';
      if (push) history.replaceState(null, '', url);
      /* ALL_TITLE is whatever the page shipped with, so the <title> tag stays the
         single source of truth and cannot drift from this file. */
      document.title = cat ? cat.name + ' — Balaji Furnitures, Jharigam' : ALL_TITLE;
    }

    chips.forEach(function (ch) {
      ch.addEventListener('click', function () { apply(ch.getAttribute('data-slug'), true); });
    });

    apply(new URLSearchParams(location.search).get('category') || 'all', false);
  }
};
