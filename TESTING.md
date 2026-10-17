# GLISORA — QUALITY ASSURANCE & TESTING SPECIFICATION

This document outlines the testing strategy, test coverage, and validation procedures implemented across the **GLISORA** luxury fashion platform.

---

## 1. TEST FRAMEWORK & SUITE ARCHITECTURE

The project utilizes **Vitest** with **JSDOM** and **React Testing Library** for lightning-fast, zero-overhead unit and integration tests.

### Test Configuration:
- Config: `vitest.config.mts`
- Environment: `jsdom`
- Path Aliases: `@/*` → `./src/*`
- Setup file: `tests/setup.ts` (`@testing-library/jest-dom`)

---

## 2. TEST SPECIFICATIONS & RESULTS

All 21 automated tests pass cleanly with 100% success rate:

```
 RUN  v5.0.5
 ✓ tests/utils.test.ts (9 tests)
 ✓ tests/cart.test.ts (4 tests)
 ✓ tests/products.test.ts (6 tests)
 ✓ tests/env.test.ts (2 tests)

Test Files  4 passed (4)
Tests       21 passed (21)
```

### A. Currency Formatting & Business Logic (`tests/utils.test.ts`)
- **`formatINR` (Indian Rupee Formatter)**:
  - Formats monetary values with official `₹` currency symbol.
  - Correctly calculates and applies Indian numbering commas (Lakhs/Thousands, e.g. `₹1,25,000`).
  - Gracefully handles string numbers, zeros, null, and undefined without throwing runtime errors.
- **`calculateDiscountPercentage`**:
  - Compares retail price against compare-at price to derive integer percentage off (e.g., `34000` vs `28500` -> `16%`).
  - Returns `null` when compare-at price is lower or absent.
- **`getFreeShippingProgress`**:
  - Validates threshold of ₹2,999 for Pan-India express delivery.
  - Verifies dynamic progress bar percentage and remaining amount calculation.

### B. Environment & Security Validation (`tests/env.test.ts`)
- Validates Zod schema parsing for Storefront domain, token, and API version.
- Tests `isShopifyConfigured()` to ensure placeholder credentials safely trigger the high-fidelity mock layer without leaking raw API calls or crashing.

### C. Cart Operations (`tests/cart.test.ts`)
- Validates initial cart creation with merchandise variants.
- Verifies line item quantity updates, removal, and live subtotal calculations.
- Tests authoritative checkout URL generation for handoff to Shopify checkout.

### D. Catalog & Collection Service (`tests/products.test.ts`)
- Tests product resolution by handle (`getProductByHandle`).
- Tests collection resolution and filtering by tags (`getCollectionByHandle`).
- Tests keyword search query parsing and multi-attribute matching (`searchProducts`).
- Tests related products scoring algorithm excluding current handle.

---

## 3. HOW TO RUN TESTS IN WINDOWS POWERSHELL

Open Windows PowerShell in the project directory:

```powershell
# 1. Run all unit and integration tests once
npm.cmd run test

# 2. Run tests in interactive watch mode during development
npm.cmd run test:watch

# 3. Execute TypeScript typecheck and ESLint
npm.cmd run lint

# 4. Execute production build verification
npm.cmd run build
```

---

## 4. INTEGRATION TESTING WITH LIVE SHOPIFY STOREFRONT

When live Shopify Storefront credentials are added to `.env.local`:
1. `isShopifyConfigured()` detects non-placeholder domain and storefront access token.
2. Storefront requests immediately query `https://<your-store>.myshopify.com/api/2025-01/graphql.json`.
3. To verify live integration:
   - Check that live products created in Shopify Admin appear on `/collections/women`.
   - Verify adding a live product variant creates a Shopify Cart with a live `gid://shopify/Cart/...` ID.
   - Click "Proceed to Secure Checkout" to verify seamless handoff to your live Shopify checkout domain.
