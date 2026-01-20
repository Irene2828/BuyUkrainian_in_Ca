# NUMERIC DESIGN EXTRACTION
**Pixel-Perfect Audit with Conflict Detection**  
*Source: HOME_PAGE_DESIGN_SPEC.md*  
*Generated: 2026-01-19*

---

## GOLDEN GUTTER SYSTEM ANALYSIS

| Section | max-width | Mobile px | Desktop px | Obsidian Status |
|---------|-----------|-----------|------------|-----------------|
| Hero | 1280px (7xl) | 24px (px-6) | 48px (lg:px-12) | ✅ MATCHED |
| Footer | 1280px (7xl) | 24px (px-6) | 48px (lg:px-12) | ✅ MATCHED |
| Marquee | 1280px (7xl) | 24px (px-6) | 48px (md:px-12) | ✅ MATCHED |
| Header | 1440px | 24px (px-6) | 48px (md:px-12) | ⚠️ DRIFT (1440px vs 1280px) |
| How It Works | 1440px | 24px (px-6) | 80px (md:px-20) | ⚠️ DRIFT (80px vs 48px) |
| FAQ | 1440px | 24px (px-6) | 80px (md:px-20) | ⚠️ DRIFT (80px vs 48px) |
| Spread the Word | 1440px | 24px (px-6) | 48px (md:px-12) | ⚠️ DRIFT (1440px vs 1280px) |
| Pre-Footer | N/A | 24px (px-6) | 80px (md:px-20) | ⚠️ DRIFT (80px vs 48px) |

**CRITICAL CONFLICTS DETECTED:**
1. Header uses 1440px instead of 1280px (7xl)
2. How It Works, FAQ, Pre-Footer use 80px (px-20) instead of 48px (lg:px-12)
3. Spread the Word uses 1440px instead of 1280px (7xl)

---

## 1. HEADER COMPONENT

### Container Lock
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Position | sticky top-0 z-50 | ✅ MATCHED |
| Max Width | 1440px | ⚠️ DRIFT (should be 1280px) |
| Padding X Mobile | 24px (px-6) | ✅ MATCHED |
| Padding X Desktop | 48px (md:px-12) | ⚠️ DRIFT (should be lg:px-12) |
| Height Mobile | 80px | ✅ MATCHED |
| Height Desktop | 100px | ✅ MATCHED |
| Background | white/80 + backdrop-blur-md | ✅ MATCHED |
| Border (scroll) | 1px border-slate-100 | ✅ MATCHED |

### Logo Typography
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Width Mobile | 100px | ✅ MATCHED |
| Width Desktop | 124px | ✅ MATCHED |
| Text Size Mobile | 12px | ✅ MATCHED |
| Text Size Desktop | 16px | ✅ MATCHED |
| Font Weight | 600 (semibold) | ✅ MATCHED |
| Letter Spacing | 0px | ✅ MATCHED |
| Color | #003E82 | ✅ MATCHED |
| Font Family | Instrument Sans | ✅ MATCHED |

### Navigation Links
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Font Size | 16px | ✅ MATCHED |
| Font Weight | 500 (medium) | ✅ MATCHED |
| Color Idle | slate-500 | ✅ MATCHED |
| Color Hover | slate-950 | ✅ MATCHED |
| Letter Spacing | -0.02em (tight) | ✅ MATCHED |
| Transition | 300ms | ✅ MATCHED |
| Gap Between | 40px (gap-10) | ✅ MATCHED |

---

## 2. HERO SECTION

### Container Lock
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Max Width | 1280px (7xl) | ✅ MATCHED |
| Padding X Mobile | 24px (px-6) | ✅ MATCHED |
| Padding X Desktop | 48px (lg:px-12) | ✅ MATCHED |
| Background | #F9FCD4 | ✅ MATCHED |
| Padding Y Mobile | 48px (py-12) | ✅ MATCHED |
| Padding Y Desktop | 0px (md:py-0) | ✅ MATCHED |
| Height Desktop | 528px | ✅ MATCHED |
| Margin Top Mobile | 22px | ✅ MATCHED |
| Margin Top Desktop | 29px | ✅ MATCHED |

