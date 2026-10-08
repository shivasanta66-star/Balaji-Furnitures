/* Shop content: categories, products, copy, FAQs and contact details.
   Edit here to change what the site says. */
(function (global) {
  'use strict';

  var WHATSAPP_NUMBER = '919937601505';
  var PHONE_E164 = '+919937601505';

  function slugify(name) {
    return name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  var categories = [
    { name: 'Beds', slotId: 'cat-beds' },
    { name: 'Almirah & Wardrobes', slotId: 'cat-almirah' },
    { name: 'Sofa Sets', slotId: 'cat-sofa' },
    { name: 'Dining Sets', slotId: 'cat-dining' },
    { name: 'Mattresses', slotId: 'cat-mattress' },
    { name: 'Study & Office', slotId: 'cat-study' },
    { name: 'Plastic & Steel Furniture', slotId: 'cat-plastic' },
    { name: 'Mandir', slotId: 'cat-mandir' },
    { name: 'TV Units', slotId: 'cat-tv' },
    { name: 'Chairs', slotId: 'cat-chairs' }
  ].map(function (c) {
    return { name: c.name, slotId: c.slotId, slug: slugify(c.name) };
  });

  var featured = [
    { name: 'Sheesham Wood Sofa Set', material: 'Sheesham', desc: 'Three-seater with two matching chairs.', slotId: 'feat-sofa', category: 'Sofa Sets' },
    { name: 'Solid Teak Bed', material: 'Solid Teak', desc: 'Queen size, with storage under the bed.', slotId: 'feat-bed', category: 'Beds' },
    { name: 'Wardrobe & Steel Almirah', material: 'Engineered Wood & Steel', desc: 'Four-door wardrobe with two drawers. Steel almirahs with a locker too.', slotId: 'feat-wardrobe', category: 'Almirah & Wardrobes' },
    { name: '6-Seater Dining Set', material: 'Sheesham', desc: 'Table with six cushioned chairs.', slotId: 'feat-dining', category: 'Dining Sets' },
    { name: 'Spring Mattress', material: '', desc: 'Firm spring mattresses from Kurlon, Duroflex and Springwel, in different sizes.', slotId: 'feat-mattress', category: 'Mattresses' },
    { name: 'Study Table & Chair', material: 'Solid Teak', desc: 'Small table with a drawer, and a chair to go with it.', slotId: 'feat-study', category: 'Study & Office' }
  ];

  /* The design bundle shipped six featured products, which left four categories
     with nothing behind them. These four fill that gap on the products page only —
     the home page still shows the original six.

     PLACEHOLDER COPY: the names, materials and descriptions below are reasonable
     guesses, not the shop’s own words. Confirm or replace them before relying on
     them; a material claim in particular is a promise to a customer. */
  var extraProducts = [
    { name: 'Moulded Chair & Steel Stool', material: '', desc: 'Stackable moulded chairs and steel-framed stools.', slotId: 'feat-plastic', category: 'Plastic & Steel Furniture' },
    { name: 'Wooden Home Mandir', material: '', desc: 'Home temple with a carved dome and a shelf for the diya.', slotId: 'feat-mandir', category: 'Mandir' },
    { name: 'TV Unit with Storage', material: '', desc: 'Wall unit with display shelves, drawers and closed storage.', slotId: 'feat-tv', category: 'TV Units' },
    { name: 'Dining Chair Pair', material: '', desc: 'Cushioned seat and back, with a cut-out handle in the frame.', slotId: 'feat-chairs', category: 'Chairs' }
  ];

  /* Everything the products page lists, by category. */
  var catalogue = featured.concat(extraProducts);

  var woodTypes = [
    { title: 'Solid Teak', body: 'The real thing. It lasts the longest and termites leave it alone, but it costs the most and sometimes we have to wait for stock. We use it for beds, tables and our better wardrobes.' },
    { title: 'Sheesham', body: 'Hard, heavy wood with a dark grain. Cheaper than teak and strong enough for everyday use. Most of our sofas, dining sets and chairs are sheesham.' },
    { title: 'Engineered Wood', body: 'Ply or board with a laminate on top. It keeps the price down and works well for wardrobes, but keep it away from damp walls. It won’t last like solid wood, and we’ll tell you that.' }
  ];

  var brands = ['Kurlon', 'Duroflex', 'Nilkamal', 'Springwel'];

  var serviceCards = [
    { title: 'Delivery and fitting', body: 'Free within 25 km of Jharigam. Our own people bring it and put it together at your home.' },
    { title: 'Polish and repair', body: 'We repolish and repair what we sold you. Older furniture from elsewhere too, for a small charge.' },
    { title: 'Warranty', body: 'One year on our furniture if something is wrong with how it was made. Mattresses carry the company warranty and we help you claim it.' },
    { title: 'Shifting house?', body: 'We can open up the furniture and fit it again at the new place. Ask when you buy.' }
  ];

  var deliveryAreas = ['Jharigam', 'Umerkote', 'Raighar', 'Chandahandi', 'Papadahandi', 'Nabarangpur', 'Kosagumuda', 'Tentulikhunti'];

  var faqs = [
    { q: 'Do you deliver to my village?', a: 'Free within 25 km of Jharigam. That covers Umerkote, Raighar, Chandahandi, Papadahandi and Nabarangpur town. Send us your village name on WhatsApp and we’ll tell you.' },
    { q: 'Is the wood real teak?', a: 'If we say teak, it’s teak. Come and look at the grain yourself. We also sell sheesham and engineered wood, and we’ll tell you which is which.' },
    { q: 'Do you offer EMI?', a: 'Yes, on some items. The terms change, so ask us in the shop or on WhatsApp.' },
    { q: 'Can I order a custom size?', a: 'Yes. We’ll come and measure at your home for free. Most pieces are ready in 2 to 3 weeks.' },
    { q: 'What warranty do I get?', a: 'One year on furniture if there’s a fault in how it was made. Mattresses have the company’s own warranty, and we help you claim it.' },
    { q: 'Do you take old furniture in exchange?', a: 'Yes. Bring the old piece in and we’ll knock its value off the new one.' },
    { q: 'Do you assemble at home?', a: 'Yes, free, as long as you’re within our delivery area.' },
    { q: 'Are you open on Sunday?', a: 'No, Sunday is our day off. Monday to Saturday we’re open 9 AM to 9 PM.' }
  ];

  var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /* Footer social icons. Add an entry with a real profile url to show it. */
  var socialLinks = [
    {
      name: 'WhatsApp',
      url: 'https://wa.me/' + WHATSAPP_NUMBER,
      icon: 'M12.04 2A9.9 9.9 0 0 0 2.1 11.9c0 1.75.46 3.46 1.32 4.96L2 22l5.27-1.38a9.9 9.9 0 0 0 4.77 1.22h.01a9.9 9.9 0 0 0 9.9-9.9A9.9 9.9 0 0 0 12.04 2Zm0 18.13a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.05-.2-.31a8.23 8.23 0 1 1 6.98 3.87Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.8-.23-.09-.39-.13-.56.12s-.64.8-.79.97c-.14.16-.29.18-.54.06a6.73 6.73 0 0 1-3.37-2.95c-.25-.44.25-.4.72-1.35.08-.16.04-.3-.02-.43s-.56-1.35-.77-1.85c-.2-.48-.41-.41-.56-.42h-.48c-.17 0-.43.06-.66.31s-.86.85-.86 2.06.89 2.39 1.01 2.56c.12.16 1.74 2.66 4.22 3.73 1.57.68 2.18.73 2.97.62.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.11-.23-.18-.48-.3Z'
    }
  ];

  var offerText = 'Bring your old furniture and we’ll take it off the price of the new one. EMI on some items too. Ask us for details.';

  global.BF = {
    WHATSAPP_NUMBER: WHATSAPP_NUMBER,
    PHONE_E164: PHONE_E164,
    directionsLink: 'https://www.google.com/maps/dir/?api=1&destination=Main+Road+Jharigam+Nabarangpur+Odisha+764076',
    offerText: offerText,
    socialLinks: socialLinks,
    categories: categories,
    featured: featured,
    extraProducts: extraProducts,
    catalogue: catalogue,
    woodTypes: woodTypes,
    brands: brands,
    serviceCards: serviceCards,
    deliveryAreas: deliveryAreas,
    faqs: faqs,
    dayNames: dayNames,
    slugify: slugify,
    waLink: function (text) {
      return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
    }
  };
})(window);
