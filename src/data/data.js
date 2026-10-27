// Central mock data. Replace with API responses when a backend is connected.

import { images } from './images'

// ---------------------------------------------------------------------------
// Agency info — edit these to your real details
// ---------------------------------------------------------------------------
export const site = {
  name: 'Rihla Travel',
  shortName: 'Rihla',
  // Logo: big word + small spaced line under it, and the single letter inside the globe mark
  wordmark: { main: 'Rihla', sub: 'Travel & Tours' },
  logoLetter: 'R',
  tagline: 'Journeys Crafted in Gold',
  // Prices in this file are in the primary currency; `secondary` is shown beside them where space allows
  currency: { code: 'USD', symbol: '$', secondary: { code: 'AED', symbol: 'AED ', rate: 3.6725 } },
  phone: '+971 4 000 0000',
  // WhatsApp number in international format, digits only (no +, spaces or dashes)
  whatsapp: '971500000000',
  whatsappMessage: "Hello Rihla Travel! I'd like to plan a trip.",
  email: 'hello@rihlatravel.ae',
  address: 'Level 14, Churchill Towers, Business Bay, Dubai, UAE',
  hours: 'Mon – Sat, 9:00 AM – 8:00 PM GST',
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
export const regions = ['All', 'City', 'Desert', 'Coast', 'Mountains']
export const tripTypes = ['All', 'Honeymoon', 'Family', 'Adventure', 'Luxury']
export const budgets = [
  { label: 'Any budget', min: 0, max: Infinity },
  { label: 'Under $1,000', min: 0, max: 1000 },
  { label: '$1,000 – $1,500', min: 1000, max: 1500 },
  { label: '$1,500+', min: 1500, max: Infinity },
]

export const destinations = [
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'United Arab Emirates',
    region: 'City',
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
    id: 'abu-dhabi',
    name: 'Abu Dhabi',
    country: 'United Arab Emirates',
    region: 'City',
    types: ['Family', 'Luxury'],
    price: 849,
    rating: 4.8,
    lat: 24.47,
    lon: 54.37,
    image: images.destinations['abu-dhabi'],
    bestTime: 'Nov – Mar',
    blurb: 'The Grand Mosque, island museums and the Corniche.',
  },
  {
    id: 'ras-al-khaimah',
    name: 'Ras Al Khaimah',
    country: 'United Arab Emirates',
    region: 'Mountains',
    types: ['Adventure', 'Family', 'Honeymoon'],
    price: 790,
    rating: 4.7,
    lat: 25.79,
    lon: 55.94,
    image: images.destinations['ras-al-khaimah'],
    bestTime: 'Oct – Apr',
    blurb: 'Hajar mountain roads, Jebel Jais and quiet beach resorts.',
  },
  {
    id: 'dubai-desert',
    name: 'Dubai Desert',
    country: 'United Arab Emirates',
    region: 'Desert',
    types: ['Adventure', 'Honeymoon', 'Luxury'],
    price: 699,
    rating: 4.9,
    lat: 24.85,
    lon: 55.55,
    image: images.destinations['dubai-desert'],
    bestTime: 'Oct – Apr',
    blurb: 'Rolling dunes, falconry and candlelit desert camps.',
  },
  {
    id: 'jumeirah',
    name: 'Jumeirah & Palm',
    country: 'United Arab Emirates',
    region: 'Coast',
    types: ['Luxury', 'Honeymoon', 'Family'],
    price: 1199,
    rating: 4.9,
    lat: 25.14,
    lon: 55.19,
    image: images.destinations.jumeirah,
    bestTime: 'Nov – Apr',
    blurb: 'Beach clubs, Burj Al Arab views and the Palm Jumeirah.',
  },
  {
    id: 'dubai-marina',
    name: 'Dubai Marina',
    country: 'United Arab Emirates',
    region: 'Coast',
    types: ['Luxury', 'Adventure'],
    price: 999,
    rating: 4.8,
    lat: 25.08,
    lon: 55.14,
    image: images.destinations['dubai-marina'],
    bestTime: 'Nov – Apr',
    blurb: 'Yacht-lined promenades under a glittering skyline.',
  },
]

// Points shown on the 3D globe
export const globePoints = destinations.filter((d) =>
  ['dubai', 'abu-dhabi', 'ras-al-khaimah'].includes(d.id),
)

