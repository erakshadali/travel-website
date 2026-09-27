// Central mock data. Replace with API responses when a backend is connected.

import { images } from './images'

// ---------------------------------------------------------------------------
// Agency info — edit these to your real details
// ---------------------------------------------------------------------------
export const site = {
  name: 'Fatima Tours and Travels',
  shortName: 'Fatima Travels',
  tagline: 'Journeys Crafted in Gold',
  phone: '+91 98200 00000',
  // WhatsApp number in international format, digits only (no +, spaces or dashes)
  whatsapp: '919820000000',
  whatsappMessage: "Hello Fatima Tours and Travels! I'd like to plan a trip.",
  email: 'hello@fatimatravels.com',
  address: 'Level 9, DLF Capital Point, Connaught Place, New Delhi, India',
  hours: 'Mon – Sat, 9:00 AM – 8:00 PM IST',
  social: {
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
    x: 'https://x.com/',
    youtube: 'https://youtube.com/',
  },
}

export const whatsappLink = (message = site.whatsappMessage) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`

export const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/destinations', label: 'Destinations' },
  { to: '/packages', label: 'Packages' },
  { to: '/experiences', label: 'Experiences' },
  { to: '/planner', label: 'Trip Planner' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

// ---------------------------------------------------------------------------
// Destinations
// ---------------------------------------------------------------------------
export const regions = ['All', 'Middle East', 'Asia', 'Europe', 'Indian Ocean']
export const tripTypes = ['All', 'Honeymoon', 'Family', 'Adventure', 'Luxury']
export const budgets = [
  { label: 'Any budget', min: 0, max: Infinity },
  { label: 'Under $1,500', min: 0, max: 1500 },
  { label: '$1,500 – $3,000', min: 1500, max: 3000 },
  { label: '$3,000+', min: 3000, max: Infinity },
]

export const destinations = [
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'United Arab Emirates',
    region: 'Middle East',
    types: ['Luxury', 'Family', 'Adventure'],
    price: 899,
    rating: 4.9,
    lat: 25.2,
    lon: 55.27,
    image: images.destinations.dubai,
    bestTime: 'Nov – Mar',
    blurb: 'Skyline icons, golden dunes and world-class shopping.',
  },
  {
    id: 'maldives',
    name: 'Maldives',
    country: 'Republic of Maldives',
    region: 'Indian Ocean',
    types: ['Honeymoon', 'Luxury'],
    price: 2499,
    rating: 5.0,
    lat: 3.2,
    lon: 73.22,
    image: images.destinations.maldives,
    bestTime: 'Dec – Apr',
    blurb: 'Overwater villas above endless turquoise lagoons.',
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    types: ['Honeymoon', 'Luxury', 'Family'],
    price: 1899,
    rating: 4.8,
    lat: 48.85,
    lon: 2.35,
    image: images.destinations.paris,
    bestTime: 'Apr – Jun',
    blurb: 'The city of light, haute cuisine and timeless romance.',
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    region: 'Asia',
    types: ['Honeymoon', 'Adventure', 'Family'],
    price: 1199,
    rating: 4.8,
    lat: -8.34,
    lon: 115.09,
    image: images.destinations.bali,
    bestTime: 'Apr – Oct',
    blurb: 'Temples, rice terraces and cliffside sunsets.',
  },
  {
    id: 'switzerland',
    name: 'Switzerland',
    country: 'Switzerland',
    region: 'Europe',
    types: ['Luxury', 'Adventure', 'Family', 'Honeymoon'],
    price: 3299,
    rating: 4.9,
    lat: 46.82,
    lon: 8.23,
    image: images.destinations.switzerland,
    bestTime: 'Jun – Sep',
    blurb: 'Alpine peaks, glacier trains and lakeside chalets.',
  },
  {
    id: 'thailand',
    name: 'Thailand',
    country: 'Thailand',
    region: 'Asia',
    types: ['Family', 'Adventure', 'Honeymoon'],
    price: 999,
    rating: 4.7,
    lat: 13.75,
    lon: 100.5,
    image: images.destinations.thailand,
    bestTime: 'Nov – Feb',
    blurb: 'Island hopping, street food and golden temples.',
  },
  {
    id: 'santorini',
    name: 'Santorini',
    country: 'Greece',
    region: 'Europe',
    types: ['Honeymoon', 'Luxury'],
    price: 2199,
    rating: 4.9,
    lat: 36.39,
    lon: 25.46,
    image: images.destinations.santorini,
    bestTime: 'Apr – Oct',
    blurb: 'Whitewashed villages over a volcanic caldera.',
  },
  {
    id: 'istanbul',
    name: 'Istanbul',
    country: 'Türkiye',
    region: 'Europe',
    types: ['Family', 'Luxury'],
    price: 1099,
    rating: 4.7,
    lat: 41.0,
    lon: 28.97,
    image: images.destinations.istanbul,
    bestTime: 'Apr – Jun',
    blurb: 'Where two continents meet over the Bosphorus.',
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    types: ['Adventure', 'Family'],
    price: 2799,
    rating: 4.8,
    lat: 35.68,
    lon: 139.69,
    image: images.destinations.tokyo,
    bestTime: 'Mar – May',
    blurb: 'Neon nights, serene shrines and legendary cuisine.',
  },
]

// Points shown on the 3D globe
export const globePoints = destinations.filter((d) =>
  ['dubai', 'maldives', 'paris', 'bali', 'switzerland', 'thailand'].includes(d.id),
)

// Illustrative flight times from the Delhi office, shown on the Home page "Fly With Confidence" band.
export const routesFromIndia = [
  { from: 'Delhi', to: 'Dubai', duration: '3h 30m' },
  { from: 'Delhi', to: 'Maldives', duration: '5h 20m' },
  { from: 'Delhi', to: 'Paris', duration: '9h 05m' },
  { from: 'Delhi', to: 'Bali', duration: '8h 15m' },
]

// Two large feature cards on the Home page, between "How It Works" and "Routes from India".
export const homeSpotlights = [
  { destination: 'dubai', eyebrow: 'UAE & The Gulf', title: 'Discover Dubai', image: images.spotlights.dubai },
  { destination: 'maldives', eyebrow: 'Indian Ocean', title: 'Discover Maldives', image: images.spotlights.maldives },
]

// ---------------------------------------------------------------------------
// Packages
// ---------------------------------------------------------------------------
export const inclusionLabels = {
  flight: 'Flights',
  hotel: 'Hotel',
  visa: 'Visa',
  meals: 'Meals',
  transfers: 'Transfers',
}

export const packages = [
  {
    id: 'dubai-luxe-escape',
    destination: 'dubai',
    title: 'Dubai Luxe Escape',
    days: 5,
    nights: 4,
    price: 1290,
    rating: 4.9,
    type: 'Luxury',
    inclusions: ['flight', 'hotel', 'visa', 'meals', 'transfers'],
    image: images.packages['dubai-luxe-escape'][0],
    gallery: images.packages['dubai-luxe-escape'],
    summary: 'Five-star stays, sky-high dining and a private desert safari.',
    itinerary: [
      { title: 'Arrival & Marina Evening', text: 'VIP airport pickup, check in to your 5★ hotel, sunset dhow dinner cruise along Dubai Marina.' },
      { title: 'City Icons', text: 'Guided city tour: Burj Khalifa At The Top (level 148), Dubai Mall, Dubai Fountain show.' },
      { title: 'Desert Safari', text: 'Private 4x4 dune bashing, camel ride, falconry and a gourmet Bedouin camp dinner under the stars.' },
      { title: 'Leisure & Shopping', text: 'Free day for spa, beach club or the Gold Souk. Optional yacht charter.' },
      { title: 'Departure', text: 'Breakfast, private transfer to the airport.' },
    ],
    included: ['Return economy flights', '4 nights 5★ hotel with breakfast', 'UAE tourist visa', 'Private airport transfers', 'Desert safari with dinner', 'Burj Khalifa tickets'],
    excluded: ['Tourism dirham fee', 'Personal expenses', 'Travel insurance'],
  },
  {
    id: 'maldives-overwater-romance',
    destination: 'maldives',
    title: 'Maldives Overwater Romance',
    days: 6,
    nights: 5,
    price: 3450,
    rating: 5.0,
    type: 'Honeymoon',
    inclusions: ['flight', 'hotel', 'meals', 'transfers'],
    image: images.packages['maldives-overwater-romance'][0],
    gallery: images.packages['maldives-overwater-romance'],
    summary: 'Water villa, seaplane transfers and candlelit sandbank dinners.',
    itinerary: [
      { title: 'Seaplane Arrival', text: 'Scenic seaplane transfer to your resort, welcome drinks and villa check-in.' },
      { title: 'Reef Discovery', text: 'Guided snorkelling on the house reef with turtles and reef sharks.' },
      { title: 'Spa & Sunset', text: 'Couples spa ritual followed by a sunset dolphin cruise.' },
      { title: 'Private Sandbank', text: 'Picnic on a private sandbank; candlelit beach dinner at night.' },
      { title: 'At Leisure', text: 'Relax in your overwater villa or try scuba diving.' },
      { title: 'Departure', text: 'Seaplane transfer back to Malé airport.' },
    ],
    included: ['Return flights', '5 nights overwater villa', 'All-inclusive meals', 'Seaplane transfers', 'Sunset cruise'],
    excluded: ['Scuba certification', 'Green tax', 'Travel insurance'],
  },
  {
    id: 'paris-romance',
    destination: 'paris',
    title: 'Parisian Romance',
    days: 6,
    nights: 5,
    price: 2390,
    rating: 4.8,
    type: 'Honeymoon',
    inclusions: ['flight', 'hotel', 'visa', 'transfers'],
    image: images.packages['paris-romance'][0],
    gallery: images.packages['paris-romance'],
    summary: 'Boutique stays in Saint-Germain, Seine cruises and Versailles.',
    itinerary: [
      { title: 'Bienvenue à Paris', text: 'Private transfer, check in to a boutique hotel, evening walk along the Seine.' },
      { title: 'Eiffel & Louvre', text: 'Skip-the-line Eiffel Tower summit and a guided Louvre highlights tour.' },
      { title: 'Versailles', text: 'Full-day excursion to the Palace and Gardens of Versailles.' },
      { title: 'Montmartre', text: 'Artists’ quarter walking tour and dinner cruise on the Seine.' },
      { title: 'Shopping Day', text: 'Champs-Élysées and Galeries Lafayette at your own pace.' },
      { title: 'Au Revoir', text: 'Breakfast and private airport transfer.' },
    ],
    included: ['Return flights', '5 nights boutique hotel', 'Schengen visa assistance', 'Airport transfers', 'Seine dinner cruise'],
    excluded: ['City tax', 'Lunches & dinners (except cruise)', 'Travel insurance'],
  },
  {
    id: 'bali-soul-retreat',
    destination: 'bali',
    title: 'Bali Soul Retreat',
    days: 7,
    nights: 6,
    price: 1590,
    rating: 4.8,
    type: 'Honeymoon',
    inclusions: ['flight', 'hotel', 'meals', 'transfers'],
    image: images.packages['bali-soul-retreat'][0],
    gallery: images.packages['bali-soul-retreat'],
    summary: 'Private pool villas in Ubud and Seminyak with temple tours.',
    itinerary: [
      { title: 'Arrive Seminyak', text: 'Transfer to your pool villa, sunset at a beach club.' },
      { title: 'Uluwatu', text: 'Clifftop temple visit and Kecak fire dance at sunset.' },
      { title: 'To Ubud', text: 'Transfer via Tegallalang rice terraces and a coffee plantation.' },
      { title: 'Sacred Ubud', text: 'Monkey Forest, Tirta Empul water temple and a floating breakfast.' },
      { title: 'Adventure Day', text: 'Sunrise trek on Mount Batur or white-water rafting.' },
      { title: 'Spa Day', text: 'Balinese massage and flower bath.' },
      { title: 'Departure', text: 'Private airport transfer.' },
    ],
    included: ['Return flights', '6 nights pool villa', 'Daily breakfast + 3 dinners', 'Private transfers', 'Guided tours'],
    excluded: ['Visa on arrival fee', 'Tourist levy', 'Travel insurance'],
  },
  {
    id: 'swiss-alpine-grandeur',
    destination: 'switzerland',
    title: 'Swiss Alpine Grandeur',
    days: 8,
    nights: 7,
    price: 4290,
    rating: 4.9,
    type: 'Luxury',
    inclusions: ['flight', 'hotel', 'visa', 'transfers'],
    image: images.packages['swiss-alpine-grandeur'][0],
    gallery: images.packages['swiss-alpine-grandeur'],
    summary: 'Zurich, Lucerne, Interlaken and Zermatt by first-class rail.',
    itinerary: [
      { title: 'Zurich', text: 'Arrive, old town walk and lakeside dinner.' },
      { title: 'Lucerne', text: 'Chapel Bridge and a cruise on Lake Lucerne.' },
      { title: 'Mount Titlis', text: 'Rotair cable car, glacier walk and ice cave.' },
      { title: 'Interlaken', text: 'Scenic GoldenPass rail to Interlaken.' },
      { title: 'Jungfraujoch', text: 'Top of Europe excursion at 3,454 m.' },
      { title: 'Zermatt', text: 'Car-free village beneath the Matterhorn.' },
      { title: 'Gornergrat', text: 'Cogwheel railway to panoramic Matterhorn views.' },
      { title: 'Departure', text: 'Train to Zurich airport.' },
    ],
    included: ['Return flights', '7 nights 4★/5★ hotels', 'Schengen visa assistance', 'Swiss Travel Pass (1st class)', 'Jungfraujoch & Titlis tickets'],
    excluded: ['Lunches & dinners', 'City taxes', 'Travel insurance'],
  },
  {
    id: 'thailand-island-hopper',
    destination: 'thailand',
    title: 'Thailand Island Hopper',
    days: 7,
    nights: 6,
    price: 1390,
    rating: 4.7,
    type: 'Family',
    inclusions: ['flight', 'hotel', 'meals', 'transfers'],
    image: images.packages['thailand-island-hopper'][0],
    gallery: images.packages['thailand-island-hopper'],
    summary: 'Bangkok temples, Phuket beaches and a Phi Phi speedboat trip.',
    itinerary: [
      { title: 'Bangkok', text: 'Arrive and enjoy a Chao Phraya river dinner cruise.' },
      { title: 'Temples & Markets', text: 'Grand Palace, Wat Pho and a floating market.' },
      { title: 'Fly to Phuket', text: 'Short flight, check in to a beachfront resort.' },
      { title: 'Phi Phi Islands', text: 'Speedboat tour to Maya Bay and snorkelling.' },
      { title: 'Phang Nga Bay', text: 'James Bond Island and sea canoeing.' },
      { title: 'Beach Day', text: 'Free day at leisure.' },
      { title: 'Departure', text: 'Airport transfer.' },
    ],
    included: ['Return + domestic flights', '6 nights hotels with breakfast', 'Island tours with lunch', 'All transfers'],
    excluded: ['National park fees', 'Personal expenses', 'Travel insurance'],
  },
  {
    id: 'santorini-sunsets',
    destination: 'santorini',
    title: 'Santorini Sunsets',
    days: 5,
    nights: 4,
    price: 2590,
    rating: 4.9,
    type: 'Honeymoon',
    inclusions: ['flight', 'hotel', 'visa', 'transfers'],
    image: images.packages['santorini-sunsets'][0],
    gallery: images.packages['santorini-sunsets'],
    summary: 'Cave suites in Oia, catamaran cruise and wine tasting.',
    itinerary: [
      { title: 'Arrive Oia', text: 'Transfer to your cave suite with caldera views.' },
      { title: 'Catamaran Cruise', text: 'Hot springs, Red Beach and BBQ on board.' },
      { title: 'Wine & Villages', text: 'Winery tour and the village of Pyrgos.' },
      { title: 'Leisure', text: 'Sunset in Oia, dinner in Fira.' },
      { title: 'Departure', text: 'Airport transfer.' },
    ],
    included: ['Return flights', '4 nights cave suite', 'Schengen visa assistance', 'Transfers', 'Catamaran cruise'],
    excluded: ['Meals not mentioned', 'City tax', 'Travel insurance'],
  },
  {
    id: 'istanbul-heritage',
    destination: 'istanbul',
    title: 'Istanbul Heritage',
    days: 5,
    nights: 4,
    price: 1190,
    rating: 4.7,
    type: 'Family',
    inclusions: ['flight', 'hotel', 'visa', 'meals', 'transfers'],
    image: images.packages['istanbul-heritage'][0],
    gallery: images.packages['istanbul-heritage'],
    summary: 'Hagia Sophia, the Grand Bazaar and a Bosphorus cruise.',
    itinerary: [
      { title: 'Arrival', text: 'Transfer to Sultanahmet hotel.' },
      { title: 'Old City', text: 'Hagia Sophia, Blue Mosque and Topkapi Palace.' },
      { title: 'Bosphorus', text: 'Cruise between two continents and Dolmabahçe Palace.' },
      { title: 'Bazaars', text: 'Grand Bazaar and Spice Market.' },
      { title: 'Departure', text: 'Airport transfer.' },
    ],
    included: ['Return flights', '4 nights hotel with breakfast', 'e-Visa', 'Transfers', 'Guided tours'],
    excluded: ['Lunches & dinners', 'Personal expenses', 'Travel insurance'],
  },
]

// ---------------------------------------------------------------------------
// Experiences
// ---------------------------------------------------------------------------
export const experiences = [
  { id: 'desert-safari', title: 'Desert Safari', location: 'Dubai', duration: '6 hours', price: 95, image: images.experiences['desert-safari'], text: 'Dune bashing at golden hour, camel rides and a Bedouin feast under the stars.' },
  { id: 'burj-khalifa', title: 'Burj Khalifa Visit', location: 'Dubai', duration: '2 hours', price: 75, image: images.experiences['burj-khalifa'], text: 'Rise to the observation decks of the world’s tallest tower.' },
  { id: 'yacht-cruise', title: 'Luxury Yacht Cruise', location: 'Dubai Marina', duration: '3 hours', price: 290, image: images.experiences['yacht-cruise'], text: 'Private yacht past Palm Jumeirah and Burj Al Arab.' },
  { id: 'scuba-diving', title: 'Scuba Diving', location: 'Maldives', duration: 'Half day', price: 180, image: images.experiences['scuba-diving'], text: 'Dive vibrant reefs with manta rays and turtles.' },
  { id: 'city-tours', title: 'Heritage City Tours', location: 'Istanbul · Paris', duration: 'Full day', price: 120, image: images.experiences['city-tours'], text: 'Expert-led walks through centuries of art and history.' },
]

export const galleryImages = images.gallery

// ---------------------------------------------------------------------------
// Social proof & company
// ---------------------------------------------------------------------------
export const stats = [
  { value: 12500, suffix: '+', label: 'Happy Travellers' },
  { value: 60, suffix: '+', label: 'Destinations' },
  { value: 15, suffix: '', label: 'Years of Experience' },
  { value: 98, suffix: '%', label: 'Satisfaction Rate' },
]

export const testimonials = [
  { name: 'Aisha Rahman', trip: 'Maldives Overwater Romance', avatar: images.people.woman1(200), rating: 5, text: 'Every detail was perfect — the seaplane, the villa, the private sandbank dinner. Fatima Travels made our honeymoon unforgettable.' },
  { name: 'Omar Siddiqui', trip: 'Dubai Luxe Escape', avatar: images.people.man1(200), rating: 5, text: 'From visa to desert safari, everything was handled flawlessly. Their WhatsApp support was available at any hour.' },
  { name: 'Sophie Laurent', trip: 'Swiss Alpine Grandeur', avatar: images.people.woman2(200), rating: 5, text: 'First-class trains, stunning hotels and a perfectly paced itinerary. Truly a luxury experience.' },
  { name: 'Daniel Brooks', trip: 'Thailand Island Hopper', avatar: images.people.man2(200), rating: 5, text: 'Our kids still talk about Phi Phi. Great value and incredibly well organised.' },
]

export const whyUs = [
  { icon: 'Award', title: 'Handcrafted Itineraries', text: 'Every journey is designed around you by specialists who have been there.' },
  { icon: 'ShieldCheck', title: 'Visa & Documentation', text: 'End-to-end visa assistance with a high approval success rate.' },
  { icon: 'Headphones', title: '24/7 Concierge', text: 'Real people on WhatsApp and phone, before, during and after your trip.' },
  { icon: 'Wallet', title: 'Best Price Promise', text: 'Exclusive partner rates on hotels, flights and experiences.' },
]

export const team = [
  { name: 'Fatima Khan', role: 'Founder & CEO', image: images.people.woman1(500) },
  { name: 'Ahmed Malik', role: 'Head of Operations', image: images.people.man1(500) },
  { name: 'Sara Hussain', role: 'Luxury Travel Designer', image: images.people.woman2(500) },
  { name: 'Yusuf Ali', role: 'Visa & Ticketing Lead', image: images.people.man2(500) },
]

export const planner = {
  interests: ['Beach', 'Culture', 'Adventure', 'Shopping', 'Food'],
  hotels: [
    { id: '3', label: 'Comfort 3★', note: 'Smart, central and great value' },
    { id: '4', label: 'Premium 4★', note: 'Stylish hotels with great amenities' },
    { id: '5', label: 'Luxury 5★', note: 'Iconic five-star properties' },
    { id: 'villa', label: 'Private Villa', note: 'Pool villas & exclusive residences' },
  ],
  budgets: ['Under $1,500', '$1,500 – $3,000', '$3,000 – $5,000', '$5,000+'],
}