### Layout Grid
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Gap Mobile | 48px (gap-12) | ✅ MATCHED |
| Gap Desktop | 64px (lg:gap-16) | ✅ MATCHED |
| Gap XL | 148px (min-[1440px]) | ✅ MATCHED |
| Direction Mobile | flex-col | ✅ MATCHED |
| Direction Desktop | lg:flex-row | ✅ MATCHED |
| Alignment | items-center | ✅ MATCHED |

### H1 Heading - Line 1 & 2
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Size Mobile (default) | 32px | ✅ MATCHED |
| Size Mobile (391px+) | 42px | ✅ MATCHED |
| Size Desktop | 48px | ✅ MATCHED |
| Size XL | 48px | ✅ MATCHED |
| Weight Mobile | 700 (bold) | ✅ MATCHED |
| Weight Mobile (391px+) | 600 (semibold) | ✅ MATCHED |
| Weight Desktop | 600 (semibold) | ✅ MATCHED |
| Letter Spacing | -0.025em | ✅ MATCHED |
| Line Height | 1.1 | ✅ MATCHED |
| Font Family | Instrument Sans | ✅ MATCHED |
| Color | slate-900 | ✅ MATCHED |

### H1 Heading - Line 3
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Size Mobile (default) | 28px | ✅ MATCHED |
| Size Mobile (391px+) | 32px | ✅ MATCHED |
| Size Desktop | 42px | ✅ MATCHED |
| Weight Mobile | 500 (medium) | ✅ MATCHED |
| Weight Desktop | 400 (normal) | ✅ MATCHED |
| Letter Spacing | -0.02em | ✅ MATCHED |
| Line Height | 1.15 | ✅ MATCHED |

### Vertical Rhythm (Typography Unit)
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| H1 Margin Bottom | 24px (mb-6) | ✅ MATCHED |
| Subheading Margin Bottom | 40px (mb-10) | ✅ MATCHED |
| **Total H1 → CTA** | **64px** | ✅ MATCHED |

### Subheading Typography
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Font Size | 16px | ✅ MATCHED |
| Font Weight | 400 (normal) | ✅ MATCHED |
| Color | #62748E | ✅ MATCHED |
| Font Family | Inter (ui) | ✅ MATCHED |
| Letter Spacing Mobile | -0.31px | ✅ MATCHED |
| Letter Spacing Desktop | -0.44px | ✅ MATCHED |
| Line Height Mobile | 20px | ✅ MATCHED |
| Line Height Desktop | 26px | ✅ MATCHED |
| Max Width Mobile | 85% | ✅ MATCHED |
| Max Width Desktop | 578px | ✅ MATCHED |

### Primary CTA Button
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Height | 46px | ✅ MATCHED |
| Padding X | 24px (px-6) | ✅ MATCHED |
| Border Radius | infinite (rounded-full) | ✅ MATCHED |
| Font Size | 16px | ✅ MATCHED |
| Font Weight | 500 (medium) | ✅ MATCHED |
| Letter Spacing | -0.3125px | ✅ MATCHED |
| Background | #000000 | ✅ MATCHED |
| Hover Background | slate-900 | ✅ MATCHED |
| Hover Shadow | md (4px blur) | ✅ MATCHED |
| Hover Translate Y | -0.5px | ✅ MATCHED |
| Active Scale | 0.98 | ✅ MATCHED |
| Transition | 300ms all | ✅ MATCHED |
| Icon Size | 20px (w-5 h-5) | ✅ MATCHED |
| Gap | 6px (gap-1.5) | ✅ MATCHED |

### Secondary CTA Button
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Height | 46px | ✅ MATCHED |
| Padding X | 24px (px-6) | ✅ MATCHED |
| Border Radius | 32px | ✅ MATCHED |
| Font Size | 16px | ✅ MATCHED |
| Font Weight | 400 (normal) | ✅ MATCHED |
| Letter Spacing | -0.3125px | ✅ MATCHED |
| Border | 1px black | ✅ MATCHED |
| Hover Background | slate-50/50 (50% opacity) | ✅ MATCHED |
| Hover Border | slate-300 | ✅ MATCHED |
| Transition | 300ms all | ✅ MATCHED |

