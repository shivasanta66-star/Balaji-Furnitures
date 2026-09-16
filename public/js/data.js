/* Data recovered verbatim from the DCLogic class in the original bundle.
   Copy is unchanged — it was written for this shop. */
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
    { name: 'Sheesham Wood Sofa Set', material: 'Sheesham', desc: '3-seater with matching armchairs, cushioned seating.', slotId: 'feat-sofa', category: 'Sofa Sets' },
    { name: 'Solid Teak Bed', material: 'Solid Teak', desc: 'Queen-size bed with storage, solid teak frame.', slotId: 'feat-bed', category: 'Beds' },
    { name: 'King Wardrobe', material: 'Engineered Wood', desc: '3-door wardrobe with mirror and drawers.', slotId: 'feat-wardrobe', category: 'Almirah & Wardrobes' },
    { name: '6-Seater Dining Set', material: 'Sheesham', desc: 'Dining table with 6 cushioned chairs.', slotId: 'feat-dining', category: 'Dining Sets' },
    { name: 'Orthopedic Spring Mattress', material: 'Engineered Wood', desc: 'Firm support spring mattress, multiple sizes.', slotId: 'feat-mattress', category: 'Mattresses' },
    { name: 'Study Table & Chair', material: 'Solid Teak', desc: 'Compact study table with drawer and matching chair.', slotId: 'feat-study', category: 'Study & Office' }
  ];

  var woodTypes = [
    { title: 'Solid Teak', body: 'Real teak wood, cut and seasoned before use. The most durable option, resisting termites and warping for decades, but it costs more and takes longer to source. Used in our beds, tables and premium wardrobes.' },
    { title: 'Sheesham', body: 'A strong, richly grained hardwood, lighter on the pocket than teak. Very durable for regular home use in sofas, dining sets and chairs. A dependable middle ground.' },
    { title: 'Engineered Wood', body: 'Plywood or board with a laminate or veneer finish. Lower cost, good for wardrobes and modular pieces that stay indoors, but less durable in damp conditions than solid wood.' }
  ];

  var brands = ['Kurlon', 'Duroflex', 'Nilkamal', 'Springwel'];

  var serviceCards = [
    { icon: String.fromCodePoint(128666), title: 'Free delivery & assembly', body: 'Free delivery and on-site assembly within 25 km of Jharigam.' },
    { icon: String.fromCodePoint(129690), title: 'Polishing & repair', body: 'In-house polishing and repair for furniture bought from us, at fair rates for older pieces.' },
    { icon: String.fromCodePoint(128196), title: 'Warranty', body: 'One year warranty against manufacturing defects on furniture; mattress brand warranty passed on as-is.' },
    { icon: String.fromCodePoint(127968), title: 'Move with you', body: 'Dismantling and reinstallation if you shift house, ask us when you book delivery.' }
  ];

  var trustItems = [
    { icon: String.fromCodePoint(127795), label: 'Genuine solid wood' },
    { icon: String.fromCodePoint(10003), label: 'One fair price, no bargaining' },
    { icon: String.fromCodePoint(128666), label: 'Free local delivery' },
    { icon: String.fromCodePoint(128295), label: 'Service and repair after sale' }
  ];

  var galleryItems = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (i) {
    return { n: i + 1, slotId: 'gallery-' + (i + 1) };
  });

  var reviews = [
    { name: 'Suman R.', quote: 'Quoted one price, no bargaining games, and delivered on time. Exactly what they promised.' },
    { name: 'Debashish P.', quote: 'Bought a sheesham dining set. Two years on, still solid, and they came back to fix a loose joint for free.' },
    { name: 'Manasi T.', quote: 'The owner himself explained which wood was real teak and which was not. Nobody else in town does that.' },
    { name: 'Ranjit K.', quote: 'Delivery to our village near Umerkote was free and on schedule. Assembly took twenty minutes.' },
    { name: 'Ipsita M.', quote: 'Good behaviour from the staff, no pressure to buy. We came back a second time for a wardrobe.' }
  ];

  var deliveryAreas = ['Jharigam', 'Umerkote', 'Raighar', 'Chandahandi', 'Papadahandi', 'Nabarangpur', 'Kosagumuda', 'Tentulikhunti'];

  var faqs = [
    { q: 'Do you deliver to my village?', a: 'We deliver free within 25 km of Jharigam, including Umerkote, Raighar, Chandahandi, Papadahandi and Nabarangpur town. Message us on WhatsApp with your village name and we will confirm.' },
    { q: 'Is the wood real teak?', a: 'Where we say solid teak, it is solid teak. We will show you the grain and let you check it yourself in the showroom. We also sell sheesham and engineered wood, and we label each piece honestly.' },
    { q: 'Do you offer EMI?', a: 'Yes, EMI is available on select purchases through our finance partners. Ask in-store or on WhatsApp for current terms.' },
    { q: 'Can I order a custom size?', a: 'Yes. We visit your home free of charge to measure, and most custom pieces are ready in 2 to 3 weeks.' },
    { q: 'What warranty do I get?', a: 'One year against manufacturing defects on furniture we build or sell; mattress brands carry their own warranty, which we help you claim.' },
    { q: 'Do you take old furniture in exchange?', a: 'Yes, ask about our current exchange offer. Bring in your old piece and we will value it against your new purchase.' },
    { q: 'Do you assemble at home?', a: 'Yes, all furniture is delivered and assembled at your home free of charge within our delivery radius.' },
    { q: 'Are you open on Sunday?', a: 'No, we are closed on Sundays. We are open 9 AM to 9 PM every other day of the week.' }
  ];

  var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  var offerText = 'Festive exchange offer: trade in your old furniture towards a new purchase, and EMI is available on select items. Ask in-store or on WhatsApp for details.';

  global.BF = {
    WHATSAPP_NUMBER: WHATSAPP_NUMBER,
    PHONE_E164: PHONE_E164,
    directionsLink: 'https://www.google.com/maps/dir/?api=1&destination=Main+Road+Jharigam+Nabarangpur+Odisha+764076',
    reviewsLink: 'https://g.page/r/balaji-furnitures-jharigam/review',
    offerText: offerText,
    categories: categories,
    featured: featured,
    woodTypes: woodTypes,
    brands: brands,
    serviceCards: serviceCards,
    trustItems: trustItems,
    galleryItems: galleryItems,
    reviews: reviews,
    deliveryAreas: deliveryAreas,
    faqs: faqs,
    dayNames: dayNames,
    slugify: slugify,
    waLink: function (text) {
      return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
    }
  };
})(window);
