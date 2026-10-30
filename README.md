# POIGAI website — Node.js 20 compatible

## Requirements
- Node.js 20.11.0 or newer within the Node 20 LTS line
- npm

The project pins Vite 6 and compatible dependency versions so it does not use the newer Rolldown-based Vite setup that caused a `node:util styleText` error on Node 20.11.0.

## Run locally (Windows + VS Code)
1. Extract this ZIP if you haven't already.
2. Open the inner `poigai-website` folder in VS Code (the folder containing `package.json`).
3. Open Terminal → New Terminal.
4. If you are reusing an older extracted copy, delete its `node_modules` folder and `package-lock.json` first.
5. Run `npm install`.
6. Run `npm run dev`.
7. Open the Local URL printed by Vite (usually http://localhost:5173).

Keep the terminal open while testing the site. Press Ctrl+C to stop it.

## Configure WhatsApp
1. Copy `.env.example` and rename the copy to `.env`.
2. Replace `91XXXXXXXXXX` with the POIGAI WhatsApp business number (country code + number, digits only).
3. Restart the dev server after changing `.env`.

## Admin panel (products, stock, offers, site text)
The storefront runs on a Supabase backend so you can manage everything from `/admin`
without touching code. **See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** for the full
one-time setup (create a project, run the schema, create your admin login, add the
keys to `.env`).

Until Supabase is connected, the site runs in **preview mode** with placeholder
products so you can see the design — a note on the storefront and a notice on
`/admin` make this clear.

## What's in the storefront
- Search, category filters and sorting (featured / newest / price)
- Wishlist (saved in the browser) with a slide-in drawer
- Product quick view with stock and offer badges
- Stock-aware WhatsApp enquiry messages (mentions price, flags out-of-stock items)
- Responsive navigation (desktop nav, mobile/tablet menu) across phone, tablet and
  desktop widths
- Admin panel at `/admin`: sign in, manage products (with image upload), categories,
  and site-wide settings (announcement bar, WhatsApp number, hero text, Instagram link)

## Preview notes
- Your supplied POIGAI logo artwork is at `public/poigai-logo.png` (original, untouched).
  `public/poigai-logo-mark.png` is a circular, transparent-background crop of the same
  artwork generated for use in the header/footer/admin chrome, so it doesn't show as a
  mismatched rectangle — the design itself is unchanged.
- Product cards, photos and prices are demo placeholders until you connect Supabase and
  add your real products from `/admin`.
- WhatsApp enquiry buttons work after the real number is configured (either in `.env`
  for preview mode, or in the admin Site Settings once Supabase is live).

## Deploying
This is a single-page app with client-side routes (`/`, `/admin`, `/admin/*`), so your
host needs to send every URL to `index.html`:
- **Netlify**: handled by `public/_redirects`.
- **Vercel**: handled by `vercel.json`.

Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and `VITE_WHATSAPP_NUMBER` as
environment variables on your host, not just locally.