### CTA Button Container
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Max Width | 500px | ✅ MATCHED |
| Gap Mobile | 12px (gap-3) | ✅ MATCHED |
| Gap Desktop | 24px (md:gap-6) | ✅ MATCHED |
| Direction Mobile | flex-col | ✅ MATCHED |
| Direction Desktop | md:flex-row | ✅ MATCHED |
| Alignment | items-center | ✅ MATCHED |

---

## 3. RECENT PRODUCTS MARQUEE

### Container Lock
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Max Width | 1280px (7xl) | ✅ MATCHED |
| Padding X Mobile | 24px (px-6) | ✅ MATCHED |
| Padding X Desktop | 48px (md:px-12) | ⚠️ DRIFT (should be lg:px-12) |
| Padding Y | 16px (py-4) | ✅ MATCHED |
| Background | white | ✅ MATCHED |
| Border Bottom | 1px slate-50 | ✅ MATCHED |
| Height Mobile | 50px | ✅ MATCHED |
| Height Desktop | 60px | ✅ MATCHED |

### Live Label Typography
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Font Size Mobile | 12px | ✅ MATCHED |
| Font Size Desktop | 13px | ✅ MATCHED |
| Font Weight | 700 (bold) | ✅ MATCHED |
| Text Transform | uppercase | ✅ MATCHED |
| Letter Spacing | widest (0.1em) | ✅ MATCHED |
| Color | slate-400 | ✅ MATCHED |
| Pulse Size | 8px (w-2 h-2) | ✅ MATCHED |
| Pulse Color | blue-500 | ✅ MATCHED |
| Gap | 12px (gap-3) | ✅ MATCHED |

### Store Names Typography
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Font Size Mobile | 14px | ✅ MATCHED |
| Font Size Desktop | 16px | ✅ MATCHED |
| Font Weight | 500 (medium) | ✅ MATCHED |
| Color | slate-800 | ✅ MATCHED |
| Hover Color | slate-950 | ✅ MATCHED |
| Margin X | 24px (mx-6) | ✅ MATCHED |
| Transition | 300ms | ✅ MATCHED |

### Identity Dot
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Size | 10px × 10px | ✅ MATCHED |
| Border Radius | 50% (full) | ✅ MATCHED |
| Opacity Idle | 0.6 | ✅ MATCHED |
| Opacity Hover | 1.0 | ✅ MATCHED |
| Top Color | #0057B7 (50%) | ✅ MATCHED |
| Bottom Color | #FFD700 (50%) | ✅ MATCHED |

---

## 4. HOW IT WORKS SECTION

### Container Lock
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Max Width | 1440px | ⚠️ DRIFT (should be 1280px) |
| Padding X Mobile | 24px (px-6) | ✅ MATCHED |
| Padding X Desktop | 80px (md:px-20) | ⚠️ DRIFT (should be 48px) |
| Padding Y Mobile | 56px (py-14) | ✅ MATCHED |
| Padding Y Desktop | 100px (md:py-[100px]) | ✅ MATCHED |
| Background | white | ✅ MATCHED |

### Section Header
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Margin Bottom Mobile | 32px (mb-8) | ✅ MATCHED |
| Margin Bottom Desktop | 48px (md:mb-12) | ✅ MATCHED |
| Max Width | 700px | ✅ MATCHED |
| Gap Mobile | 12px (gap-3) | ✅ MATCHED |
| Gap Desktop | 16px (md:gap-4) | ✅ MATCHED |

### H2 Heading Typography
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Font Size Mobile | 28px | ✅ MATCHED |
| Font Size Desktop | 36px | ✅ MATCHED |
| Font Weight | 600 (semibold) | ✅ MATCHED |
| Letter Spacing Mobile | -0.02em (tight) | ✅ MATCHED |
| Letter Spacing Desktop | -0.05em | ✅ MATCHED |
| Line Height Mobile | tight (1.25) | ✅ MATCHED |
| Line Height Desktop | 52.5px | ✅ MATCHED |
| Font Family | Gelasio | ✅ MATCHED |
| Color | slate-900 | ✅ MATCHED |

