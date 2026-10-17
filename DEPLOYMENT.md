# GLISORA — VERCEL & PRODUCTION DEPLOYMENT GUIDE

This document details the complete deployment workflow for launching **GLISORA** on **Vercel** with GitHub version control, custom domain routing, SSL certificate generation, and Shopify headless synchronization.

---

## 1. PREREQUISITES & ARCHITECTURE

- **Frontend**: Next.js 16 App Router on Vercel Edge/Serverless Infrastructure.
- **Backend & Commerce**: Shopify Storefront API (GraphQL).
- **Checkout & Payments**: Shopify-hosted checkout on `checkout.glisora.com` or `glisora.myshopify.com`.
- **Repository**: GitHub (Private or Public repository).

---

## 2. STEP 1: INITIALIZE GIT & PUSH TO GITHUB

Run the following commands in Windows PowerShell inside `C:\Users\krish\.gemini\antigravity\scratch\glisora-luxury-fashion`:

```powershell
# 1. Initialize git (if not already initialized)
git init

# 2. Check status and ensure .env.local is ignored
git status

# 3. Add all files
git add .

# 4. Commit code
git commit -m "feat: complete GLISORA luxury Indian fashion storefront"

# 5. Link to your GitHub repository
git remote add origin https://github.com/<your-username>/glisora-luxury-fashion.git
git branch -M main

# 6. Push to GitHub
git push -u origin main
```

---

## 3. STEP 2: IMPORT PROJECT INTO VERCEL

1. Visit [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New** → **Project**.
3. Locate `glisora-luxury-fashion` in the repository list and click **Import**.
4. **Framework Preset**: Ensure **Next.js** is selected.
5. **Root Directory**: `./` (Default).

---

## 4. STEP 3: CONFIGURE PRODUCTION ENVIRONMENT VARIABLES

In the **Environment Variables** section of the Vercel project creation screen, add the following variables:

| Variable Name | Environment | Value Description |
| :--- | :--- | :--- |
| `SHOPIFY_STORE_DOMAIN` | Production, Preview | Your store handle (e.g., `glisora-luxury.myshopify.com`) |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Production, Preview | Storefront API token from Shopify Admin |
| `SHOPIFY_API_VERSION` | Production, Preview | `2025-01` |
| `NEXT_PUBLIC_SITE_URL` | Production | `https://www.glisora.com` |

Click **Deploy**. Vercel will build the project using Next.js Turbopack and deploy to a `*.vercel.app` preview URL.

---

## 5. STEP 4: CUSTOM DOMAIN & DNS CONFIGURATION

To connect your custom branded domain (e.g., `glisora.com` and `www.glisora.com`):

1. In your Vercel project dashboard, go to **Settings** → **Domains**.
2. Enter `glisora.com` and click **Add**.
3. Select the recommended option: **Redirect glisora.com to www.glisora.com** (or vice versa).
4. Vercel will provide required DNS records:

### DNS Records to add at your Domain Registrar (GoDaddy, Namecheap, Cloudflare, etc.):

| Type | Name / Host | Value / Target | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `76.76.21.21` | Automatic / 300 |
| **CNAME** | `www` | `cname.vercel-dns.com.` | Automatic / 300 |

5. Once DNS propagates (typically 5–30 minutes), Vercel automatically provisions a free, auto-renewing **Let's Encrypt Wildcard SSL/TLS certificate**.

---

## 6. STEP 5: SHOPIFY HEADLESS DOMAIN CONFIGURATION

To provide patrons with a consistent luxury brand experience between the storefront and checkout:

1. In **Shopify Admin** → **Settings** → **Domains**.
2. Add a dedicated subdomain for the checkout: `checkout.glisora.com`.
3. Add the corresponding CNAME record at your DNS provider pointing `checkout` to `shops.myshopify.com`.
4. In your Shopify Headless app settings, verify that checkout redirects are authorized for `https://www.glisora.com`.

---

## 7. STEP 6: POST-DEPLOYMENT SMOKE TESTS

Execute the following end-to-end checks on the live production URL:

1. **Homepage Loading**: Verify hero imagery, typography rendering, and announcement bar.
2. **Collection Routing**: Open `/collections/women` and `/collections/men`; verify filters for size and color.
3. **Product Details**: Open any product, test image zoom, switch variants, and check size guide modal.
4. **Cart Drawer**: Add an item to bag, adjust quantities, verify free shipping progress bar.
5. **Checkout Redirection**: Click "Proceed to Secure Checkout" and verify redirection to the official Shopify checkout with line items and pricing intact.
6. **Mobile Navigation**: Test on mobile viewports for drawer responsiveness and tap targets.
7. **SEO & Indexing**: Inspect `/sitemap.xml` and `/robots.txt`.

---

## 8. ROLLBACK & INCIDENT RECOVERY

If an issue occurs after a release:
1. In the Vercel Dashboard → **Deployments**.
2. Locate the previous healthy deployment.
3. Click the three dots (`...`) → **Instant Rollback**.
4. Traffic is immediately rerouted to the previous stable build within seconds without downtime.
