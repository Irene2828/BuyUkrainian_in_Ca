# OBSIDIAN QA CHECKLIST
**Mandatory Verification Protocol for Design System Compliance**  
*Version: 1.0.0*

---

## 🎯 CORE PRINCIPLES VERIFICATION

### Principle 1: Vertical Rhythm (The Ritual Gap)
**Rule**: Every major section MUST have 128px (py-32) desktop / 80px (py-20) mobile vertical buffer

**Test Steps**:
- [ ] Open browser DevTools Inspector
- [ ] Select How It Works `<section>` element
- [ ] Verify computed padding-top: 128px (desktop) or 80px (mobile)
- [ ] Verify computed padding-bottom: 128px (desktop) or 80px (mobile)
- [ ] Repeat for FAQ, Spread the Word, Pre-Footer sections

**Expected**: `py-20 md:py-32` class on all major sections  
**Fail If**: Any section uses hardcoded values like `pt-[80px]` or inconsistent spacing

---

### Principle 2: The Golden Gutter
**Rule**: All content sections (except Map/Admin) MUST be constrained to max-w-7xl with px-6 lg:px-12

**Test Steps**:
- [ ] Inspect Header container → Should be `max-w-7xl mx-auto px-6 lg:px-12`
- [ ] Inspect Hero container → Should be `max-w-7xl mx-auto px-6 lg:px-12`
- [ ] Inspect How It Works container → Should be `max-w-7xl mx-auto px-6 lg:px-12`
- [ ] Inspect FAQ container → Should be `max-w-7xl mx-auto px-6 lg:px-12`
- [ ] Inspect Footer container → Should be `max-w-7xl mx-auto px-6 lg:px-12`

**Ruler Test**:
- [ ] Use browser ruler extension or DevTools
- [ ] Draw vertical line from "Find and Share" (Hero)
- [ ] Line MUST hit start of all section content (How It Works, FAQ, Footer)

**Expected**: Perfect vertical alignment from top to bottom  
**Fail If**: Any section bulges beyond or falls short of the vertical axis

---

### Principle 3: Interaction Finish (32px Radius)
**Rule**: All buttons, inputs, and chips MUST use 32px (rounded-[32px]) or infinite (rounded-full) radius

**Test Steps**:
- [ ] Hero "Explore the Map" button → `rounded-full` ✓
- [ ] Hero "Learn More" button → `rounded-[32px]` ✓
- [ ] How It Works CTA → `rounded-full` ✓
- [ ] FAQ accordion buttons → `rounded-[32px]` ✓
- [ ] Map "Add Location" button → `rounded-[32px]` ✓
- [ ] Province dropdown → `rounded-[32px]` ✓

**Expected**: Consistent pill/rounded shapes  
**Fail If**: Any button uses `rounded-md` (8px) or `rounded-lg` (12px)

---

### Principle 4: Hover Language (Soft Gray, No Black Strokes)
**Rule**: No hard black strokes on hover; use only soft background lifts and refined gray rings

**Test Steps**:
- [ ] Hover over Province dropdown
  - **Expected**: `hover:bg-gray-50` (subtle fill)
  - **Fail If**: Black border appears
- [ ] Click Province dropdown (focus state)
  - **Expected**: `focus:ring-1 ring-gray-200 border-gray-200`
  - **Fail If**: Black ring or thick border
- [ ] Hover over filter chips
  - **Expected**: Soft gray border change
  - **Fail If**: Black border flash
- [ ] Test all inputs on Map page
  - **Expected**: Soft premium gray focus
  - **Fail If**: Any blue or black browser default

**Critical**: Open DevTools Console, check for any `focus:border-black` or `ring-black` in computed styles

---

## 🗺️ MAP CANVAS EXCEPTION VERIFICATION

### Exception 1: Wide Canvas Layout
**Rule**: Map and Admin views are exempt from max-w-7xl constraint

**Test Steps**:
- [ ] Navigate to `/map`
- [ ] Inspect map container
- [ ] Should be `max-w-[1440px]` OR `w-full px-6 lg:px-8`
- [ ] Should NOT be `max-w-7xl` (1280px)

**Visual Test**:
- [ ] Sidebar and map should feel spacious
- [ ] No "ugly cut" or cramped feeling
- [ ] Map takes majority of viewport width

**Expected**: Professional immersive canvas  
**Fail If**: Map feels squeezed or sidebar touches edge uncomfortably