// Illustrative flight times from the main inbound hubs, shown on the Home page "Fly With Confidence" band.
export const routesToUae = [
  { from: 'London', to: 'Dubai', duration: '7h 00m' },
  { from: 'Riyadh', to: 'Dubai', duration: '2h 05m' },
  { from: 'Mumbai', to: 'Dubai', duration: '3h 15m' },
  { from: 'Cairo', to: 'Abu Dhabi', duration: '4h 15m' },
]

// Two large feature cards on the Home page, between "How It Works" and "Routes to the UAE".
export const homeSpotlights = [
  { destination: 'dubai', eyebrow: 'UAE & The Gulf', title: 'Discover Dubai', image: images.spotlights.dubai },
  { destination: 'abu-dhabi', eyebrow: 'The Capital', title: 'Discover Abu Dhabi', image: images.spotlights['abu-dhabi'] },
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
    id: 'dubai-honeymoon',
    destination: 'jumeirah',
    title: 'Dubai Honeymoon',
    days: 5,
    nights: 4,
    price: 1890,
    rating: 4.9,
    type: 'Honeymoon',
    inclusions: ['flight', 'hotel', 'visa', 'meals', 'transfers'],
    image: images.packages['dubai-honeymoon'][0],
    gallery: images.packages['dubai-honeymoon'],
    summary: 'Beachfront suite, private yacht dinner and a sunset desert camp for two.',
    itinerary: [
      { title: 'Arrival', text: 'Chauffeured pickup, flower-decorated suite on the Jumeirah coast and a welcome dinner.' },
      { title: 'Private Yacht', text: 'Sunset cruise past the Palm and Burj Al Arab with a chef-prepared dinner on board.' },
      { title: 'Spa & Beach', text: 'Couples spa ritual followed by a cabana at a private beach club.' },
      { title: 'Desert for Two', text: 'Private dune drive and a candlelit dinner at a secluded desert camp.' },
      { title: 'Departure', text: 'Late breakfast and private airport transfer.' },
    ],
    included: ['Return flights', '4 nights beachfront 5★ suite', 'UAE tourist visa', 'Private yacht dinner cruise', 'Couples spa session', 'Private transfers'],
    excluded: ['Tourism dirham fee', 'Personal expenses', 'Travel insurance'],
  },
  {
    id: 'abu-dhabi-heritage',
    destination: 'abu-dhabi',
    title: 'Abu Dhabi Heritage',
    days: 4,
    nights: 3,
    price: 1090,
    rating: 4.8,
    type: 'Family',
    inclusions: ['flight', 'hotel', 'visa', 'transfers'],
    image: images.packages['abu-dhabi-heritage'][0],
    gallery: images.packages['abu-dhabi-heritage'],
    summary: 'The Grand Mosque, island museums and the Corniche, at an easy pace.',
    itinerary: [
      { title: 'Arrival', text: 'Transfer to your hotel, evening walk along the Corniche.' },
      { title: 'Grand Mosque & Heritage', text: 'Guided visit of Sheikh Zayed Grand Mosque, then the Heritage Village and the Founder’s Memorial.' },
      { title: 'Museums & Yas', text: 'Morning at the Louvre Abu Dhabi, afternoon on Yas Island at your pace.' },
      { title: 'Departure', text: 'Breakfast and airport transfer.' },
    ],
    included: ['Return flights', '3 nights 4★/5★ hotel with breakfast', 'UAE tourist visa', 'Airport transfers', 'Guided Grand Mosque visit', 'Museum entry'],
    excluded: ['Lunches & dinners', 'Personal expenses', 'Travel insurance'],
  },
  {
    id: 'ras-al-khaimah-escape',
    destination: 'ras-al-khaimah',
    title: 'Ras Al Khaimah Escape',
    days: 4,
    nights: 3,
    price: 990,
    rating: 4.7,
    type: 'Adventure',
    inclusions: ['flight', 'hotel', 'visa', 'transfers'],
    image: images.packages['ras-al-khaimah-escape'][0],
    gallery: images.packages['ras-al-khaimah-escape'],
    summary: 'Mountain drives, a beachfront resort and an easy pace away from the city.',
    itinerary: [
      { title: 'Arrival', text: 'Transfer to your beach resort and an evening on the sand.' },
      { title: 'Jebel Jais', text: 'Full-day drive up the Hajar mountains to the UAE’s highest peak, with viewpoints and a café stop.' },
      { title: 'Old Town & Coast', text: 'Pearl-diving heritage in the old town, then a free afternoon at the resort.' },
      { title: 'Departure', text: 'Breakfast and transfer to Dubai or RAK airport.' },
    ],
    included: ['Return flights', '3 nights beach resort with breakfast', 'UAE tourist visa', 'Private transfers', 'Jebel Jais excursion'],
    excluded: ['Lunches & dinners', 'Adventure activities (zipline, etc.)', 'Travel insurance'],
  },
  {
    id: 'arabian-desert-retreat',
    destination: 'dubai-desert',
    title: 'Arabian Desert Retreat',
    days: 3,
    nights: 2,
    price: 890,
    rating: 4.9,
    type: 'Adventure',
    inclusions: ['hotel', 'meals', 'transfers'],
    image: images.packages['arabian-desert-retreat'][0],
    gallery: images.packages['arabian-desert-retreat'],
    summary: 'Two nights in a luxury desert camp with dune drives, falconry and stargazing.',
    itinerary: [
      { title: 'Into the Dunes', text: 'Pickup from Dubai, sunset dune drive and dinner at your private tented suite.' },
      { title: 'Desert Day', text: 'Sunrise camel walk, falconry demonstration, sandboarding and an evening telescope session.' },
      { title: 'Return', text: 'Slow breakfast, then transfer back to your Dubai hotel or the airport.' },
    ],
    included: ['2 nights luxury desert camp', 'All meals at camp', 'Private 4x4 transfers', 'Dune drives and falconry'],
    excluded: ['Flights and visa', 'Alcohol', 'Travel insurance'],
  },
  {
    id: 'dubai-family-adventure',
    destination: 'dubai',
    title: 'Dubai Family Adventure',
    days: 6,
    nights: 5,
    price: 1590,
    rating: 4.8,
    type: 'Family',
    inclusions: ['flight', 'hotel', 'visa', 'transfers'],
    image: images.packages['dubai-family-adventure'][0],
    gallery: images.packages['dubai-family-adventure'],
    summary: 'Family suites, theme parks, a desert safari and a marina cruise.',
    itinerary: [
      { title: 'Arrival', text: 'Airport transfer and check in to your family suite.' },
      { title: 'City Icons', text: 'Burj Khalifa observation deck, Dubai Mall aquarium and the Fountain show.' },
      { title: 'Theme Park Day', text: 'A full day at a leading Dubai theme park, with fast-track entry.' },
      { title: 'Desert Safari', text: 'Family-friendly dune drive, camel rides and a barbecue dinner at camp.' },
      { title: 'Marina Cruise', text: 'Late-morning boat cruise past the Palm, then a beach afternoon.' },
      { title: 'Departure', text: 'Breakfast and airport transfer.' },
    ],
    included: ['Return flights', '5 nights family suite with breakfast', 'UAE tourist visa', 'Airport transfers', 'Burj Khalifa and theme park tickets', 'Desert safari'],
    excluded: ['Lunches & dinners', 'Personal expenses', 'Travel insurance'],
  },
  {
    id: 'emirates-grand-tour',
    destination: 'dubai',
    title: 'Emirates Grand Tour',
    days: 8,
    nights: 7,
    price: 2790,
    rating: 4.9,
    type: 'Luxury',
    inclusions: ['flight', 'hotel', 'visa', 'meals', 'transfers'],
    image: images.packages['emirates-grand-tour'][0],
    gallery: images.packages['emirates-grand-tour'],
    summary: 'Dubai, Abu Dhabi and Ras Al Khaimah in one unhurried, chauffeur-driven journey.',
    itinerary: [
      { title: 'Dubai Arrival', text: 'VIP pickup and an evening at leisure in Downtown.' },
      { title: 'Dubai Icons', text: 'Burj Khalifa, Dubai Mall and a sunset dhow dinner cruise.' },
      { title: 'Desert Night', text: 'Private dune drive, falconry and dinner at a desert camp.' },
      { title: 'To Abu Dhabi', text: 'Chauffeured drive to Abu Dhabi, check in to your 5★ hotel and dinner on the Corniche.' },
      { title: 'Grand Mosque & Louvre', text: 'Private guided tour of the Grand Mosque and an afternoon at the Louvre Abu Dhabi.' },
      { title: 'To Ras Al Khaimah', text: 'Scenic drive north to your beach resort and a spa evening.' },
      { title: 'Jebel Jais', text: 'Mountain excursion to the Hajar peaks and a final dinner by the sea.' },
      { title: 'Departure', text: 'Private transfer to the airport.' },
    ],
    included: ['Return flights', '7 nights 5★ hotels with breakfast', 'UAE tourist visa', 'Chauffeured transfers between emirates', 'Desert dinner', 'Grand Mosque and Jebel Jais excursions'],
    excluded: ['Lunches', 'Tourism dirham fee', 'Travel insurance'],
  },
]