### Subtext Typography
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Font Size Mobile | 16px | ✅ MATCHED |
| Font Size Desktop | 20px | ✅ MATCHED |
| Font Weight | 400 (normal) | ✅ MATCHED |
| Color | slate-600 | ✅ MATCHED |
| Line Height Desktop | 29.3px | ✅ MATCHED |
| Letter Spacing Desktop | -0.44px | ✅ MATCHED |
| Font Family | Inter (ui) | ✅ MATCHED |

### Steps Grid
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Columns Mobile | 1 | ✅ MATCHED |
| Columns Desktop | 3 | ✅ MATCHED |
| Gap Mobile | 40px (gap-10) | ✅ MATCHED |
| Gap Desktop | 32px (md:gap-8) | ✅ MATCHED |

### Step Card
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Padding Y | 36px (py-9) | ✅ MATCHED |
| Padding X | 28px (px-7) | ✅ MATCHED |
| Background | #F8F9FA | ✅ MATCHED |
| Border | 1px transparent | ✅ MATCHED |
| Hover Border | 1px gray-100 | ✅ MATCHED |
| Border Radius | 32px (var(--radius-brand)) | ✅ MATCHED |
| Shadow Idle | sm | ✅ MATCHED |
| Shadow Hover | md | ✅ MATCHED |
| Transition | 300ms all | ✅ MATCHED |

### Step Number
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Size | 48px × 48px (w-12 h-12) | ✅ MATCHED |
| Font Size | 20px | ✅ MATCHED |
| Font Weight | 700 (bold) | ✅ MATCHED |
| Background | #D3E4FD | ✅ MATCHED |
| Color | black | ✅ MATCHED |
| Border Radius | 50% (full) | ✅ MATCHED |
| Margin Bottom | 20px (mb-5) | ✅ MATCHED |

### Step Icon
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Size | 32px × 32px (w-8 h-8) | ✅ MATCHED |
| Color | black | ✅ MATCHED |
| Margin Bottom | 20px (mb-5) | ✅ MATCHED |

### Step Title
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Font Size Mobile | 18px | ✅ MATCHED |
| Font Size Desktop | 20px | ✅ MATCHED |
| Font Weight | 600 (semibold) | ✅ MATCHED |
| Color | slate-900 | ✅ MATCHED |
| Letter Spacing | -0.02em (tight) | ✅ MATCHED |
| Margin Bottom | 10px (mb-2.5) | ✅ MATCHED |
| Font Family | Inter (ui) | ✅ MATCHED |

### Step Description
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Font Size Mobile | 14px | ✅ MATCHED |
| Font Size Desktop | 16px | ✅ MATCHED |
| Font Weight | 400 (normal) | ✅ MATCHED |
| Color | slate-600 | ✅ MATCHED |
| Line Height | relaxed (1.625) | ✅ MATCHED |
| Font Family | Inter (ui) | ✅ MATCHED |

### CTA Button
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Height Mobile | 46px | ✅ MATCHED |
| Height Desktop | 52px | ✅ MATCHED |
| Border Radius | infinite (rounded-full) | ✅ MATCHED |
| Padding Y | 12px (py-3) | ✅ MATCHED |
| Padding X | 28px (px-7) | ✅ MATCHED |
| Font Size | 16px | ✅ MATCHED |
| Font Weight | 600 (semibold) | ✅ MATCHED |
| Background | black | ✅ MATCHED |
| Hover Background | slate-900 | ✅ MATCHED |
| Hover Shadow | md | ✅ MATCHED |
| Hover Translate Y | -0.5px | ✅ MATCHED |
| Active Scale | 0.98 | ✅ MATCHED |
| Transition | 300ms all | ✅ MATCHED |
| Margin Top | 16px (mt-4) | ✅ MATCHED |
| Icon Size | 20px (w-5 h-5) | ✅ MATCHED |
| Gap | 6px (gap-1.5) | ✅ MATCHED |

---

## 5. FAQ SECTION

