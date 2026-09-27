// Single source of truth for every photo on the site.
// Each Unsplash photo ID below was visually checked to show what its name says.
// To swap an image, change the ID here and it updates everywhere.

export const photo = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

const P = {
  // Dubai
  dubaiSkylineSunset: '1512453979798-5ea266f8880c', // Burj Khalifa skyline at sunset
  dubaiSkylineNight: '1526495124232-a04e1849168c', // Sheikh Zayed Road at night
  burjAlArab: '1518684079-3c830dcef090', // Burj Al Arab from above, turquoise sea
  burjAlArabDay: '1546412414-e1885259563a', // Burj Al Arab, clear sky
  burjKhalifa: '1582672060674-bc2bd808a8b5', // Burj Khalifa looking up, palm trees
  dubaiCamels: '1528702748617-c64d49f918af', // Camels in front of Dubai towers
  desertDunes: '1542401886-65d6c61db217', // Rippled orange sand dunes
  desertDunesSun: '1473580044384-7ba9967e16a0', // Dunes with low sun, footprints
  superyacht: '1569263979104-865ab7cd8d13', // White superyacht at sea
  // Maldives
  maldivesVillas: '1514282401047-d79a71a590e8', // Overwater villas, aerial
  maldivesJetty: '1573843981267-be1999ff37cd', // Overwater restaurant & jetty
  maldivesAerial: '1540202404-a2f29016b523', // Aerial sandbank with villas
  maldivesSeaplane: '1512100356356-de1b84283e18', // Seaplane on white beach
  maldivesVillaInterior: '1602002418082-a4443e081dd1', // Villa interior with ocean view
  scubaReef: '1544551763-46a013bb70d5', // Diver with shoal of fish
  // Paris
  eiffelSunset: '1502602898657-3e91760cbb34', // Eiffel Tower over the Seine at dusk
  pontAlexandre: '1499856871958-5b9627545d1a', // Pont Alexandre III with lamps
  eiffelStreet: '1549144511-f099e773c147', // Eiffel Tower from a Parisian street
  eiffelGardens: '1431274172761-fca41d930114', // Eiffel Tower, Champ de Mars
  // Bali
  baliTemple: '1537996194471-e657df975ab4', // Ulun Danu Beratan lake temple
  baliRiceTerraces: '1555400038-63f5ba517a47', // Tegallalang rice terraces
  baliTanahLot: '1518548419970-58e3b4079ab2', // Tanah Lot at sunset
  baliNusaPenida: '1573790387438-4da905039392', // Kelingking cliffs, Nusa Penida
  tropicalResortPool: '1520250497591-112f2f40a3f4', // Resort pool with palms & villas
  // Switzerland
  swissLauterbrunnen: '1530122037265-a5f1f91d3b99', // Lauterbrunnen valley & waterfall
  swissMatterhorn: '1491555103944-7c647fd857e6', // Matterhorn with hiker
  swissAlpineLake: '1527668752968-14dc70a27c95', // Snowy peaks over alpine lake
  swissZurich: '1515488764276-beab7607c1e6', // Zurich lakefront old town
  swissSeaOfClouds: '1506905925346-21bda4d32df4', // Alps above a sea of clouds
  // Thailand
  thaiRailay: '1552465011-b4e21bf6e79a', // Longtail boats, Railay limestone
  thaiPhiPhiView: '1506665531195-3566af2b4dfa', // Phi Phi viewpoint
  thaiPhiPhiBoat: '1504214208698-ea1916a2195a', // Longtail boat in Phi Phi lagoon
  thaiTemple: '1528181304800-259b08848526', // Ornate golden Thai temple
  bangkokNight: '1508009603885-50cf7c579365', // Bangkok Chinatown at night
  // Others
  santoriniOia: '1570077188670-e3a8d69ac5ff', // Oia whitewashed village
  santoriniDomes: '1613395877344-13d4a8e0d49e', // Blue domes over the caldera
  istanbulBlueMosque: '1527838832700-5059252407fa', // Blue Mosque at dusk
  istanbulMosque: '1541432901042-2d8bd64b4a9b', // Mosque & minarets
  istanbulGalata: '1524231757912-21f4fe3a7200', // Galata Tower skyline
  tokyoShibuya: '1540959733332-eab4deabeeaf', // Shibuya neon crossing
  // Luxury stays
  infinityDeck: '1582719508461-905c673771fd', // Loungers on an infinity pool deck
  villaPoolNight: '1542314831-068cd1dbfeeb', // Luxury villa pool at blue hour
  resortPoolDusk: '1571896349842-33c89424de2d', // Resort pool reflections at dusk
  cliffPoolResort: '1540541338287-41700207dee6', // Cliffside resort pool
  beachSunrise: '1507525428034-b723cf961d3e', // Calm beach at sunrise
  travelPlanning: '1488646953014-85cb44e25828', // Map, camera & journal flat-lay
  // People
  woman1: '1494790108377-be9c29b29330',
  woman2: '1438761681033-6461ffad8d80',
  man1: '1472099645785-5658abf4ff4e',
  man2: '1500648767791-00dcc994a43e',
}

