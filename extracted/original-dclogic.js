<script type="text/x-dc" data-dc-script="" data-props="{&quot;$preview&quot;:{},&quot;offerText&quot;:{&quot;editor&quot;:&quot;text&quot;,&quot;default&quot;:&quot;Festive exchange offer: trade in your old furniture towards a new purchase, and EMI is available on select items.&quot;,&quot;tsType&quot;:&quot;string&quot;},&quot;whatsappNumber&quot;:{&quot;editor&quot;:&quot;text&quot;,&quot;default&quot;:&quot;919937601505&quot;,&quot;tsType&quot;:&quot;string&quot;},&quot;reviewsLink&quot;:{&quot;editor&quot;:&quot;text&quot;,&quot;default&quot;:&quot;https://g.page/r/balaji-furnitures-jharigam/review&quot;,&quot;tsType&quot;:&quot;string&quot;}}">
class Component extends DCLogic {
  state = {
    mobileMenuOpen: false,
    isMobile: false,
    lightboxIndex: null,
    openFaqIndex: 0,
    formName: '',
    formPhone: '',
    formCategory: 'Beds',
    formMessage: '',
    phoneError: ''
  };

  componentDidMount() {
    this.mq = window.matchMedia('(max-width: 768px)');
    this.mqListener = () => this.setState({ isMobile: this.mq.matches });
    this.mqListener();
    this.mq.addEventListener('change', this.mqListener);
  }
  componentWillUnmount() {
    if (this.mq) this.mq.removeEventListener('change', this.mqListener);
  }

  waLink(text) {
    return 'https://wa.me/919937601505?text=' + encodeURIComponent(text);
  }

