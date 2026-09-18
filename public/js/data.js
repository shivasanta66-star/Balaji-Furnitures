/* Data recovered verbatim from the DCLogic class in the original bundle.
   Copy is unchanged except where noted: the wardrobe entry was rewritten to
   match the photograph the shop supplied, which shows different furniture from
   what the bundle described. */
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
    { name: 'Wardrobe & Steel Almirah', material: 'Engineered Wood & Steel', desc: 'Four-door wardrobe with two drawers, and a lockable steel almirah.', slotId: 'feat-wardrobe', category: 'Almirah & Wardrobes' },
    { name: '6-Seater Dining Set', material: 'Sheesham', desc: 'Dining table with 6 cushioned chairs.', slotId: 'feat-dining', category: 'Dining Sets' },
    { name: 'Orthopedic Spring Mattress', material: 'Engineered Wood', desc: 'Firm support spring mattress, multiple sizes.', slotId: 'feat-mattress', category: 'Mattresses' },
    { name: 'Study Table & Chair', material: 'Solid Teak', desc: 'Compact study table with drawer and matching chair.', slotId: 'feat-study', category: 'Study & Office' }
  ];

  /* The design bundle shipped six featured products, which left four categories
     with nothing behind them. These four fill that gap on the products page only —
     the home page still shows the original six.

     PLACEHOLDER COPY: the names, materials and descriptions below are reasonable
     guesses, not the shop's own words. Confirm or replace them before relying on
     them; a material claim in particular is a promise to a customer. */
  var extraProducts = [
    { name: 'Moulded Chair & Steel Stool', material: 'Plastic & Steel', desc: 'Stackable moulded chairs and steel-framed stools.', slotId: 'feat-plastic', category: 'Plastic & Steel Furniture' },
    { name: 'Wooden Home Mandir', material: 'Solid Wood', desc: 'Home temple with a carved dome and a shelf for the diya.', slotId: 'feat-mandir', category: 'Mandir' },
    { name: 'TV Unit with Storage', material: 'Engineered Wood', desc: 'Wall unit with display shelves, drawers and closed storage.', slotId: 'feat-tv', category: 'TV Units' },
    { name: 'Dining Chair Pair', material: 'Sheesham', desc: 'Cushioned seat and back, with a cut-out handle in the frame.', slotId: 'feat-chairs', category: 'Chairs' }
  ];

  /* Everything the products page lists, by category. */
  var catalogue = featured.concat(extraProducts);

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

  /* Social profiles shown in the footer.
     Fill in a url to make that icon appear; leave it '' and it stays hidden,
     so the footer never ships a dead link. WhatsApp and Google are already
     wired to the shop's real numbers. */
  var socialLinks = [
    {
      name: 'WhatsApp',
      url: 'https://wa.me/' + WHATSAPP_NUMBER,
      icon: 'M12.04 2A9.9 9.9 0 0 0 2.1 11.9c0 1.75.46 3.46 1.32 4.96L2 22l5.27-1.38a9.9 9.9 0 0 0 4.77 1.22h.01a9.9 9.9 0 0 0 9.9-9.9A9.9 9.9 0 0 0 12.04 2Zm0 18.13a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.05-.2-.31a8.23 8.23 0 1 1 6.98 3.87Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.8-.23-.09-.39-.13-.56.12s-.64.8-.79.97c-.14.16-.29.18-.54.06a6.73 6.73 0 0 1-3.37-2.95c-.25-.44.25-.4.72-1.35.08-.16.04-.3-.02-.43s-.56-1.35-.77-1.85c-.2-.48-.41-.41-.56-.42h-.48c-.17 0-.43.06-.66.31s-.86.85-.86 2.06.89 2.39 1.01 2.56c.12.16 1.74 2.66 4.22 3.73 1.57.68 2.18.73 2.97.62.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.11-.23-.18-.48-.3Z'
    },
    {
      name: 'Google',
      url: 'https://g.page/r/balaji-furnitures-jharigam/review',
      icon: 'M21.35 11.1H12v2.92h5.35a4.6 4.6 0 0 1-1.99 3.02v2.5h3.22c1.88-1.74 2.96-4.3 2.96-7.34 0-.7-.06-1.38-.19-2.02v.92Zm-9.35 10c2.7 0 4.96-.9 6.61-2.43l-3.22-2.5a5.9 5.9 0 0 1-8.79-3.1H3.27v2.58A10 10 0 0 0 12 21.1Zm-5.4-7.99a5.99 5.99 0 0 1 0-3.82V6.71H3.27a10 10 0 0 0 0 8.98l3.33-2.58ZM12 5.5c1.47 0 2.79.51 3.83 1.5l2.86-2.86A9.96 9.96 0 0 0 12 1.5a10 10 0 0 0-8.73 5.21l3.33 2.58A5.96 5.96 0 0 1 12 5.5Z'
    },
    {
      name: 'Facebook',
      url: '',
      icon: 'M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z'
    },
    {
      name: 'Instagram',
      /* PLACEHOLDER, for testing the icon only. instagram.com rather than an
         invented handle: a guessed profile name is likely to be a real
         stranger's account. Replace with the shop's own profile. */
      url: 'https://instagram.com/',
      icon: 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 5.68a4.16 4.16 0 1 0 0 8.32 4.16 4.16 0 0 0 0-8.32Zm0 6.86a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Zm5.3-7.02a.97.97 0 1 1-1.94 0 .97.97 0 0 1 1.94 0Z'
    },
    {
      name: 'YouTube',
      url: '',
      icon: 'M21.58 7.19a2.5 2.5 0 0 0-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42a2.5 2.5 0 0 0-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81a2.5 2.5 0 0 0 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42a2.5 2.5 0 0 0 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81ZM10 15.02V8.98L15.2 12 10 15.02Z'
    }
  ];

  var offerText = 'Festive exchange offer: trade in your old furniture towards a new purchase, and EMI is available on select items. Ask in-store or on WhatsApp for details.';

  global.BF = {
    WHATSAPP_NUMBER: WHATSAPP_NUMBER,
    PHONE_E164: PHONE_E164,
    directionsLink: 'https://www.google.com/maps/dir/?api=1&destination=Main+Road+Jharigam+Nabarangpur+Odisha+764076',
    reviewsLink: 'https://g.page/r/balaji-furnitures-jharigam/review',
    offerText: offerText,
    socialLinks: socialLinks,
    categories: categories,
    featured: featured,
    extraProducts: extraProducts,
    catalogue: catalogue,
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
