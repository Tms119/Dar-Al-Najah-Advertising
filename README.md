# Dar Al Najah Advertising — Website

Printing-company website with a live product catalogue and an admin dashboard.

- **Live site:** https://daralnajah.vercel.app
- **Admin:** https://daralnajah.vercel.app/admin
- **Stack:** Next.js 16 (React 19) · Convex (database, file storage, auth) · Vercel hosting

## How it fits together

| Piece | Where |
|---|---|
| Public pages (home, catalogue, product, contact) | `web/src/app/(site)/` |
| Admin dashboard | `web/src/app/admin/` + `web/src/components/admin/` |
| Database tables | `web/convex/schema.ts` |
| Public live queries (menu, catalogue, product) | `web/convex/catalog.ts` |
| Admin-only functions | `web/convex/admin.ts` (every one checks `requireAdmin`) |
| Quote form (validated + rate-limited) | `web/convex/quotes.ts` |
| Admin login | `web/convex/auth.ts`, `web/src/lib/`, `web/src/proxy.js` |
| Starter catalogue (used once to seed) | `web/convex/seedData.ts` |
| Business details (phone, WhatsApp, email) | `web/src/data/site.js` |

**Menu ↔ products are linked.** The header mega-menu, mobile menu, footer, home page and catalogue all read one live Convex query. Adding, editing, hiding or deleting a product in the admin updates every open page within a second, with no redeploy needed.

## Photos vs illustrations

Every product and category has an illustrated placeholder. Upload photos in the admin to replace it:
- **Products:** Admin → Products → Edit → Photos. The first photo is the main one. "Use illustration instead" switches back.
- **Categories:** Admin → Menu & categories → Edit → Photo. The photo shows in the mega-menu and on the home page service cards.

Photos are served through Next.js image optimization (resized, AVIF/WebP, lazy-loaded).

## Performance

- **First-visit loader:** pure CSS. It plays once per browser session and is skipped for reduced-motion users and in the admin.
- **Lite mode:** devices with 4 or fewer CPU cores or 4 GB or less RAM, data-saver, or reduced motion. These get the same site without the decorative floating motion, background blur or heavy shadows. The flag is set before first paint by the boot script in `src/app/layout.js`.
- **Animations:** only `transform` and `opacity` are animated. Looping animations pause while off-screen, and below-the-fold sections use `content-visibility`.
- **Monitoring:** Vercel Web Analytics is on. Speed Insights is reporting on the free tier.

## Admin access (internal only)

Sign-in is **username + password**, with **no public sign-up**. The sign-up function isn't deployed at all, so nobody can create an account from the website or by calling Convex directly.

Ways to get an account:
1. **Admin → Team.** A signed-in admin creates staff accounts, removes them and changes their own password. Removing an account cuts off access immediately, including any open sessions.
2. **CLI**, for the very first owner account on a fresh database:
   ```bash
   cd web
   npx convex run team:bootstrapAdmin '{"username":"owner","password":"<min 10 chars>"}' --prod
   ```

Admin rights are granted to accounts created through Team or the bootstrap command, and to any username in the `ADMIN_USERNAMES` Convex env var (`npx convex env set ADMIN_USERNAMES "owner" --prod`).

Audit every account:
```bash
npx convex run team:auditAccounts --prod
```

A demo admin `demoadmin` exists on the live site. Its password is in `web/.env.local` (`PROD_DEMO_ADMIN_*`), which is git-ignored. Before launch:
1. Sign in as `demoadmin`.
2. Create your own account under **Team**, then sign in as yourself.
3. Remove `demoadmin` under **Team**.
4. Run `npx convex env set ADMIN_USERNAMES "" --prod`.

## Local development

```bash
cd web
npm install
npx convex dev        # terminal 1: syncs convex/ to the dev database
npm run dev           # terminal 2: http://localhost:3000
```

## Deploying

- **Website:** push to `main`. Vercel builds automatically (Root Directory = `web`).
- **Database code** (anything in `web/convex/`): run `npx convex deploy` from `web/`.
  - Optional, to automate this: create a production deploy key in the Convex dashboard, add it to Vercel as `CONVEX_DEPLOY_KEY`, and set the Vercel build command to `npx convex deploy --cmd 'npm run build'`.

Vercel environment variables (Production + Preview): `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`, `NEXT_PUBLIC_SITE_URL`.

## Security

- No public sign-up: the sign-up function isn't deployed. Accounts are created only by admins (Team) or the CLI.
- Admin functions reject anyone who isn't signed in and an admin. Tested: logged out → "Not signed in"; signed-in non-admin → "Not authorized"; removed account → "Not authorized" even with a live session.
- Sign-in shows the same message for an unknown username and a wrong password, and the auth component rate-limits attempts.
- The session refresh token lives in an httpOnly, Secure cookie. `/admin/*` is guarded by `proxy.js`, marked `noindex`, and not cached.
- Every input is validated server-side (lengths, slugs, prices, colours, tier and option limits).
- The quote form is rate-limited (site-wide + per email) and has a honeypot field.
- Uploaded photos must be images under 8 MB. Removed photos are deleted from storage.
- Security headers: CSP, `X-Frame-Options: DENY`, HSTS, `nosniff`, a strict referrer policy and a permissions policy.

## Before launch (placeholders to replace)

- Phone, WhatsApp, email, address and hours in `web/src/data/site.js`
- Prices and turnaround times (edit them in the admin)
- Testimonials and stats on the home page (`web/src/app/(site)/page.js`)
- Product photos (upload them in the admin; until then each product shows an illustration)
- A custom domain in Vercel, then update `NEXT_PUBLIC_SITE_URL`

See `PRODUCTS.md` for the full catalogue and data model.