// ---------------------------------------------------------------------------
// Experiences
// ---------------------------------------------------------------------------
export const experiences = [
  { id: 'desert-safari', title: 'Desert Safari', location: 'Dubai', duration: '6 hours', price: 95, image: images.experiences['desert-safari'], text: 'Dune bashing at golden hour, camel rides and a Bedouin feast under the stars.' },
  { id: 'burj-khalifa', title: 'Burj Khalifa Visit', location: 'Dubai', duration: '2 hours', price: 75, image: images.experiences['burj-khalifa'], text: 'Rise to the observation decks of the world’s tallest tower.' },
  { id: 'yacht-cruise', title: 'Luxury Yacht Cruise', location: 'Dubai Marina', duration: '3 hours', price: 290, image: images.experiences['yacht-cruise'], text: 'Private yacht past Palm Jumeirah and Burj Al Arab.' },
  { id: 'grand-mosque', title: 'Grand Mosque Tour', location: 'Abu Dhabi', duration: '3 hours', price: 65, image: images.experiences['grand-mosque'], text: 'A guided visit to Sheikh Zayed Grand Mosque, one of the largest in the world.' },
  { id: 'jebel-jais', title: 'Jebel Jais Mountain Day', location: 'Ras Al Khaimah', duration: 'Full day', price: 140, image: images.experiences['jebel-jais'], text: 'A scenic drive through the Hajar mountains to the UAE’s highest peak.' },
]

