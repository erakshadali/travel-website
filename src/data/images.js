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
  // Abu Dhabi
  abuDhabiMosque: '1512632578888-169bbbc64f33', // Sheikh Zayed Grand Mosque reflected in a pool at dusk
  // Ras Al Khaimah
  rakMountainRoad: '1542878447-e2b6df2526fa', // Road through the red-brown Hajar mountains
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
    'abu-dhabi': photo(P.abuDhabiMosque),
    'ras-al-khaimah': photo(P.rakMountainRoad),
    'dubai-desert': photo(P.desertDunes),
    jumeirah: photo(P.burjAlArab),
    'dubai-marina': photo(P.dubaiSkylineNight),
  },

  packages: {
    'dubai-luxe-escape': set(P.burjAlArab, P.dubaiSkylineNight, P.burjKhalifa, P.desertDunes, P.superyacht),
    'dubai-honeymoon': set(P.burjAlArabDay, P.villaPoolNight, P.superyacht, P.dubaiSkylineSunset),
    'abu-dhabi-heritage': set(P.abuDhabiMosque, P.resortPoolDusk, P.desertDunesSun),
    'ras-al-khaimah-escape': set(P.rakMountainRoad, P.cliffPoolResort, P.beachSunrise),
    'arabian-desert-retreat': set(P.desertDunesSun, P.dubaiCamels, P.desertDunes),
    'dubai-family-adventure': set(P.dubaiSkylineSunset, P.burjKhalifa, P.superyacht, P.desertDunes),
    'emirates-grand-tour': set(P.dubaiSkylineNight, P.abuDhabiMosque, P.rakMountainRoad, P.desertDunes),
  },

  experiences: {
    'desert-safari': photo(P.desertDunes),
    'burj-khalifa': photo(P.burjKhalifa),
    'yacht-cruise': photo(P.superyacht),
    'grand-mosque': photo(P.abuDhabiMosque),
    'jebel-jais': photo(P.rakMountainRoad),
  },

  heroes: {
    home: photo(P.dubaiSkylineSunset, 1920),
    destinations: photo(P.burjAlArab, 1920),
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
    'abu-dhabi': photo(P.abuDhabiMosque, 1000),
  },

  gallery: [
    { src: photo(P.dubaiSkylineSunset, 900), alt: 'Dubai skyline at sunset' },
    { src: photo(P.burjAlArab, 900), alt: 'Burj Al Arab on the Jumeirah coast' },
    { src: photo(P.abuDhabiMosque, 900), alt: 'Sheikh Zayed Grand Mosque, Abu Dhabi' },
    { src: photo(P.rakMountainRoad, 900), alt: 'Hajar mountain road, Ras Al Khaimah' },
    { src: photo(P.desertDunesSun, 900), alt: 'Golden desert dunes near Dubai' },
    { src: photo(P.superyacht, 900), alt: 'Private yacht at sea off Dubai' },
    { src: photo(P.burjKhalifa, 900), alt: 'Burj Khalifa rising above palm trees' },
    { src: photo(P.dubaiCamels, 900), alt: 'Camels in front of the Dubai skyline' },
    { src: photo(P.dubaiSkylineNight, 900), alt: 'Sheikh Zayed Road at night' },
    { src: photo(P.infinityDeck, 900), alt: 'Infinity pool deck at a luxury resort' },
    { src: photo(P.villaPoolNight, 900), alt: 'Luxury villa pool at blue hour' },
    { src: photo(P.desertDunes, 900), alt: 'Rippled sand dunes in the Arabian desert' },
  ],

  people: {
    woman1: (w = 500) => photo(P.woman1, w),
    woman2: (w = 500) => photo(P.woman2, w),
    man1: (w = 500) => photo(P.man1, w),
    man2: (w = 500) => photo(P.man2, w),
  },
}
