# Connecting Supabase (admin panel backend)

The storefront works with placeholder data out of the box. Follow these steps once to
make the admin panel live, so products, stock, offers and site text are managed from
`/admin` instead of hardcoded in the code.

## 1. Create a Supabase project
1. Go to https://supabase.com, sign in, and click **New project**.
2. Pick any name/region and a database password (save it somewhere safe — you won't
   need it for this app, but Supabase asks for it).
3. Wait for the project to finish provisioning (about a minute).

## 2. Run the schema
1. In your project, open **SQL Editor** -> **New query**.
2. Open `supabase/schema.sql` from this repo, copy the whole file, paste it into the
   editor, and click **Run**.
3. This creates the `categories`, `products` and `site_settings` tables, a public
   `product-images` storage bucket, and the access rules (public can read, only a
   signed-in admin can write).

## 3. Create your admin login
1. Go to **Authentication** -> **Users** -> **Add user**.
2. Enter the email and password you (the shop owner) will sign in with at `/admin`.
3. Tick **Auto Confirm User** so you don't need to click an email link.

This is the only account that can sign in to `/admin` — there's no public sign-up.

## 4. Copy your API keys
1. Go to **Project Settings** -> **API**.
2. Copy the **Project URL** and the **anon / public** key (not the `service_role` key
   — that one must never be used in frontend code).

## 5. Add them to your project
1. Copy `.env.example` to `.env` if you haven't already.
2. Fill in:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
3. Restart `npm run dev` (env vars are only read on startup).

## 6. Sign in and add your products
1. Visit `http://localhost:5173/admin` (or your deployed URL + `/admin`).
2. Sign in with the admin account you created in step 3.
3. Add your categories, then your real products — name, price, offer price, stock,
   label, description and photos (uploaded straight to Supabase Storage).
4. The storefront updates immediately — no code changes or redeploys needed.

## Deploying
Since this is a single-page app with client-side routes (`/`, `/admin`, `/admin/*`),
your host needs to send every URL to `index.html` so refreshing `/admin` doesn't 404:
- **Netlify**: already handled by `public/_redirects` in this repo.
- **Vercel**: already handled by `vercel.json` in this repo.
- Any other static host: look for an equivalent "SPA fallback" / "rewrite all routes
  to index.html" setting.

Remember to add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and
`VITE_WHATSAPP_NUMBER` as environment variables on your host too, not just locally.
