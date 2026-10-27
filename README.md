# Rihla Travel

White-label demo site for Dubai and Middle East tour operators, built with React, Vite, Tailwind CSS, Framer Motion and React Three Fiber.
UAE destinations (Dubai, Abu Dhabi, Ras Al Khaimah), prices shown in AED with USD as the reference line.

**Live demo:** https://rihla-demo-ten.vercel.app (Vercel project `rihla-demo`)
**Admin panel:** `/admin` — the demo deployment has no backend, so the forms are simulated and the admin shows a "no backend configured" notice
(see `server/README.md` to deploy the API).

## Run it

```bash
npm install      # first time only
npm run dev      # start the dev server (prints the local URL)
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Where to edit

| What | File |
| --- | --- |
| Phone, WhatsApp number, email, address, social links | `src/data/data.js` → `site` |
| Destinations, packages, experiences, team, testimonials | `src/data/data.js` |
| Colors and fonts | `src/index.css` → `@theme` |
| Connecting the backend | `src/services/api.js`; copy `.env.example` to `.env` and set `VITE_API_URL` (see `server/README.md`) |
| Admin panel | `/admin` (not linked from the site). Sign in with `ADMIN_EMAIL` and the password you hashed into `server/.env`; code in `src/admin/` |

## Structure

```
src/
  components/
    global/   Loader, GoldCursor, WhatsAppButton, ScrollToTop
    layout/   Navbar, Footer
    home/     Hero, SearchBar, FeaturedCarousel, WhyChooseUs, PopularPackages, Testimonials, GalleryStrip, NewsletterSection
    three/    Globe (3D, lazy-loaded)
    ui/       Reusable cards, lightbox, tilt card, counters, step progress, etc.
  pages/      Home, Destinations, Packages, PackageDetail, TripPlanner, Booking, Experiences, About, Contact, NotFound
  data/       All mock content
  services/   API layer (simulated until a backend URL is set)
  hooks/
```