### Container Lock
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Max Width | 1440px | ⚠️ DRIFT (should be 1280px) |
| Padding X Mobile | 24px (px-6) | ✅ MATCHED |
| Padding X Desktop | 80px (md:px-20) | ⚠️ DRIFT (should be 48px) |
| Padding Top Mobile | 56px (pt-14) | ✅ MATCHED |
| Padding Top Desktop | 100px (md:pt-[100px]) | ✅ MATCHED |
| Padding Bottom | 128px (pb-32) | ✅ MATCHED |
| Background | white | ✅ MATCHED |

### Section Header
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Margin Bottom Mobile | 32px (mb-8) | ✅ MATCHED |
| Margin Bottom Desktop | 48px (md:mb-12) | ✅ MATCHED |
| Max Width | 700px | ✅ MATCHED |
| Gap Mobile | 12px (gap-3) | ✅ MATCHED |
| Gap Desktop | 16px (md:gap-4) | ✅ MATCHED |

### H2 Heading Typography
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Font Size Mobile | 28px | ✅ MATCHED |
| Font Size Desktop | 36px | ✅ MATCHED |
| Font Weight | 600 (semibold) | ✅ MATCHED |
| Letter Spacing Mobile | -0.02em (tight) | ✅ MATCHED |
| Letter Spacing Desktop | -0.05em | ✅ MATCHED |
| Line Height Mobile | tight (1.25) | ✅ MATCHED |
| Line Height Desktop | 52.5px | ✅ MATCHED |
| Font Family | Gelasio | ✅ MATCHED |
| Color | slate-900 | ✅ MATCHED |

### Subtext Typography
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Font Size Mobile | 16px | ✅ MATCHED |
| Font Size Desktop | 20px | ✅ MATCHED |
| Font Weight | 400 (normal) | ✅ MATCHED |
| Color | slate-600 | ✅ MATCHED |
| Line Height Desktop | 29.3px | ✅ MATCHED |
| Letter Spacing Desktop | -0.44px | ✅ MATCHED |
| Font Family | Inter (ui) | ✅ MATCHED |

### FAQ Items Container
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Max Width | 768px (max-w-3xl) | ✅ MATCHED |
| Margin | auto (mx-auto) | ✅ MATCHED |
| Gap | 12px (space-y-3) | ✅ MATCHED |

### FAQ Accordion Button
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Width | 100% (w-full) | ✅ MATCHED |
| Padding X Mobile | 24px (px-6) | ✅ MATCHED |
| Padding X Desktop | 32px (md:px-8) | ✅ MATCHED |
| Padding Y Mobile | 20px (py-5) | ✅ MATCHED |
| Padding Y Desktop | 24px (md:py-6) | ✅ MATCHED |
| Background | gradient from-#F8F9FA to-#FFFFFF | ✅ MATCHED |
| Border | 1px gray-100 | ✅ MATCHED |
| Hover Border | 1px gray-200 | ✅ MATCHED |
| Border Radius | 32px (var(--radius-brand)) | ✅ MATCHED |
| Shadow Idle | sm | ✅ MATCHED |
| Shadow Hover | md | ✅ MATCHED |
| Transition | 300ms all | ✅ MATCHED |

### FAQ Question
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Font Size Mobile | 16px | ✅ MATCHED |
| Font Size Desktop | 18px | ✅ MATCHED |
| Font Weight | 600 (semibold) | ✅ MATCHED |
| Color | slate-900 | ✅ MATCHED |
| Line Height | relaxed (1.625) | ✅ MATCHED |
| Font Family | Inter (ui) | ✅ MATCHED |

### FAQ ChevronDown Icon
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Size | 20px (w-5 h-5) | ✅ MATCHED |
| Stroke Width | 1.5 | ✅ MATCHED |
| Color Idle | slate-400 | ✅ MATCHED |
| Color Open | slate-900 + rotate-180 | ✅ MATCHED |
| Transition | 300ms all | ✅ MATCHED |