  renderVals() {
    const whatsappNumber = this.props.whatsappNumber || '919937601505';
    const waLinkGeneric = 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent('Hi Balaji Furnitures, I would like to know more about your furniture.');
    const waLinkOffer = 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent("Hi, I'd like details on this month's offer.");
    const waLinkCustom = 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent("Hi, I'd like to ask about a custom furniture piece.");
    const directionsLink = 'https://www.google.com/maps/dir/?api=1&destination=Main+Road+Jharigam+Nabarangpur+Odisha+764076';
    const reviewsLink = this.props.reviewsLink || 'https://g.page/r/balaji-furnitures-jharigam/review';

    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours() + now.getMinutes() / 60;
    const isOpen = day !== 0 && hour >= 9 && hour < 21;

    const categories = [
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
    ];

    const featuredBase = [
      { name: 'Sheesham Wood Sofa Set', material: 'Sheesham', desc: '3-seater with matching armchairs, cushioned seating.', slotId: 'feat-sofa' },
      { name: 'Solid Teak Bed', material: 'Solid Teak', desc: 'Queen-size bed with storage, solid teak frame.', slotId: 'feat-bed' },
      { name: 'King Wardrobe', material: 'Engineered Wood', desc: '3-door wardrobe with mirror and drawers.', slotId: 'feat-wardrobe' },
      { name: '6-Seater Dining Set', material: 'Sheesham', desc: 'Dining table with 6 cushioned chairs.', slotId: 'feat-dining' },
      { name: 'Orthopedic Spring Mattress', material: 'Engineered Wood', desc: 'Firm support spring mattress, multiple sizes.', slotId: 'feat-mattress' },
      { name: 'Study Table & Chair', material: 'Solid Teak', desc: 'Compact study table with drawer and matching chair.', slotId: 'feat-study' }
    ];
    const featured = featuredBase.map((p) => {
      return Object.assign({}, p, { waLink: this.waLink('Hi, I would like to enquire about the ' + p.name + '.') });
    });

    const woodTypes = [
      { title: 'Solid Teak', body: 'Real teak wood, cut and seasoned before use. The most durable option, resisting termites and warping for decades, but it costs more and takes longer to source. Used in our beds, tables and premium wardrobes.' },
      { title: 'Sheesham', body: 'A strong, richly grained hardwood, lighter on the pocket than teak. Very durable for regular home use in sofas, dining sets and chairs. A dependable middle ground.' },
      { title: 'Engineered Wood', body: 'Plywood or board with a laminate or veneer finish. Lower cost, good for wardrobes and modular pieces that stay indoors, but less durable in damp conditions than solid wood.' }
    ];

    const brands = ['Kurlon', 'Duroflex', 'Nilkamal', 'Springwel'];

    const serviceCards = [
      { icon: String.fromCodePoint(128666), title: 'Free delivery & assembly', body: 'Free delivery and on-site assembly within 25 km of Jharigam.' },
      { icon: String.fromCodePoint(129690), title: 'Polishing & repair', body: 'In-house polishing and repair for furniture bought from us, at fair rates for older pieces.' },
      { icon: String.fromCodePoint(128196), title: 'Warranty', body: 'One year warranty against manufacturing defects on furniture; mattress brand warranty passed on as-is.' },
      { icon: String.fromCodePoint(127968), title: 'Move with you', body: 'Dismantling and reinstallation if you shift house, ask us when you book delivery.' }
    ];

    const n10 = [0,1,2,3,4,5,6,7,8,9];
    const galleryItems = n10.map((i) => {
      return { n: i + 1, slotId: 'gallery-' + (i + 1), open: () => this.setState({ lightboxIndex: i }) };
    });

    const reviews = [
      { name: 'Suman R.', quote: 'Quoted one price, no bargaining games, and delivered on time. Exactly what they promised.' },
      { name: 'Debashish P.', quote: 'Bought a sheesham dining set. Two years on, still solid, and they came back to fix a loose joint for free.' },
      { name: 'Manasi T.', quote: 'The owner himself explained which wood was real teak and which was not. Nobody else in town does that.' },
      { name: 'Ranjit K.', quote: 'Delivery to our village near Umerkote was free and on schedule. Assembly took twenty minutes.' },
      { name: 'Ipsita M.', quote: 'Good behaviour from the staff, no pressure to buy. We came back a second time for a wardrobe.' }
    ];

    const deliveryAreas = ['Jharigam', 'Umerkote', 'Raighar', 'Chandahandi', 'Papadahandi', 'Nabarangpur', 'Kosagumuda', 'Tentulikhunti'];

    const faqData = [
      { q: 'Do you deliver to my village?', a: 'We deliver free within 25 km of Jharigam, including Umerkote, Raighar, Chandahandi, Papadahandi and Nabarangpur town. Message us on WhatsApp with your village name and we will confirm.' },
      { q: 'Is the wood real teak?', a: 'Where we say solid teak, it is solid teak. We will show you the grain and let you check it yourself in the showroom. We also sell sheesham and engineered wood, and we label each piece honestly.' },
      { q: 'Do you offer EMI?', a: 'Yes, EMI is available on select purchases through our finance partners. Ask in-store or on WhatsApp for current terms.' },
      { q: 'Can I order a custom size?', a: 'Yes. We visit your home free of charge to measure, and most custom pieces are ready in 2 to 3 weeks.' },
      { q: 'What warranty do I get?', a: 'One year against manufacturing defects on furniture we build or sell; mattress brands carry their own warranty, which we help you claim.' },
      { q: 'Do you take old furniture in exchange?', a: 'Yes, ask about our current exchange offer. Bring in your old piece and we will value it against your new purchase.' },
      { q: 'Do you assemble at home?', a: 'Yes, all furniture is delivered and assembled at your home free of charge within our delivery radius.' },
      { q: 'Are you open on Sunday?', a: 'No, we are closed on Sundays. We are open 9 AM to 9 PM every other day of the week.' }
    ];
    const faqs = faqData.map((f, i) => {
      return Object.assign({}, f, {
        isOpen: this.state.openFaqIndex === i,
        sign: this.state.openFaqIndex === i ? '-' : '+',
        toggle: () => this.setState({ openFaqIndex: this.state.openFaqIndex === i ? -1 : i })
      });
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekHours = dayNames.map((d, i) => {
      return { day: d, hours: i === 0 ? 'Closed' : '9:00 AM - 9:00 PM', bg: i === day ? 'var(--sand)' : 'transparent' };
    });

    const categoryOptions = categories.map((c) => c.name);

    const setName = (e) => this.setState({ formName: e.target.value });
    const setPhone = (e) => this.setState({ formPhone: e.target.value, phoneError: '' });
    const setCategory = (e) => this.setState({ formCategory: e.target.value });
    const setMessage = (e) => this.setState({ formMessage: e.target.value });
    const validPhone = new RegExp('^[6-9][0-9]{9}$');
    const submitForm = () => {
      const phone = this.state.formPhone.trim();
      if (!validPhone.test(phone)) {
        this.setState({ phoneError: 'Enter a valid 10-digit Indian mobile number.' });
        return;
      }
      const lines = ['Enquiry from website:', 'Name: ' + this.state.formName, 'Phone: ' + phone, 'Category: ' + this.state.formCategory, 'Message: ' + this.state.formMessage];
      window.open(this.waLink(lines.join('\n')), '_blank');
    };

    const lightboxOpen = this.state.lightboxIndex !== null;

    return {
      mobileMenuOpen: this.state.mobileMenuOpen,
      toggleMenu: () => this.setState((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
      navDisplay: this.state.isMobile ? 'none' : 'flex',
      hamburgerDisplay: this.state.isMobile ? 'block' : 'none',
      isMobile: this.state.isMobile,
      fabBottom: this.state.isMobile ? '76px' : '20px',
      bottomPad: this.state.isMobile ? '56px' : '0px',
      statusLabel: isOpen ? 'Open now' : 'Closed now',
      statusBg: isOpen ? 'var(--open)' : 'var(--muted)',
      waLinkGeneric: waLinkGeneric,
      waLinkOffer: waLinkOffer,
      waLinkCustom: waLinkCustom,
      directionsLink: directionsLink,
      reviewsLink: reviewsLink,
      offerText: this.props.offerText || 'Festive exchange offer: trade in your old furniture towards a new purchase, and EMI is available on select items. Ask in-store or on WhatsApp for details.',
      categories: categories,
      featured: featured,
      woodTypes: woodTypes,
      brands: brands,
      serviceCards: serviceCards,
      galleryItems: galleryItems,
      reviews: reviews,
      deliveryAreas: deliveryAreas,
      faqs: faqs,
      weekHours: weekHours,
      categoryOptions: categoryOptions,
      trustItems: [
        { icon: String.fromCodePoint(127795), label: 'Genuine solid wood' },
        { icon: String.fromCodePoint(10003), label: 'One fair price, no bargaining' },
        { icon: String.fromCodePoint(128666), label: 'Free local delivery' },
        { icon: String.fromCodePoint(128295), label: 'Service and repair after sale' }
      ],
      lightboxOpen: lightboxOpen,
      lightboxSlotId: lightboxOpen ? 'gallery-' + (this.state.lightboxIndex + 1) : 'gallery-1',
      closeLightbox: () => this.setState({ lightboxIndex: null }),
      prevImage: () => this.setState((s) => ({ lightboxIndex: (s.lightboxIndex + 9) % 10 })),
      nextImage: () => this.setState((s) => ({ lightboxIndex: (s.lightboxIndex + 1) % 10 })),
      formName: this.state.formName,
      formPhone: this.state.formPhone,
      formCategory: this.state.formCategory,
      formMessage: this.state.formMessage,
      phoneError: this.state.phoneError,
      setName: setName,
      setPhone: setPhone,
      setCategory: setCategory,
      setMessage: setMessage,
      submitForm: submitForm,
      year: now.getFullYear()
    };
  }
}
</script>