---

### Exception 2: Default Viewport (FROZEN)
**Rule**: Map MUST load at center: [44.5, -78.5] and zoom: 5.5

**Test Steps**:
- [ ] Clear browser cache and localStorage
- [ ] Navigate to `/map`
- [ ] Wait for map tiles to load
- [ ] Verify Toronto cluster (24 pins) is clearly visible
- [ ] Verify Montreal cluster (8 pins) is clearly visible
- [ ] Check center coordinates in DevTools (Leaflet debug)

**Expected**: Both major clusters immediately in frame  
**Fail If**: Map centers on Hudson Bay or requires manual dragging

**Code Check**:
- [ ] Open `client/src/components/interactive-map.tsx`
- [ ] Verify `INITIAL_MAP_STATE = { center: [44.5, -78.5], zoom: 5.5 } as const`
- [ ] Ensure no localStorage override

---

## 🎬 MOTION SYSTEM VERIFICATION

### Scroll Reveal Animation
**Rule**: Page MUST fade in smoothly with 0.8s custom curve

**Test Steps**:
- [ ] Hard refresh homepage (Cmd+Shift+R)
- [ ] Scroll down slowly to How It Works
- [ ] Observe section fade-in
  - **Expected**: Smooth 0.8s fade + 20px upward float
  - **Fail If**: Instant pop-in or janky animation
- [ ] Check stagger effect on 3 cards
  - **Expected**: Cards appear with 0.1s delay each (wave effect)
  - **Fail If**: All cards appear simultaneously

**Technical Check**:
- [ ] Open DevTools Performance tab
- [ ] Record scroll interaction
- [ ] Verify no layout shift (CLS = 0)
- [ ] Verify 60fps animation smoothness

**CSS Check**:
- [ ] Inspect `.section-reveal` class
- [ ] Should have `opacity: 0; transform: translateY(20px)` initially
- [ ] Should transition to `opacity: 1; transform: translateY(0)` when `.is-visible`

---

## 🎨 HOW IT WORKS CONTENT VERIFICATION

### Visual Content Test
**Rule**: Icons and illustrations MUST be visible in How It Works section

**Test Steps**:
- [ ] Navigate to homepage
- [ ] Scroll to "How It Works" section
- [ ] Verify 3 cards are visible:
  - **Card 1**: Discover (Search icon + illustration)
  - **Card 2**: Add to Map (PlusCircle icon + illustration)
  - **Card 3**: Spread the Word (Share2 icon + illustration)

**Image Check**:
- [ ] Each card should have 200px height image frame
- [ ] Images should be `howItWorks1.png`, `howItWorks2-v2.png`
- [ ] Images should NOT be broken/404

**Layout Check**:
- [ ] Cards should be in 3-column grid on desktop
- [ ] Cards should be vertically stacked on mobile
- [ ] All text (title + description) should be centered
- [ ] Grid gap should be consistent (32px)

**Expected**: Professional 3-column card layout  
**Fail If**: Cards are invisible, images broken, or layout collapsed

---

## 🎯 HERO VERTICAL RHYTHM VERIFICATION

### Typography Unit Test
**Rule**: H1 → Subheading = 24px (mb-6), Subheading → CTA = 40px (mb-10)

**Test Steps**:
- [ ] Inspect Hero `<h1>` element
- [ ] Verify `margin-bottom: 24px` (mb-6 class)
- [ ] Inspect Hero `<p>` (subheading) element
- [ ] Verify `margin-bottom: 40px` (mb-10 class)

**Visual Test**:
- [ ] Heading and subheading should feel like a "block"
- [ ] CTA buttons should feel like they "float comfortably" below text
- [ ] No cramped feeling between elements

**Expected**: Clear typographic hierarchy  
**Fail If**: Spacing feels inconsistent or buttons too close to text

---

## 🚫 PHANTOM STROKE PREVENTION VERIFICATION

### Global Focus Ring Test
**Rule**: NO black borders anywhere - permanent fix in @layer base

**Test Steps**:
- [ ] Tab through entire page (keyboard navigation)
- [ ] Check focus state on each interactive element:
  - [ ] Header navigation links
  - [ ] Hero CTA buttons
  - [ ] How It Works CTA button
  - [ ] FAQ accordion buttons
  - [ ] Map filter dropdowns
  - [ ] Map search input

**Expected**: Soft gray rings (ring-gray-200) or subtle outline  
**Fail If**: ANY element shows black border or blue browser default