### FAQ Answer
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Padding X Mobile | 24px (px-6) | ✅ MATCHED |
| Padding X Desktop | 32px (md:px-8) | ✅ MATCHED |
| Padding Bottom Mobile | 20px (pb-5) | ✅ MATCHED |
| Padding Bottom Desktop | 24px (md:pb-6) | ✅ MATCHED |
| Padding Top | 8px (pt-2) | ✅ MATCHED |
| Font Size Mobile | 14px | ✅ MATCHED |
| Font Size Desktop | 16px | ✅ MATCHED |
| Font Weight | 400 (normal) | ✅ MATCHED |
| Color | slate-600 | ✅ MATCHED |
| Line Height | relaxed (1.625) | ✅ MATCHED |
| Font Family | Inter (ui) | ✅ MATCHED |

---

## 6. SPREAD THE WORD SECTION

### Container Lock
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Max Width | 1440px | ⚠️ DRIFT (should be 1280px) |
| Padding X Mobile | 24px (px-6) | ✅ MATCHED |
| Padding X Desktop | 48px (md:px-12) | ⚠️ DRIFT (should be lg:px-12) |
| Padding Y Mobile | 64px (py-16) | ✅ MATCHED |
| Padding Y Desktop | 64px (md:py-[64px]) | ✅ MATCHED |
| Height Desktop | 557px (md:h-[557px]) | ✅ MATCHED |
| Background | #ECF6FF | ✅ MATCHED |

### Section Header
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Margin Bottom | 32px (mb-8) | ✅ MATCHED |
| Max Width | 768px (max-w-3xl) + mx-auto | ✅ MATCHED |
| Gap | 12px (gap-3) | ✅ MATCHED |

### H2 Heading Typography
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Font Size Mobile | 32px | ✅ MATCHED |
| Font Size Desktop | 42px | ✅ MATCHED |
| Font Weight | 500 (medium) | ✅ MATCHED |
| Letter Spacing Mobile | -0.02em (tight) | ✅ MATCHED |
| Letter Spacing Desktop | 0.03em | ✅ MATCHED |
| Line Height Mobile | tight (1.25) | ✅ MATCHED |
| Line Height Desktop | 52.5px | ✅ MATCHED |
| Font Family | Gelasio | ✅ MATCHED |
| Color | slate-900 | ✅ MATCHED |

### Subtext Typography
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Font Size Mobile | 16px | ✅ MATCHED |
| Font Size Desktop | 18px | ✅ MATCHED |
| Font Weight | 400 (normal) | ✅ MATCHED |
| Line Height Desktop | 29.3px | ✅ MATCHED |
| Letter Spacing Desktop | -0.44px | ✅ MATCHED |
| Color | gray-600 | ✅ MATCHED |
| Font Family | Inter (ui) | ✅ MATCHED |

### Material Card
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Width Mobile | 100% (w-full) | ✅ MATCHED |
| Width Desktop | 790px (md:w-[790px]) | ✅ MATCHED |
| Height Desktop | 252px (md:h-[252px]) | ✅ MATCHED |
| Background | #000000 | ✅ MATCHED |
| Border | 1px white/10 | ✅ MATCHED |
| Border Radius Mobile | 24px (rounded-[24px]) | ✅ MATCHED |
| Border Radius Desktop | 40px (md:rounded-[40px]) | ✅ MATCHED |
| Shadow | 0_20px_50px_rgba(0,0,0,0.3) | ✅ MATCHED |
| Padding Y | 48px (py-12) | ✅ MATCHED |
| Padding X Mobile | 24px (px-6) | ✅ MATCHED |
| Padding X Desktop | 32px (md:px-8) | ✅ MATCHED |

### Message Typography
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Padding X Mobile | 16px (px-4) | ✅ MATCHED |
| Padding X Desktop | 40px (md:px-10) | ✅ MATCHED |
| Margin Bottom | 32px (mb-8) | ✅ MATCHED |
| Font Size Mobile | 16px | ✅ MATCHED |
| Font Size Desktop | 18px | ✅ MATCHED |
| Font Weight | 400 (normal) | ✅ MATCHED |
| Color | white/90 (90% opacity) | ✅ MATCHED |
| Line Height | relaxed (1.625) | ✅ MATCHED |
| Font Family | Inter (ui) | ✅ MATCHED |