const set = (...ids) => ids.map((id) => photo(id))

export const images = {
  destinations: {
    dubai: photo(P.dubaiSkylineSunset),
    maldives: photo(P.maldivesVillas),
    paris: photo(P.eiffelSunset),
    bali: photo(P.baliTemple),
    switzerland: photo(P.swissLauterbrunnen),
    thailand: photo(P.thaiRailay),
    santorini: photo(P.santoriniOia),
    istanbul: photo(P.istanbulBlueMosque),
    tokyo: photo(P.tokyoShibuya),
  },

  packages: {
    'dubai-luxe-escape': set(P.burjAlArab, P.dubaiSkylineNight, P.burjKhalifa, P.desertDunes, P.superyacht),
    'maldives-overwater-romance': set(P.maldivesJetty, P.maldivesVillas, P.maldivesVillaInterior, P.maldivesSeaplane, P.scubaReef),
    'paris-romance': set(P.pontAlexandre, P.eiffelSunset, P.eiffelStreet, P.eiffelGardens),
    'bali-soul-retreat': set(P.baliRiceTerraces, P.baliTemple, P.baliTanahLot, P.baliNusaPenida, P.tropicalResortPool),
    'swiss-alpine-grandeur': set(P.swissMatterhorn, P.swissLauterbrunnen, P.swissAlpineLake, P.swissZurich, P.swissSeaOfClouds),
    'thailand-island-hopper': set(P.thaiPhiPhiView, P.thaiRailay, P.thaiPhiPhiBoat, P.thaiTemple, P.bangkokNight),
    'santorini-sunsets': set(P.santoriniDomes, P.santoriniOia),
    'istanbul-heritage': set(P.istanbulBlueMosque, P.istanbulGalata, P.istanbulMosque),
  },

  experiences: {
    'desert-safari': photo(P.desertDunes),
    'burj-khalifa': photo(P.burjKhalifa),
    'yacht-cruise': photo(P.superyacht),
    'scuba-diving': photo(P.scubaReef),
    'city-tours': photo(P.istanbulBlueMosque),
  },

  heroes: {
    home: photo(P.dubaiSkylineSunset, 1920),
    destinations: photo(P.maldivesAerial, 1920),
    packages: photo(P.infinityDeck, 1920),
    planner: photo(P.travelPlanning, 1920),
    booking: photo(P.villaPoolNight, 1920),
    about: photo(P.dubaiSkylineNight, 1920),
    aboutStory: photo(P.dubaiCamels, 1000),
    contact: photo(P.burjAlArabDay, 1920),
    newsletter: photo(P.beachSunrise, 1600),
    offer: photo(P.cliffPoolResort, 1200),
  },

  // The two large feature cards on the Home page (see homeSpotlights in data.js)
  spotlights: {
    dubai: photo(P.dubaiSkylineNight, 1000),
    maldives: photo(P.maldivesAerial, 1000),
  },

  gallery: [
    { src: photo(P.dubaiSkylineSunset, 900), alt: 'Dubai skyline at sunset' },
    { src: photo(P.maldivesVillas, 900), alt: 'Overwater villas in the Maldives' },
    { src: photo(P.eiffelSunset, 900), alt: 'Eiffel Tower over the Seine' },
    { src: photo(P.baliTemple, 900), alt: 'Ulun Danu lake temple, Bali' },
    { src: photo(P.swissMatterhorn, 900), alt: 'The Matterhorn, Switzerland' },
    { src: photo(P.thaiRailay, 900), alt: 'Longtail boats at Railay, Thailand' },
    { src: photo(P.santoriniDomes, 900), alt: 'Blue domes of Santorini' },
    { src: photo(P.scubaReef, 900), alt: 'Scuba diving with reef fish' },
    { src: photo(P.desertDunesSun, 900), alt: 'Golden desert dunes near Dubai' },
    { src: photo(P.maldivesVillaInterior, 900), alt: 'Overwater villa interior, Maldives' },
    { src: photo(P.infinityDeck, 900), alt: 'Infinity pool deck at a luxury resort' },
    { src: photo(P.istanbulBlueMosque, 900), alt: 'Blue Mosque, Istanbul' },
  ],

  people: {
    woman1: (w = 500) => photo(P.woman1, w),
    woman2: (w = 500) => photo(P.woman2, w),
    man1: (w = 500) => photo(P.man1, w),
    man2: (w = 500) => photo(P.man2, w),
  },
}
