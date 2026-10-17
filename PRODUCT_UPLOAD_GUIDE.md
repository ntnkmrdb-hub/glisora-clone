# GLISORA — SHOPIFY PRODUCT & CATALOG MANAGEMENT GUIDE

This guide provides step-by-step instructions for managing **GLISORA's** luxury Indian fashion catalog in the Shopify Admin. Following these guidelines ensures that all garments, silk sarees, bandhgalas, and anarkalis synchronize flawlessly with the headless Next.js storefront.

---

## 1. SHOPIFY ADMIN ACCESS & STORE SETUP

1. Log into your store at `https://admin.shopify.com/store/<your-store-handle>`.
2. Confirm your store's default currency is set to **Indian Rupee (INR ₹)**:
   - Go to **Settings** → **Store details** → **Store currency**.
   - Select **Indian Rupee (INR)**.
3. Verify your Headless Sales Channel is installed:
   - Go to **Settings** → **Apps and sales channels** → **Develop apps** (or **Headless**).
   - Ensure the Headless Storefront app has access to **Product listings**, **Inventory**, and **Cart**.

---

## 2. HOW TO ADD A NEW LUXURY APPAREL PRODUCT

Navigate to **Shopify Admin** → **Products** → Click **Add product**.

### A. Title & Brand Naming
- Use descriptive, editorial titles that highlight the fabric weave and craft.
- **Examples**:
  - *Varanasi Pure Katan Silk Banarasi Saree*
  - *Heritage Raw Silk Bandhgala Jodhpuri Suit*
  - *Chanderi Hand-Embroidered Zardozi Anarkali Suit*
  - *Kids Handcrafted Silk Brocade Sherwani Set*

### B. Product Description (HTML & Storytelling)
Structure the description into three editorial sections:
1. **The Silhouette Story**: 2–3 sentences on the occasion, embroidery (e.g. Dabka, Zardozi, Kadhwa Zari), and inspiration.
2. **Fabric & Artisanal Details** (Bullet points):
   - Shell Fabric (e.g., *100% Pure Katan Silk* or *Pure Chanderi Handloom*)
   - Lining (*100% Breathable Organic Cotton Mulmul*)
   - Embroidery (*Hand-embroidered metallic antique gold zari*)
   - Inclusions (*Includes matching 80cm unstitched blouse piece*)
3. **Garment Care**:
   - Always state: *Professional Dry Clean Only. Store in archival muslin bag.*

### C. Media & Campaign Photography
- **Resolution**: High resolution (minimum `1200 x 1600 px`, 3:4 aspect ratio).
- **Campaign Shots**:
  - **Image 1 (Primary)**: Full-length editorial front view.
  - **Image 2 (Secondary)**: Close-up macro view of embroidery, zari threadwork, or button craft.
  - **Image 3**: Back or side drape view.
- **Alt Text (Crucial for Luxury SEO)**:
  - Click on each uploaded photo → **Edit alt text**.
  - Enter descriptive keywords (e.g., *"GLISORA Varanasi Pure Katan Silk Banarasi Saree in Royal Wine with Gold Zari"*).

---

## 3. PRICING & GST COMPLIANCE IN INDIA

1. **Price (INR ₹)**: Enter the retail selling price (e.g., `28500`).
2. **Compare-at Price (INR ₹)**:
   - For regular items: leave blank.
   - For inaugural capsule or festive pricing: enter the original higher price (e.g., `34000`).
   - The GLISORA storefront automatically calculates and displays the exact discount percentage badge (e.g., `16% Off`).
3. **Taxes**: Ensure **"Charge tax on this product"** is checked (GST in India for apparel is typically 5% or 12% depending on value).
4. **Cost per item**: Enter internal fabrication cost for margin reporting (kept private from patrons).

---

## 4. CREATING VARIANTS (SIZES & COLORWAYS)

GLISORA garments require standardized options to enable responsive filtering and the Imperial Size Guide.

### Step 1: Add Color Option
- Option name: `Color`
- Option values:
  - `Pristine Ivory`
  - `Champagne Gold`
  - `Royal Wine`
  - `Onyx Black`
  - `Blush Rose`
  - `Imperial Navy`

### Step 2: Add Size Option
- **Women's Pret & Couture**: `XS`, `S`, `M`, `L`, `XL`, `XXL`
- **Sarees**: `Free Size (6.3m)`
- **Men's Bandhgalas & Suits**: `38 (S)`, `40 (M)`, `42 (L)`, `44 (XL)`, `46 (XXL)`
- **Kids' Festive**: `2-3 Y`, `4-5 Y`, `6-7 Y`, `8-9 Y`, `10-11 Y`

### Step 3: Configure SKUs & Inventory
Assign structured SKUs to track items in fulfillment:
- Format: `GLIS-[GENDER]-[CATEGORY]-[CODE]-[SIZE]-[COLOR]`
- Example: `GLIS-WMN-SAR-01-FS-WNE`
- Enter the exact inventory quantity for each variant.
- If a variant is made-to-measure, set inventory policy to **"Continue selling when out of stock"**.

---

## 5. TAGS & ATTRIBUTES

Tags control category filtering, search facets, and related product algorithms on the storefront:

| Attribute Category | Recommended Tags |
| :--- | :--- |
| **Department** | `Women`, `Men`, `Kids` |
| **Silhouette** | `Saree`, `Anarkali`, `Lehenga`, `Bandhgala`, `Sherwani`, `Kurta` |
| **Fabric** | `Silk`, `Katan Silk`, `Chanderi`, `Velvet`, `Cotton Mulmul`, `Organza` |
| **Occasion** | `Festive`, `Wedding`, `Sangeet`, `Bespoke`, `Everyday Luxury` |
| **Collections** | `New Arrivals`, `Bestsellers` |

---

## 6. ORGANIZING COLLECTIONS

In Shopify Admin → **Products** → **Collections**, verify the following collection handles:

| Collection Title | Handle (Exact) | Purpose |
| :--- | :--- | :--- |
| Women’s Couture & Sarees | `women` | Main women's portal |
| Men’s Heritage & Tailoring | `men` | Main men's portal |
| Kids’ Festive Luxe | `kids` | Main junior portal |
| New Arrivals: The Festive Capsule | `new-arrivals` | Seasonal new releases |
| GLISORA Bestsellers | `bestsellers` | Signature iconic pieces |

> [!IMPORTANT]
> Keep collection handles in lowercase alphanumeric with hyphens. The Next.js dynamic route `/collections/[handle]` matches these handles directly.

---

## 7. PUBLISHING TO HEADLESS STOREFRONT

In the product editor's right sidebar (**Publishing** / **Sales channels**):
1. Check **Headless** (or your custom Storefront sales channel).
2. Set product status to **Active**.
3. Click **Save**.
4. The product will reflect immediately across the GLISORA storefront.