### Social Buttons Container
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Direction Mobile | flex-col | ✅ MATCHED |
| Direction Desktop | md:flex-row | ✅ MATCHED |
| Gap Mobile | 12px (gap-3) | ✅ MATCHED |
| Gap Desktop | 16px (md:gap-4) | ✅ MATCHED |
| Alignment | items-center justify-center | ✅ MATCHED |

### Social Buttons
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Width Mobile | 100% max-w-[320px] | ✅ MATCHED |
| Width Desktop | auto (md:w-auto) | ✅ MATCHED |
| Padding X | 32px (px-8) | ✅ MATCHED |
| Padding Y | 10px (py-2.5) | ✅ MATCHED |
| Border Radius | infinite (rounded-full) | ✅ MATCHED |
| Font Size | 13px | ✅ MATCHED |
| Color | white | ✅ MATCHED |
| Border | 1px white | ✅ MATCHED |
| Background Idle | transparent | ✅ MATCHED |
| Background Hover | white | ✅ MATCHED |
| Text Hover | black | ✅ MATCHED |
| Transition | 300ms all | ✅ MATCHED |
| Gap | 8px (gap-2) | ✅ MATCHED |
| Icon Size | 14px (w-[14px] h-[14px]) | ✅ MATCHED |

---

## 7. PRE-FOOTER SECTION

### Container Lock
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Max Width | N/A (no max-w) | ⚠️ DRIFT (should be 1280px) |
| Padding X Mobile | 24px (px-6) | ✅ MATCHED |
| Padding X Desktop | 80px (md:px-20) | ⚠️ DRIFT (should be 48px) |

### Content Wrapper
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Padding Y | 128px (py-32) | ✅ MATCHED |
| Padding X | 80px (px-20) | ✅ MATCHED |
| Z-Index | 10 (relative) | ✅ MATCHED |

### H3 Heading Typography
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Font Size Mobile | 28px | ✅ MATCHED |
| Font Size Desktop | 36px | ✅ MATCHED |
| Font Weight | 500 (medium) | ✅ MATCHED |
| Color | slate-900 | ✅ MATCHED |
| Letter Spacing | -0.02em (tight) | ✅ MATCHED |
| Line Height | tight (1.25) | ✅ MATCHED |

### Subtext Typography
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Margin Top | 24px (mt-6) | ✅ MATCHED |
| Font Size Mobile | 16px | ✅ MATCHED |
| Font Size Desktop | 20px | ✅ MATCHED |
| Color | slate-900/60 (60% opacity) | ✅ MATCHED |
| Text Transform | lowercase | ✅ MATCHED |
| Letter Spacing | wide (0.025em) | ✅ MATCHED |
| Font Style | italic | ✅ MATCHED |
| Line Height | relaxed (1.625) | ✅ MATCHED |

### Background Image
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Opacity | 0.1 (10%) | ✅ MATCHED |

---

## 8. FOOTER COMPONENT

### Container Lock
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Max Width | 1280px (7xl) | ✅ MATCHED |
| Padding X Mobile | 24px (px-6) | ✅ MATCHED |
| Padding X Desktop | 48px (lg:px-12) | ✅ MATCHED |
| Padding Top | 64px (pt-16) | ✅ MATCHED |
| Padding Bottom Main | 48px (pb-12) | ✅ MATCHED |
| Padding Bottom Section | 40px (pb-10) | ✅ MATCHED |
| Background | #000000 (black) | ✅ MATCHED |
| Color | #fafafa | ✅ MATCHED |

### Columns Layout
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Direction Mobile | flex justify-between | ✅ MATCHED |
| Direction Desktop | md:justify-start | ✅ MATCHED |
| Gap Desktop | 80px (md:gap-20) / 128px (lg:gap-32) | ✅ MATCHED |
| Right Group Margin | auto (md:ml-auto) | ✅ MATCHED |

