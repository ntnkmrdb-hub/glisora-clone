# GLISORA — Indian Luxury Fashion Storefront
### *Comfort. Style. Everyday.*

GLISORA is a modern, production-oriented Indian luxury fashion e-commerce platform. Built with **Next.js 16 App Router**, **TypeScript (Strict Mode)**, **Tailwind CSS v4**, and **Shopify Storefront API (GraphQL)**, it delivers an editorial shopping experience celebrating authentic Indian handlooms, pure Katan silks, zardozi anarkalis, bespoke bandhgalas, and festive ensembles.

---

## 1. BRAND IDENTITY & DESIGN SYSTEM

- **Brand**: GLISORA
- **Tagline**: *Comfort. Style. Everyday.*
- **Market**: India (with PAN-India insured express delivery)
- **Currency**: Indian Rupee (`INR ₹`), formatted with standard Indian commas (Lakhs/Thousands)
- **Palette**:
  - Pure & Soft Ivory (`#FAF8F5`, `#F4EFEA`)
  - Onyx & Deep Charcoal (`#111111`, `#1A1918`)
  - Champagne Gold (`#C5A880`, `#D4AF37`)
  - Subtle Royal Wine / Burgundy (`#5A1827`)
- **Typography**:
  - Editorial Serif for Headlines: *Playfair Display*
  - Refined Sans-Serif for Body & UI: *Plus Jakarta Sans*

---

## 2. TECHNOLOGY STACK

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript 5 (Strict Mode enabled)
- **Styling**: Tailwind CSS v4 with custom luxury design tokens
- **E-Commerce Engine**: Shopify Storefront API (GraphQL, 2025-01)
- **Checkout**: Authoritative Shopify-Hosted Checkout (`checkout.glisora.com`)
- **Indian Payments**: UPI Intent / QR / VPA (Google Pay, PhonePe, Paytm, BHIM), RuPay, Visa, Mastercard, NetBanking (via Razorpay or Cashfree for Shopify)
- **Validation**: Zod (Environment variables & Cart payload validation)
- **Testing**: Vitest 5 + JSDOM + React Testing Library (21 automated unit tests)
- **Icons**: Lucide React
- **Deployment Target**: Vercel

---

## 3. PROJECT FILE STRUCTURE

```
glisora-luxury-fashion/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout with fonts, providers, header & footer
│   │   ├── page.tsx                      # Editorial luxury homepage
│   │   ├── globals.css                   # Tailwind v4 luxury theme tokens & typography
│   │   ├── sitemap.ts                    # Dynamic XML sitemap generator
│   │   ├── robots.ts                     # Search engine crawler policies
│   │   ├── collections/
│   │   │   └── [handle]/page.tsx         # Women, Men, Kids, New Arrivals, Bestsellers
│   │   ├── products/
│   │   │   └── [handle]/page.tsx         # Product details with JSON-LD rich snippets & zoom
│   │   ├── search/page.tsx               # Keyword search with live facet filtering
│   │   ├── cart/page.tsx                 # Dedicated shopping bag with tailoring notes
│   │   ├── wishlist/page.tsx             # Saved items vault with move-to-bag actions
│   │   ├── account/page.tsx              # Shopify Customer Accounts authentication portal
│   │   ├── orders/page.tsx               # Customer consignment & Blue Dart tracking lookup
│   │   ├── checkout/
│   │   │   ├── success/page.tsx          # Authoritative order receipt guidance
│   │   │   └── cancel/page.tsx           # Cart recovery and payment assistance
│   │   ├── pages/
│   │   │   └── [slug]/page.tsx           # Static pages (about, contact, size-guide, faqs, etc.)
│   │   └── api/
│   │       ├── cart/route.ts             # Zod-validated Cart API endpoint
│   │       └── checkout/route.ts         # Authoritative Shopify checkout URL generator
│   ├── components/
│   │   ├── layout/                       # Announcement bar, Header, Footer, Drawers
│   │   ├── home/                         # Hero banner, Categories, Festive, Brand Story
│   │   ├── products/                     # ProductCard, Gallery, Filters, SizeGuideModal
│   │   ├── cart/                         # CartPageContent, Stepper, Price breakdown
│   │   ├── wishlist/                     # WishlistPageContent
│   │   └── pages/                        # About, Contact, SizeGuide, FAQs, Policy components
│   ├── context/
│   │   ├── cart-context.tsx              # Reactive cart provider with localStorage sync
│   │   └── wishlist-context.tsx          # Wishlist state with localStorage persistence
│   ├── lib/
│   │   ├── shopify/
│   │   │   ├── client.ts                 # Storefront GraphQL fetch client
│   │   │   ├── queries.ts                # Storefront GraphQL queries & fragments
│   │   │   ├── mutations.ts              # Cart GraphQL mutations
│   │   │   ├── cart.ts                   # Cart operations (Shopify API + fallback simulator)
│   │   │   ├── products.ts               # Product fetching, filtering, and search
│   │   │   └── mock-data.ts              # Authentic Indian luxury fashion catalog
│   │   ├── validation/
│   │   │   └── env.ts                    # Zod environment variable validator
│   │   └── utils.ts                      # formatINR, discount calculation, shipping progress
│   └── types/
│       ├── index.ts                      # Navigation and filter types
│       └── shopify.ts                    # Complete Shopify GraphQL Storefront API types
├── tests/
│   ├── setup.ts                          # JSDOM & jest-dom setup
│   ├── utils.test.ts                     # formatINR and business logic tests
│   ├── cart.test.ts                      # Cart creation and subtotal tests
│   ├── products.test.ts                  # Catalog, search, and related products tests
│   └── env.test.ts                       # Environment variable validation tests
├── PRODUCT_UPLOAD_GUIDE.md               # Shopify Admin product and variant upload guide
├── PAYMENT_SETUP.md                      # India payment gateway (UPI, GPay, Cards) setup
├── DEPLOYMENT.md                         # Vercel, GitHub, and custom domain deployment guide
├── TESTING.md                            # Complete testing documentation and results
├── .env.example                          # Environment variable template
└── vitest.config.mts                     # Vitest test suite configuration
```