export const galleryImages = images.gallery

// ---------------------------------------------------------------------------
// Social proof & company
// ---------------------------------------------------------------------------
export const stats = [
  { value: 12500, suffix: '+', label: 'Happy Travellers' },
  { value: 40, suffix: '+', label: 'UAE Experiences' },
  { value: 15, suffix: '', label: 'Years of Experience' },
  { value: 98, suffix: '%', label: 'Satisfaction Rate' },
]

export const testimonials = [
  { name: 'Aisha Rahman', trip: 'Dubai Honeymoon', avatar: images.people.woman1(200), rating: 5, text: 'Every detail was perfect — the beachfront suite, the private yacht dinner, the candlelit desert camp. Rihla made our honeymoon unforgettable.' },
  { name: 'Omar Siddiqui', trip: 'Dubai Luxe Escape', avatar: images.people.man1(200), rating: 5, text: 'From visa to desert safari, everything was handled flawlessly. Their WhatsApp support was available at any hour.' },
  { name: 'Sophie Laurent', trip: 'Emirates Grand Tour', avatar: images.people.woman2(200), rating: 5, text: 'Three emirates, one chauffeur and a perfectly paced itinerary. Truly a luxury experience.' },
  { name: 'Daniel Brooks', trip: 'Dubai Family Adventure', avatar: images.people.man2(200), rating: 5, text: 'Our kids still talk about the desert safari. Great value and incredibly well organised.' },
]

export const whyUs = [
  { icon: 'Award', title: 'Handcrafted Itineraries', text: 'Every journey is designed around you by specialists who have been there.' },
  { icon: 'ShieldCheck', title: 'Visa & Documentation', text: 'End-to-end visa assistance with a high approval success rate.' },
  { icon: 'Headphones', title: '24/7 Concierge', text: 'Real people on WhatsApp and phone, before, during and after your trip.' },
  { icon: 'Wallet', title: 'Best Price Promise', text: 'Exclusive partner rates on hotels, flights and experiences.' },
]

export const team = [
  { name: 'Layla Al Mansoori', role: 'Founder & CEO', image: images.people.woman1(500) },
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
