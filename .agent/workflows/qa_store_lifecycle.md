---
description: Comprehensive QA Lifecycle for Store Management and Map UI Verification
---

# Store Lifecycle QA & UI Verification Workflow

This workflow outlines the steps to verify the end-to-end lifecycle of a store (Submission -> Approval -> Display) and audit the critical UI components of the Map and Store Card.

## Prerequisites
- Server running on `localhost:5001`.
- Admin credentials (default: `password: admin`).

## Phase 1: Store Submission (User Role)
1. **Navigate**: Go to `/map`.
2. **Action**: Click "Add Location" (Top right or sidebar CTA).
3. **Fill Form**:
   - **Name**: "Kyiv Artisanal Boutique"
   - **Address**: "2306 Bloor St W, Toronto, ON" (Select from autocomplete)
   - **Category**: "Retail" or "Gifts"
   - **Description**: "Authentic handmade goods."
   - **Products**: "Embroidered Shirts, Ceramic Plates, Honey, Beeswax Candles, Wool Socks, Wooden Toys, Linen Tablecloths, Herbal Tea, Painted Eggs, Leather Journals"
   - **Contact**: `test@example.com` / `https://example.com`
4. **Submit**: Confirm "Successfully Added" message.

## Phase 2: Administrative Approval (Admin Role)
1. **Navigate**: Go to `/admin/login`.
2. **Login**: Password `admin`.
3. **Dashboard**: Navigate to `/admin/dashboard`.
4. **Approve**: Locate "Kyiv Artisanal Boutique" in Pending list and click **Approve** (Checkmark icon).
5. **Verify**: Ensure status changes to "Live".

## Phase 3: Visual & Interaction Audit (Map)
1. **Navigate**: Go to `/map`.
2. **Locate**: Find "Kyiv Artisanal Boutique" (List or Map).
3. **Open Card**: Click the store to open the **Store Card**.
4. **Verify Standards**:
   - **Product Gallery**: Horizontal scrolling pills (Momentum scroll, hidden scrollbars).
   - **Tertiary Buttons**: Hover "Copy address" & "See on Map".
     - *Expected*: No stroke, soft `bg-slate-50` feedback.
   - **Spatial Pivot**: Click "See on Map".
     - *Expected*: Map zooms (`flyTo`) to Level 14.5, centers pin, 800ms duration.
   - **Linguistic Ingot**: Toggle `[ EN | UA ]`.
     - *Expected*: One-click slider, Graphite (`bg-slate-900`) active state, no blue.

## Phase 4: Typography & Ticker Audit
1. **Hero**: Check Main Heading tracking (`tracking-[-0.03em]`).
2. **Ticker**: Scroll to "Recently Added Findings".
   - **Identity**: Check for 10px Split Blue/Yellow dots before store names.
   - **Physics**: Hover over ticker.
     - *Expected*: Animation pauses. Store name becomes darker (`text-black`).

## Troubleshooting
- If Server crashes on "Add Location", check `map-explorer.tsx` for malformed JSX.
- If Map tiles don't load, check internet connection (OSM requires it).