**Code Check**:
- [ ] Open `client/src/index.css`
- [ ] Verify `@layer base` section has:
  ```css
  *:focus { @apply outline-none; }
  button:focus, input:focus, select:focus { @apply outline-none ring-0; }
  .premium-focus:focus { @apply ring-1 ring-gray-200 border-gray-200; }
  ```

---

## 📱 RESPONSIVE VERIFICATION

### Mobile Breakpoints
**Test Steps**:
- [ ] Set viewport to 375px (iPhone SE)
- [ ] Verify vertical spacing scales to 80px (py-20)
- [ ] Verify horizontal padding scales to 24px (px-6)
- [ ] Verify How It Works cards stack vertically
- [ ] Verify map remains functional (no overflow)

### Desktop Breakpoints
**Test Steps**:
- [ ] Set viewport to 1920px (large desktop)
- [ ] Verify content doesn't exceed 1280px width (max-w-7xl)
- [ ] Verify map can use full width (exception applies)
- [ ] Verify no horizontal scrollbar

---

## ⚡ PERFORMANCE VERIFICATION

### Lighthouse Audit
**Test Steps**:
- [ ] Run Lighthouse in DevTools
- [ ] Check Performance score → Should be 90+
- [ ] Check CLS (Cumulative Layout Shift) → Should be 0
- [ ] Check FCP (First Contentful Paint) → Should be < 1.5s

### Console Errors
**Test Steps**:
- [ ] Open DevTools Console
- [ ] Navigate through entire site
- [ ] Check for errors
  - **Expected**: No errors
  - **Warnings OK**: CSS `@apply`, `@theme` (Tailwind v4)
  - **Fail If**: Asset 404s, JavaScript errors, React warnings

---

## 📋 FINAL SIGN-OFF CHECKLIST

Before marking as "QA Approved", ALL items must pass:

### Design System
- [ ] Golden Gutter aligned (ruler test passed)
- [ ] Ritual Gap consistent (128px verified)
- [ ] 32px radius on all buttons
- [ ] Soft gray hover states (no black)

### Map
- [ ] Toronto + Montreal visible on load
- [ ] Coordinates frozen at [44.5, -78.5] zoom 5.5
- [ ] Wide canvas layout (not constrained)
- [ ] Province dropdown has soft focus

### Motion
- [ ] Scroll reveals smooth (0.8s)
- [ ] Stagger effect working (How It Works)
- [ ] No layout shift (CLS = 0)
- [ ] 60fps animations

### Content
- [ ] How It Works cards visible
- [ ] All images loaded
- [ ] Icons rendering
- [ ] Typography hierarchy clear

### Performance
- [ ] No console errors
- [ ] Lighthouse score 90+
- [ ] Fast load time
- [ ] Smooth scrolling

---

## 🚨 COMMON FAILURE SCENARIOS

### Failure: Black Border on Focus
**Symptom**: Province dropdown shows black ring when clicked  
**Fix**: Verify phantom stroke prevention in `index.css @layer base`  
**Root Cause**: Browser default not overridden

### Failure: Map Centered Wrong
**Symptom**: Hudson Bay visible, Toronto not in frame  
**Fix**: Check `INITIAL_MAP_STATE` is `[44.5, -78.5]` zoom `5.5`  
**Root Cause**: localStorage override or hardcoded old value

### Failure: Cards Not Visible
**Symptom**: How It Works section blank  
**Fix**: Verify scroll reveal hook observes `.stagger-container`  
**Root Cause**: Missing `is-visible` class trigger

### Failure: Layout Shift
**Symptom**: Content jumps when scrolling  
**Fix**: Check `will-change: opacity, transform` on animated elements  
**Root Cause**: Missing CLS prevention

---

## 📖 REFERENCE DOCUMENTS

- `DESIGN_SYSTEM_LOCK.json` - Complete system specification
- `OBSIDIAN_FINAL_IMPLEMENTATION.md` - Implementation summary
- `NUMERIC_DESIGN_EXTRACTION.md` - Detailed metrics
- `GLOBAL_FRAME_CALIBRATION.md` - Alignment verification

---

**QA Status**: ⬜ NOT STARTED | 🟡 IN PROGRESS | ✅ PASSED | ❌ FAILED

*Mark as ✅ PASSED only when ALL verification steps succeed*

🇺🇦🇨🇦