### Column Headers (H4)
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Font Size | 10px | ✅ MATCHED |
| Font Weight | 700 (bold) | ✅ MATCHED |
| Text Transform | uppercase | ✅ MATCHED |
| Letter Spacing | 0.2em (tracking-[0.2em]) | ✅ MATCHED |
| Color | white opacity-50 | ✅ MATCHED |
| Margin Bottom | 16px (mb-4) | ✅ MATCHED |
| Font Family | Inter (ui) | ✅ MATCHED |

### Column Links
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Font Size | 14px | ✅ MATCHED |
| Color | slate-300 | ✅ MATCHED |
| Hover Color | white | ✅ MATCHED |
| Transition | 200ms colors | ✅ MATCHED |
| Spacing | 12px (space-y-3) | ✅ MATCHED |

### Bottom Bar
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Container | 1280px (7xl) mx-auto px-6 lg:px-12 | ✅ MATCHED |
| Border Top | 1px white/10 | ✅ MATCHED |
| Padding Top | 32px (pt-8) | ✅ MATCHED |
| Margin Top | 0 (mt-0) | ✅ MATCHED |
| Layout | flex justify-between | ✅ MATCHED |
| Font Size | 12px | ✅ MATCHED |
| Color | slate-500 | ✅ MATCHED |

### Admin Link
| Element | Value | Obsidian Status |
|---------|-------|-----------------|
| Font Size | 10px | ✅ MATCHED |
| Color | slate-500 | ✅ MATCHED |
| Hover Color | white | ✅ MATCHED |
| Transition | colors | ✅ MATCHED |

---

## CRITICAL CONFLICTS SUMMARY

### Max-Width Discrepancies
| Section | Current | Golden Gutter | Status |
|---------|---------|---------------|--------|
| Hero | 1280px (7xl) | 1280px | ✅ MATCHED |
| Footer | 1280px (7xl) | 1280px | ✅ MATCHED |
| Header | **1440px** | 1280px | ⚠️ **DRIFT** |
| How It Works | **1440px** | 1280px | ⚠️ **DRIFT** |
| FAQ | **1440px** | 1280px | ⚠️ **DRIFT** |
| Spread the Word | **1440px** | 1280px | ⚠️ **DRIFT** |
| Pre-Footer | **N/A** | 1280px | ⚠️ **DRIFT** |

### Horizontal Padding Discrepancies
| Section | Mobile | Desktop | Golden Gutter | Status |
|---------|--------|---------|---------------|--------|
| Hero | 24px (px-6) | 48px (lg:px-12) | px-6 lg:px-12 | ✅ MATCHED |
| Footer | 24px (px-6) | 48px (lg:px-12) | px-6 lg:px-12 | ✅ MATCHED |
| Header | 24px (px-6) | **48px (md:px-12)** | px-6 lg:px-12 | ⚠️ **DRIFT** (md vs lg) |
| How It Works | 24px (px-6) | **80px (md:px-20)** | px-6 lg:px-12 | ⚠️ **DRIFT** |
| FAQ | 24px (px-6) | **80px (md:px-20)** | px-6 lg:px-12 | ⚠️ **DRIFT** |
| Pre-Footer | 24px (px-6) | **80px (md:px-20)** | px-6 lg:px-12 | ⚠️ **DRIFT** |

---

## RECOMMENDATIONS FOR OBSIDIAN UNITY

### Immediate Action Items
1. **Standardize max-width to 1280px (7xl)** across Header, How It Works, FAQ, Spread the Word, Pre-Footer
2. **Standardize horizontal padding to px-6 lg:px-12** across all sections
3. **Use `lg:` breakpoint consistently** instead of mixing `md:` and `lg:`

### Affected Files
- `header.tsx` → Change `max-w-[1440px] md:px-12` to `max-w-7xl lg:px-12`
- `how-it-works.tsx` → Change `max-w-[1440px] md:px-20` to `max-w-7xl lg:px-12`
- `faq.tsx` → Change `max-w-[1440px] md:px-20` to `max-w-7xl lg:px-12`
- `spread-the-word.tsx` → Change `max-w-[1440px] md:px-12` to `max-w-7xl lg:px-12`
- `pre-footer.tsx` → Add `max-w-7xl mx-auto` and change `md:px-20` to `lg:px-12`

---

*End of Numeric Extraction*
