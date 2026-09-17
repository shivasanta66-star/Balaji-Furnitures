/* products.html — category filtering driven by ?category=<slug> */
window.BFPage = {
  init: function (helpers) {
    'use strict';
    var BF = window.BF;
    var img = helpers.img, esc = helpers.esc, featuredCard = helpers.featuredCard;

    var filterRow = document.querySelector('[data-filter-row]');
    var blocksHost = document.querySelector('[data-cat-blocks]');
    var featuredSection = document.querySelector('[data-featured-section]');
    var emptyNote = document.querySelector('[data-empty]');
    if (!filterRow || !blocksHost) return;

    /* filter chips: All + the 10 categories */
    filterRow.innerHTML = '<button type="button" class="filter-chip" data-slug="all">All</button>' +
      BF.categories.map(function (c) {
        return '<button type="button" class="filter-chip" data-slug="' + esc(c.slug) + '">' + esc(c.name) + '</button>';
      }).join('');

    /* one block per category, holding whichever featured pieces belong to it */
    blocksHost.innerHTML = BF.categories.map(function (c) {
      /* catalogue = the six featured pieces plus the four that fill the
         categories the bundle left empty. */
      var items = BF.catalogue.filter(function (p) { return p.category === c.name; });
      var wa = BF.waLink('Hi, I would like to enquire about ' + c.name + '.');
      return '<div class="cat-block fr" id="' + esc(c.slug) + '" data-block="' + esc(c.slug) + '">' +
        '<h2 class="cat-block-title">' + esc(c.name) + '</h2>' +
        '<div class="rule rule--18"></div>' +
        '<div class="cat-block-media">' + img(c.slotId, c.name + ' at Balaji Furnitures') + '</div>' +
        (items.length
          ? '<div class="feat-grid">' + items.map(featuredCard).join('') + '</div>'
          : '<p class="cat-block-body">Come and see this range in the showroom, or ask us what is in stock right now.</p>') +
        '<p style="margin-top:16px;"><a href="' + esc(wa) + '" target="_blank" rel="noopener" class="btn-wa-xs">Enquire on WhatsApp</a></p>' +
        '</div>';
    }).join('');

    var baseTitle = document.title;
    var chips = Array.prototype.slice.call(filterRow.querySelectorAll('.filter-chip'));
    var blocks = Array.prototype.slice.call(blocksHost.querySelectorAll('[data-block]'));
    var valid = BF.categories.map(function (c) { return c.slug; });

    function apply(slug, push) {
      if (valid.indexOf(slug) === -1) slug = 'all';
      chips.forEach(function (ch) { ch.classList.toggle('is-active', ch.getAttribute('data-slug') === slug); });
      blocks.forEach(function (b) { b.hidden = slug !== 'all' && b.getAttribute('data-block') !== slug; });
      if (featuredSection) featuredSection.hidden = slug !== 'all';
      if (emptyNote) emptyNote.hidden = true;

      var url = slug === 'all' ? 'products.html' : 'products.html?category=' + encodeURIComponent(slug);
      if (push) history.replaceState(null, '', url);
      /* baseTitle is whatever the page shipped with, so the <title> tag stays the
         single source of truth and cannot drift from this file. */
      document.title = slug === 'all'
        ? baseTitle
        : nameFor(slug) + ' — Balaji Furnitures, Jharigam';
    }

    function nameFor(slug) {
      var c = BF.categories.filter(function (x) { return x.slug === slug; })[0];
      return c ? c.name : 'Products';
    }

    chips.forEach(function (ch) {
      ch.addEventListener('click', function () { apply(ch.getAttribute('data-slug'), true); });
    });

    var initial = new URLSearchParams(location.search).get('category') || 'all';
    apply(initial, false);
  }
};
