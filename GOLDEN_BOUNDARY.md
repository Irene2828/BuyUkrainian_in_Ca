# GOLDEN BOUNDARY CONSTANT - GLOBAL ALIGNMENT STANDARD

## The Universal Container Class

**ENFORCE EVERYWHERE:**
```tsx
className="max-w-[1440px] mx-auto px-6 md:px-12"
```

This is the **Golden Boundary** that ensures perfect vertical alignment across all page sections.

## Implementation Rules

### 1. **Primary Sections (MUST USE Golden Boundary):**
- ✅ Header
- ✅ Hero  
- ✅ How It Works
- ✅ FAQ
- ✅ Spread the Word
- ✅ Pre-Footer
- ✅ Footer
- ✅ Map Page Header

### 2. **Alignment Principles:**

**Left Edge (0px):**
- Logo in Header
- Hero headline first character
- Section headings first character
- Map filter chips left edge

**Right Edge (100%):**
- Language/Globe icon in Header
- Hero CTA button right edge
- Map "Add Location" button right edge
- Footer content right edge

### 3. **Permanent Development Rule:**

**EVERY NEW SECTION MUST:**
```tsx
<section className="[background/styling]">
  <div className="max-w-[1440px] mx-auto px-6 md:px-12">
    {/* Section content */}
  </div>
</section>
```

### 4. **Exceptions (Content-Specific Max-Width):**

These elements use constrained widths WITHIN the Golden Boundary:
- Text blocks:max-w-2xl, max-w-[700px]` (centered within Golden Boundary)
- Cards: `max-w-sm`, `max-w-md` (as needed)
- FAQ accordion: `max-w-2xl`

## Header Specific Rules

**Structure:**
```tsx
<header>
  <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between">
    <div className="flex-1">{/* Logo */}</div>
    <div className="flex-1 justify-end">{/* Navigation */}</div>
  </div>
</header>
```

**CRITICAL:** Use `justify-between` NOT `justify-around` to ensure Logo sits at 0px and Globe sits at 100%.

## Map Section Locking

The Map Section's "Filter Bar" and "Add Location" button define the ABSOLUTE edges.

**All other page elements must align to these vertical lines.**

## Benefits

✅ Eliminates "width-drift" across sections
✅ Creates premium, machined feel
✅ Logo, headings, and content perfectly aligned vertically
✅ Consistent 24px/48px breathing room on all screen sizes
✅ Professional, unified layout

## Anti-Patterns (DO NOT USE)

❌ `max-w-7xl` (too narrow at 1280px, breaks rhythm)
❌ `max-w-6xl` (too narrow, inconsistent)
❌ `justify-around` in Header (breaks edge alignment)
❌ Sections without Golden Boundary wrapper
❌ Random custom max-widths at section level

---

**Last Updated:** 2026-01-16  
**Status:** ENFORCED - All new sections must follow this standard
