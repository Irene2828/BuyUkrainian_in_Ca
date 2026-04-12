# BuyUkrainian.ca 🇺🇦🇨🇦

**Find and share Ukrainian products sold across Canada**

A community-driven platform connecting Ukrainian businesses with Canadian customers. Discover local stores, contribute new locations, and support Ukraine's economy through everyday purchases.

---

## 🎨 Obsidian Design System

This project implements the **Obsidian Design System** - a premium, mathematically-aligned UI framework focused on vertical rhythm, golden gutter alignment, and cinematic motion.

### Core Principles

#### 1. **Vertical Rhythm** (The Ritual Gap)
Every major section MUST have a **128px (py-32)** desktop / **80px (py-20)** mobile vertical buffer.

```tsx
<section className="py-20 md:py-32">
  <!-- Content -->
</section>
```

**Why**: Creates consistent breathing room and premium spacing throughout the application.

---

#### 2. **The Golden Gutter**
All content sections (except Map/Admin) MUST be constrained to **max-w-7xl** with **px-6 lg:px-12**.

```tsx
<div className="max-w-7xl mx-auto px-6 lg:px-12">
  <!-- Content -->
</div>
```

**Why**: Ensures perfect vertical alignment from header to footer - all content starts at the same horizontal pixel.

**Exception**: Map and Admin pages use wider canvas (`max-w-[1440px]`) for immersive professional tools.

---

#### 3. **Interaction Finish** (32px Radius)
All buttons, inputs, and chips MUST use **32px (rounded-[32px])** or **infinite (rounded-full)** radius.

```tsx
<button className="rounded-full">Primary CTA</button>
<button className="rounded-[32px]">Secondary</button>
```

**Why**: Creates consistent pill shapes and premium tactile feel.

---

#### 4. **Hover Language** (Soft Gray, No Black Strokes)
No hard black strokes on hover; use only **soft background lifts** and **refined gray rings**.

```tsx
<button className="hover:bg-gray-50 focus:ring-1 focus:ring-gray-200">
  Premium Interaction
</button>
```

**Why**: Prevents harsh browser defaults and maintains sophisticated interaction design.

---

### The Map "Canvas" Exception

#### Constraint Exemption
The Map and Admin views are **exempt from max-w-7xl** to maintain a professional, immersive "Wide Canvas".

```tsx
// Map container
<div className="max-w-[1440px] mx-auto px-6 lg:px-8">
  <!-- Map + Sidebar -->
</div>
```

#### Default Viewport (FROZEN)
The Map MUST load at **center: [44.5, -78.5]** and **zoom: 5.5** to prioritize the Montreal-Toronto corridor.

```typescript
const INITIAL_MAP_STATE = {
  center: [44.5, -78.5], // Toronto-Montreal-Ottawa Triangle
  zoom: 5.5
} as const;
```

**Why**: Maximum cluster visibility - both Toronto (24 stores) and Montreal (8 stores) visible immediately without scrolling.

---

## ✅ Mandatory Verification Checklist

Before any deployment or major update, verify:

### Design System Compliance
- [ ] **Golden Gutter**: All sections use `max-w-7xl mx-auto px-6 lg:px-12`
- [ ] **Vertical Rhythm**: All sections use `py-20 md:py-32`
- [ ] **Button Radius**: All buttons use `rounded-full` or `rounded-[32px]`
- [ ] **Hover States**: No black borders anywhere - soft gray only

### Map Functionality
- [ ] **Viewport**: Map loads at `[44.5, -78.5]` zoom `5.5`
- [ ] **Montreal Cluster**: 8-pin cluster visible immediately
- [ ] **Toronto Cluster**: 24-pin cluster visible immediately
- [ ] **No Scrolling**: Both major clusters in frame on first load

### Content Visibility
- [ ] **How It Works**: 3 cards with icons and illustrations visible
- [ ] **Images**: All `howItWorks` images load correctly (no 404s)
- [ ] **Icons**: Lucide icons render without black fill bug
- [ ] **Typography**: Clear hierarchy (heading → subheading → CTA)

### Interaction Polish
- [ ] **Province Filter**: FREE of black borders on focus
- [ ] **All Inputs**: Soft gray focus rings (`ring-gray-200`)
- [ ] **Scroll Animation**: Page fades in smoothly with 0.8s custom curve
- [ ] **Stagger Effect**: How It Works cards animate with 0.1s delay each

### Performance
- [ ] **Console**: No errors (CSS warnings OK - Tailwind v4)
- [ ] **Lighthouse CLS**: 0 (no layout shift)
- [ ] **Animation**: Smooth 60fps scroll reveals
- [ ] **Load Time**: Fast initial render

**Full Checklist**: See `OBSIDIAN_QA_CHECKLIST.md` for complete verification protocol

---

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Navigate to `http://localhost:5001`

### Environment Variables

Create a `.env` or `.env.local` file:

```env
DATABASE_URL="your_supabase_connection_string"
DIRECT_URL="your_direct_connection_string"
VITE_GOOGLE_MAPS_API_KEY="your_google_maps_browser_key"
```