---

## 4. WINDOWS POWERSHELL SETUP & RUN COMMANDS

Follow these exact commands inside Windows PowerShell:

```powershell
# 1. Verify Node.js and npm versions (Requires Node >= 18.18.0)
node -v
npm.cmd -v

# 2. Navigate to project directory
Set-Location C:\Users\krish\.gemini\antigravity\scratch\glisora-luxury-fashion

# 3. Install dependencies
npm.cmd install

# 4. Configure environment variables
Copy-Item .env.example .env.local

# 5. Run automated unit tests (21 tests)
npm.cmd run test

# 6. Run ESLint code quality checks
npm.cmd run lint

# 7. Start the local development server (http://localhost:3000)
npm.cmd run dev

# 8. Create optimized production build
npm.cmd run build

# 9. Start production server locally
npm.cmd run start
```

> [!NOTE]
> On Windows PowerShell systems with restricted script execution policies, always use `npm.cmd` rather than `npm` to ensure seamless execution.

---

## 5. DUAL-MODE ARCHITECTURE: ZERO-CREDENTIAL DEMO & LIVE SHOPIFY

The platform features an intelligent dual-mode resolver:
- **Development / Evaluation Mode**:
  If `.env.local` contains placeholder values, the storefront automatically activates an authentic Indian luxury fashion catalog (Varanasi Katan silk sarees, zardozi anarkalis, raw silk bandhgalas, handcrafted kids' sherwanis) with full cart persistence, variant selectors, and Indian Rupee calculations without crashing.
- **Production / Live Shopify Mode**:
  As soon as you enter your store domain and Storefront Access Token in `.env.local`, the client executes live GraphQL queries directly against the official Shopify Storefront API.

---

## 6. COMPLETE DOCUMENTATION DIRECTORY

- [PRODUCT_UPLOAD_GUIDE.md](./PRODUCT_UPLOAD_GUIDE.md): How to add sarees, bandhgalas, variants, and collections in Shopify Admin.
- [PAYMENT_SETUP.md](./PAYMENT_SETUP.md): Step-by-step Indian payment gateway setup for UPI Intent, Dynamic QR, GPay, PhonePe, Paytm, RuPay, and Cards.
- [DEPLOYMENT.md](./DEPLOYMENT.md): Instructions for connecting GitHub, deploying to Vercel, and configuring `glisora.com` custom domains.
- [TESTING.md](./TESTING.md): Quality assurance specification, test suite results, and coverage metrics.

---

## 7. LICENSE & COPYRIGHT

© 2026 GLISORA Luxury Fashion Pvt. Ltd. All rights reserved.
Comfort. Style. Everyday.
