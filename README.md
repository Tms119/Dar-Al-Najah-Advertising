# Dar Al Najah Advertising — Website (UI demo)

A modern, light-mode printing-company website built with **Next.js 15 + React 19**.
The design takes cues from two26.studio: chunky condensed display type, pill tags, marquees, text that colours in on scroll, and playful floating objects.

## Run it

```bash
cd web
npm install
npm run dev
```
Then open http://localhost:3000

## Pages
| Route | What it is |
|---|---|
| `/` | Home: hero with floating print mockups, marquee, scroll-reveal about text, sticky stacked service cards, bestsellers, process, stats, reviews, FAQ |
| `/products` | Full catalogue (95 products): category tabs, group chips, search and sort. `?cat=printing` and the other slugs deep-link to a category |
| `/products/[slug]` | Product page: option picker, quantity tiers, live price estimate, artwork drop-zone, WhatsApp quote |
| `/contact` | Quote form. `?product=slug` pre-fills the form |

## Where things live
```
web/src/data/catalog.js      ← ALL products, categories, company info (swap for DB later)
web/src/components/Mock.js   ← illustrated SVG product mockups (placeholder imagery)
web/src/components/          ← Header (mega menu + mobile menu), Hero, Marquee, ScrollText, ProductCard, Faq, Footer
web/src/app/globals.css      ← design tokens + all styles
PRODUCTS.md                  ← full product list + DB schema + admin panel plan
```

## Before launch, replace these placeholders
- Phone, WhatsApp number, email, address and hours: `COMPANY` in `catalog.js`
- Prices and turnaround times
- Testimonials and stats on the home page
- Real product photos, which arrive with the admin panel (see PRODUCTS.md)