For Vercel deployments, set `VITE_GOOGLE_MAPS_API_KEY` in Project Settings > Environment Variables for every environment you deploy from, then redeploy so Vite can inline it into the client bundle.

---

## 📁 Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── header.tsx              # Golden Gutter ✓
│   │   ├── hero.tsx                # Vertical Rhythm ✓
│   │   ├── how-it-works.tsx        # Stagger Animation ✓
│   │   ├── faq.tsx                 # Golden Gutter ✓
│   │   ├── spread-the-word.tsx     # Ritual Gap ✓
│   │   ├── pre-footer.tsx          # Golden Gutter ✓
│   │   ├── footer.tsx              # Golden Gutter ✓
│   │   ├── interactive-map.tsx     # Canvas Exception ✓
│   │   └── map-explorer.tsx        # Wide Canvas ✓
│   ├── hooks/
│   │   └── use-scroll-reveal.ts    # Motion System ✓
│   ├── index.css                   # Obsidian Tokens ✓
│   └── pages/
│       ├── home.tsx                # Section Reveals ✓
│       └── map.tsx                 # Map Canvas ✓
├── DESIGN_SYSTEM_LOCK.json         # System Specification
├── OBSIDIAN_QA_CHECKLIST.md        # QA Protocol
└── OBSIDIAN_FINAL_IMPLEMENTATION.md # Complete Summary
```

---

## 🎬 Motion System

### Scroll Reveal Animation

**Specs**:
- **Initial**: `opacity: 0`, `translateY(20px)`
- **Final**: `opacity: 1`, `translateY(0)`
- **Duration**: `0.8s`
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (silk-smooth deceleration)
- **Viewport**: Once (no re-trigger on scroll-up)

**Stagger Effect**:
- Cards in "How It Works" animate with **0.1s delay** per item
- Creates sophisticated horizontal "wave" effect

---

## 🎨 Design Tokens

### Spacing (CSS Custom Properties)

```css
--gap-obsidian-ritual: 128px;         /* Desktop section gap */
--gap-obsidian-ritual-mobile: 80px;   /* Mobile section gap */
--gap-obsidian-breath: 64px;          /* Header to content */
--gap-obsidian-action: 40px;          /* Subheading to CTA */
--gap-obsidian-proximity: 24px;       /* Heading to subheading */
--gutter-obsidian-x-mobile: 24px;     /* px-6 */
--gutter-obsidian-x-desktop: 48px;    /* lg:px-12 */
--gutter-obsidian-max-width: 1280px;  /* max-w-7xl */
```

### Utility Classes

```css
.obsidian-section              /* py-20 md:py-32 */
.obsidian-container            /* max-w-7xl mx-auto px-6 lg:px-12 */
.obsidian-section-container    /* Combined section + container */
.obsidian-breath               /* mb-16 (64px) */
.premium-focus                 /* Soft gray focus ring */
```

---

## 🗺️ Map Configuration

### Frozen Viewport
- **Center**: `[44.5, -78.5]` (Toronto-Montreal-Ottawa Triangle)
- **Zoom**: `5.5`
- **Locked**: `INITIAL_MAP_STATE` const in `interactive-map.tsx`

### Why These Coordinates?
- Geometric center between Toronto and Montreal
- Both major store clusters (24 + 8 pins) immediately visible
- No manual dragging required
- Optimized for Canadian population centers

---

## 🛠️ Tech Stack

- **Framework**: React + Wouter (routing)
- **Styling**: Tailwind CSS v4 + Custom CSS
- **Map**: Leaflet + MarkerCluster
- **Icons**: Lucide React
- **Backend**: Express + Supabase
- **Build**: Vite

---

## 📚 Documentation

- **DESIGN_SYSTEM_LOCK.json** - Complete system specification
- **OBSIDIAN_QA_CHECKLIST.md** - Mandatory verification protocol
- **OBSIDIAN_FINAL_IMPLEMENTATION.md** - Implementation summary
- **NUMERIC_DESIGN_EXTRACTION.md** - Detailed metrics
- **GLOBAL_FRAME_CALIBRATION.md** - Alignment verification

---

## 🐛 Troubleshooting

### Black borders appearing on focus
**Solution**: Verify phantom stroke prevention in `index.css @layer base`

### Map not centered correctly
**Solution**: Check `INITIAL_MAP_STATE` is `[44.5, -78.5]` zoom `5.5`

### How It Works cards not visible
**Solution**: Verify scroll reveal hook observes `.stagger-container`

### Layout shift during scroll
**Solution**: Check `will-change: opacity, transform` on animated elements

---

## 🤝 Contributing

When adding new sections:

```tsx
// Use this template
<section className="obsidian-section-container">
  <div className="obsidian-breath">
    <h2>Section Title</h2>
    <p>Subtext</p>
  </div>
  <!-- Content -->
</section>
```

**Always verify** against `OBSIDIAN_QA_CHECKLIST.md` before submitting PR.

---

## 📄 License

MIT

---

## 🇺🇦 Support Ukraine

Every purchase through this platform supports Ukraine's economy. Share the map, discover local stores, and help grow the community.

**Slava Ukraini!** 🇺🇦🇨🇦
