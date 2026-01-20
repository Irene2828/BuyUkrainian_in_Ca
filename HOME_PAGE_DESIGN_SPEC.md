# HOME PAGE DESIGN SPECIFICATION
**Source of Truth - As-Is State**  
*Generated: 2026-01-19*

---

## 1. HEADER COMPONENT (`header.tsx`)

### Container & Layout
- **Position**: `sticky top-0 z-50`
- **Height**: `h-[80px]` mobile, `md:h-[100px]` desktop
- **Background**: `bg-white/80 backdrop-blur-md`
- **Border**: `border-b border-slate-100` (scroll-activated when `scrollY > 10`)
- **Container**: `max-w-[1440px] mx-auto px-6 md:px-12`

### Logo & Branding
- **Width**: `w-[100px]` mobile, `md:w-[124px]` desktop
- **Text**: `text-[12px]` mobile, `md:text-[16px]` desktop
- **Font Weight**: `font-semibold`
- **Tracking**: `tracking-[0px]`
- **Color**: `text-[#003E82]`
- **Font Family**: `'Instrument Sans', sans-serif`

### Navigation Links (Desktop)
- **Font Size**: `text-[16px]`
- **Font Weight**: `font-medium`
- **Color Idle**: `text-slate-500`
- **Color Hover**: `hover:text-slate-950`
- **Tracking**: `tracking-tight`
- **Transition**: `transition-colors duration-300`
- **Gap Between Links**: `gap-10`

### Map View Button (Desktop)
- **Font Size**: `text-[16px]`
- **Font Weight**: `font-semibold`
- **Tracking**: `tracking-[0px]`
- **Font Family**: `'Inter', sans-serif`

### Map View Button (Mobile)
- **Font Size**: `text-[14px]`
- **Font Weight**: `font-semibold`
- **Icon Size**: `w-5 h-5`

### Mobile Menu
- **Gap Between Items**: `gap-6`
- **Padding**: `px-6 py-6`
- **Background**: `bg-white/95 backdrop-blur-lg`
- **Border**: `border-t border-gray-100`

---

## 2. HERO SECTION (`hero.tsx`)

### Section Container
- **Background**: `bg-[#F9FCD4]`
- **Padding**: `py-12` mobile, `md:py-0` desktop
- **Height (Desktop)**: `md:h-[528px]`
- **Margin Top**: `mt-[22px]` mobile, `md:mt-[29px]` desktop
- **Container**: `max-w-7xl mx-auto px-6 lg:px-12`

### Layout Grid
- **Direction**: `flex-col` mobile, `lg:flex-row` desktop
- **Gap**: `gap-12` mobile, `lg:gap-16` desktop, `min-[1440px]:gap-[148px]` XL
- **Alignment**: `items-center`

### H1 Heading
- **Font Size Line 1-2**: 
  - Mobile: `text-[32px]` (default), `min-[391px]:text-[42px]`
  - Desktop: `md:text-[48px]`, `min-[1440px]:text-[48px]`
- **Font Size Line 3**:
  - Mobile: `text-[28px]` (default), `min-[391px]:text-[32px]`
  - Desktop: `md:text-[42px]`
- **Font Weight Line 1-2**: `font-bold` mobile, `min-[391px]:font-semibold`, `md:font-semibold` desktop
- **Font Weight Line 3**: `font-medium` mobile, `md:font-normal`, `min-[1440px]:!font-normal`
- **Tracking Line 1-2**: `tracking-[-0.025em]`
- **Tracking Line 3**: `tracking-[-0.02em]`
- **Leading Line 1-2**: `leading-[1.1]`
- **Leading Line 3**: `leading-[1.15]`
- **Color**: `text-slate-900`
- **Font Family**: `font-instrument` (Instrument Sans)
- **Margin Bottom**: `mb-6` (24px - to subheading)

### Subheading (P tag)
- **Font Size**: `text-[16px]` mobile, `md:text-[16px]` desktop
- **Font Weight**: `font-normal`
- **Color**: `text-[#62748E]`
- **Font Family**: `font-ui` (Inter)
- **Tracking**: `tracking-[-0.31px]` mobile, `md:tracking-[-0.44px]` desktop
- **Leading**: `leading-[20px]` mobile, `md:leading-[26px]` desktop
- **Max Width**: `max-w-[85%]` mobile, `md:max-w-[578px]` desktop
- **Margin Bottom**: `mb-10` (40px - to CTAs)

### CTA Buttons Container
- **Max Width**: `max-w-[500px]`
- **Direction**: `flex-col` mobile, `md:flex-row` desktop
- **Gap**: `gap-3` mobile, `md:gap-6` desktop
- **Alignment**: `items-center` mobile and desktop, `justify-center` mobile, `md:justify-start` desktop

### Primary CTA Button ("Explore the Map")
- **Height**: `h-[46px]`
- **Background**: `!bg-black`
- **Text Color**: `text-white`
- **Hover Background**: `hover:!bg-slate-900`
- **Border Radius**: `rounded-full`
- **Padding**: `px-6`
- **Font Size**: `text-[16px]`
- **Font Weight**: `font-medium`
- **Gap**: `gap-1.5`
- **Tracking**: `tracking-[-0.3125px]`
- **Transition**: `transition-all duration-300`
- **Hover Effects**: `hover:shadow-md hover:-translate-y-[0.5px] active:scale-[0.98]`
- **Icon Size**: `w-5 h-5`

### Secondary CTA Button ("Learn More")
- **Height**: `h-[46px]`
- **Background**: `bg-white/10 backdrop-blur-md`
- **Border**: `border border-black`
- **Border Radius**: `rounded-[32px]`
- **Text Color**: `text-black`
- **Hover Background**: `hover:bg-slate-50/50`
- **Hover Border**: `hover:border-slate-300`
- **Padding**: `px-6`
- **Font Size**: `text-[16px]`
- **Font Weight**: `font-normal`
- **Gap**: `gap-1.5`
- **Tracking**: `tracking-[-0.3125px]`
- **Transition**: `transition-all duration-300`
- **Icon Size**: `w-5 h-5`

### Video Container (Desktop)
- **Aspect Ratio**: `aspect-square`
- **Border Radius**: `rounded-3xl`
- **Border**: `border border-gray-100`
- **Background**: `#FDFFD7`
- **Shadow**: `shadow-sm`

### Video Container (Mobile)
- **Margin Top**: `mt-6`
- **Display**: `block md:hidden`

---

## 3. RECENT PRODUCTS MARQUEE (`recent-products-marquee.tsx`)

### Section Container
- **Background**: `bg-white`
- **Padding**: `py-4`
- **Border**: `border-b border-slate-50`
- **Container**: `max-w-7xl mx-auto px-6 md:px-12`

### Height
- **Mobile**: `h-[50px]`
- **Desktop**: `md:h-[60px]`

### "Live Findings" Label
- **Font Size**: `text-[12px]` mobile, `md:text-[13px]` desktop
- **Font Weight**: `font-bold`
- **Text Transform**: `uppercase`
- **Tracking**: `tracking-widest`
- **Color**: `text-slate-400`
- **Pulse Indicator**: `w-2 h-2 bg-blue-500 rounded-full animate-premium-pulse`
- **Gap**: `gap-3`

### Store Names
- **Font Size**: `text-[14px]` mobile, `md:text-[16px]` desktop
- **Font Weight**: `font-medium`
- **Color**: `text-slate-800`
- **Hover Color**: `hover:text-slate-950`
- **Margin X**: `mx-6`
- **Transition**: `transition-colors duration-300 ease-in-out`

### Identity Dot
- **Size**: `w-[10px] h-[10px]`
- **Shape**: `rounded-full`
- **Opacity**: `opacity-60`, `group-hover:opacity-100`
- **Gradient**: `linear-gradient(to bottom, #0057B7 50%, #FFD700 50%)`

---

## 4. HOW IT WORKS SECTION (`how-it-works.tsx`)

### Section Container
- **Background**: `bg-white`
- **Padding**: `py-14` mobile, `md:py-[100px]` desktop
- **Container**: `max-w-[1440px] mx-auto px-6 md:px-20`

### Section Header
- **Margin Bottom**: `mb-8` mobile, `md:mb-12` desktop
- **Max Width**: `max-w-[700px]`
- **Gap**: `gap-3` mobile, `md:gap-4` desktop

### H2 Heading
- **Font Size**: `text-[28px]` mobile, `md:text-[36px]` desktop
- **Font Weight**: `font-semibold`
- **Tracking**: `tracking-tight` mobile, `md:tracking-[-0.05em]` desktop
- **Leading**: `leading-tight` mobile, `md:leading-[52.5px]` desktop
- **Font Family**: `font-gelasio`
- **Color**: `text-slate-900`

### Subtext
- **Font Size**: `text-[16px]` mobile, `md:text-[20px]` desktop
- **Font Weight**: `font-normal`
- **Color**: `text-slate-600`
- **Leading**: `md:leading-[29.3px]` desktop
- **Tracking**: `md:tracking-[-0.44px]` desktop
- **Font Family**: `font-ui`

### Steps Grid
- **Grid**: `grid-cols-1` mobile, `md:grid-cols-3` desktop
- **Gap**: `gap-10` mobile, `md:gap-8` desktop

### Step Container
- **Padding**: `py-9 px-7`
- **Background**: `bg-[#F8F9FA]`
- **Border**: `border border-transparent`
- **Hover Border**: `hover:border-gray-100`
- **Border Radius**: `rounded-[var(--radius-brand)]` (32px)
- **Shadow**: `shadow-sm hover:shadow-md`
- **Transition**: `transition-all duration-300`

### Step Number
- **Width**: `w-12`
- **Height**: `h-12`
- **Font Size**: `text-[20px]`
- **Font Weight**: `font-bold`
- **Background**: `bg-[#D3E4FD]`
- **Color**: `text-black`
- **Border Radius**: `rounded-full`
- **Margin Bottom**: `mb-5`

### Step Icon
- **Size**: `w-8 h-8`
- **Color**: `text-black`
- **Margin Bottom**: `mb-5`

### Step Title
- **Font Size**: `text-[18px]` mobile, `md:text-[20px]` desktop
- **Font Weight**: `font-semibold`
- **Color**: `text-slate-900`
- **Margin Bottom**: `mb-2.5`
- **Tracking**: `tracking-tight`
- **Font Family**: `font-ui`

### Step Description
- **Font Size**: `text-[14px]` mobile, `md:text-[16px]` desktop
- **Font Weight**: `font-normal`
- **Color**: `text-slate-600`
- **Leading**: `leading-relaxed`
- **Font Family**: `font-ui`

### CTA Button
- **Height**: `h-[46px]` mobile, `md:h-[52px]` desktop
- **Background**: `bg-black`
- **Text Color**: `text-white`
- **Border Radius**: `rounded-full`
- **Padding**: `py-3 px-7`
- **Font Size**: `text-[16px]`
- **Font Weight**: `font-semibold`
- **Gap**: `gap-1.5`
- **Hover Background**: `hover:bg-slate-900`
- **Hover Effects**: `hover:shadow-md hover:-translate-y-[0.5px] active:scale-[0.98]`
- **Transition**: `transition-all duration-300`
- **Margin Top**: `mt-4`
- **Icon Size**: `w-5 h-5`

---

## 5. FAQ SECTION (`faq.tsx`)

### Section Container
- **Background**: `bg-white`
- **Padding Top**: `pt-14` mobile, `md:pt-[100px]` desktop
- **Padding Bottom**: `pb-32` (128px)
- **Container**: `max-w-[1440px] mx-auto px-6 md:px-20`

### Section Header
- **Margin Bottom**: `mb-8` mobile, `md:mb-12` desktop
- **Max Width**: `max-w-[700px]`
- **Gap**: `gap-3` mobile, `md:gap-4` desktop

### H2 Heading
- **Font Size**: `text-[28px]` mobile, `md:text-[36px]` desktop
- **Font Weight**: `font-semibold`
- **Tracking**: `tracking-tight` mobile, `md:tracking-[-0.05em]` desktop
- **Leading**: `leading-tight` mobile, `md:leading-[52.5px]` desktop
- **Font Family**: `font-gelasio`
- **Color**: `text-slate-900`

### Subtext
- **Font Size**: `text-[16px]` mobile, `md:text-[20px]` desktop
- **Font Weight**: `font-normal`
- **Color**: `text-slate-600`
- **Leading**: `md:leading-[29.3px]` desktop
- **Tracking**: `md:tracking-[-0.44px]` desktop
- **Font Family**: `font-ui`

### FAQ Items Container
- **Max Width**: `max-w-3xl`
- **Margin**: `mx-auto`
- **Gap**: `space-y-3`

### FAQ Button
- **Width**: `w-full`
- **Padding**: `px-6 md:px-8 py-5 md:py-6`
- **Background**: `bg-gradient-to-r from-[#F8F9FA] to-[#FFFFFF]`
- **Border**: `border border-gray-100`
- **Hover Border**: `hover:border-gray-200`
- **Border Radius**: `rounded-[var(--radius-brand)]` (32px)
- **Shadow**: `shadow-sm hover:shadow-md`
- **Transition**: `transition-all duration-300`

### FAQ Question
- **Font Size**: `text-[16px]` mobile, `md:text-[18px]` desktop
- **Font Weight**: `font-semibold`
- **Color**: `text-slate-900`
- **Leading**: `leading-relaxed`
- **Font Family**: `font-ui`

### FAQ ChevronDown Icon
- **Size**: `w-5 h-5`
- **Stroke Width**: `stroke-[1.5]`
- **Color**: `text-slate-400` (idle), `rotate-180 text-slate-900` (open)
- **Transition**: `transition-all duration-300`

### FAQ Answer
- **Padding**: `px-6 md:px-8 pb-5 md:pb-6 pt-2`
- **Font Size**: `text-[14px]` mobile, `md:text-[16px]` desktop
- **Font Weight**: `font-normal`
- **Color**: `text-slate-600`
- **Leading**: `leading-relaxed`
- **Font Family**: `font-ui`

---

## 6. SPREAD THE WORD SECTION (`spread-the-word.tsx`)

### Section Container
- **Background**: `bg-[#ECF6FF]`
- **Padding**: `py-16` mobile, `md:py-[64px]` desktop
- **Height (Desktop)**: `md:h-[557px]`
- **Container**: `max-w-[1440px] mx-auto px-6 md:px-12`

### Section Header
- **Margin Bottom**: `mb-8`
- **Max Width**: `max-w-3xl mx-auto`
- **Gap**: `gap-3`

### H2 Heading
- **Font Size**: `text-[32px]` mobile, `md:text-[42px]` desktop
- **Font Weight**: `font-medium`
- **Tracking**: `tracking-tight` mobile, `md:tracking-[0.03em]` desktop
- **Leading**: `leading-tight` mobile, `md:leading-[52.5px]` desktop
- **Font Family**: `font-gelasio`
- **Color**: `text-slate-900`

### Subtext
- **Font Size**: `text-[16px]` mobile, `md:text-[18px]` desktop
- **Font Weight**: `font-normal`
- **Leading**: `md:leading-[29.3px]` desktop
- **Tracking**: `md:tracking-[-0.44px]` desktop
- **Color**: `text-gray-600`
- **Font Family**: `font-ui`

### Material Card
- **Width**: `w-full` mobile, `md:w-[790px]` desktop
- **Height**: `md:h-[252px]` desktop
- **Background**: `bg-[#000000]`
- **Border**: `border border-white/10`
- **Border Radius**: `rounded-[24px]` mobile, `md:rounded-[40px]` desktop
- **Shadow**: `shadow-[0_20px_50px_rgba(0,0,0,0.3)]`
- **Padding**: `py-12 px-6` mobile, `md:px-8` desktop

### Message Text
- **Padding**: `px-4` mobile, `md:px-10` desktop
- **Margin Bottom**: `mb-8`
- **Font Size**: `text-[16px]` mobile, `md:text-[18px]` desktop
- **Font Weight**: `font-normal`
- **Color**: `text-white/90`
- **Leading**: `leading-relaxed`
- **Font Family**: `font-ui`

### Social Buttons Container
- **Direction**: `flex-col` mobile, `md:flex-row` desktop
- **Gap**: `gap-3` mobile, `md:gap-4` desktop

### Social Buttons
- **Width**: `w-full max-w-[320px]` mobile, `md:w-auto` desktop
- **Padding**: `px-8 py-2.5`
- **Border Radius**: `rounded-full`
- **Font Size**: `text-[13px]`
- **Color**: `text-white`
- **Border**: `border !border-white`
- **Background**: `bg-transparent`
- **Hover Background**: `hover:!bg-white`
- **Hover Text**: `hover:!text-black`
- **Transition**: `transition-all duration-300`
- **Gap**: `gap-2`
- **Icon Size**: `w-[14px] h-[14px]`

---

## 7. PRE-FOOTER SECTION (`pre-footer.tsx`)

### Section Container
- **Padding**: `px-6 md:px-20`

### Content Wrapper
- **Padding**: `py-32 px-20`
- **Z-Index**: `z-10` (relative)

### H3 Heading
- **Font Size**: `text-[28px]` mobile, `md:text-[36px]` desktop
- **Font Weight**: `font-medium`
- **Color**: `text-slate-900`
- **Tracking**: `tracking-tight`
- **Leading**: `leading-tight`

### Subtext
- **Margin Top**: `mt-6`
- **Font Size**: `text-[16px]` mobile, `md:text-[20px]` desktop
- **Color**: `text-slate-900/60`
- **Text Transform**: `lowercase`
- **Tracking**: `tracking-wide`
- **Font Style**: `italic`
- **Leading**: `leading-relaxed`

### Background Image
- **Opacity**: `opacity-10`

---

## 8. FOOTER COMPONENT (`footer.tsx`)

### Section Container
- **Background**: `bg-black`
- **Color**: `text-[#fafafa]`
- **Padding Bottom**: `pb-10`

### Main Content Container
- **Container**: `max-w-7xl mx-auto px-6 lg:px-12`
- **Padding Top**: `pt-16`
- **Padding Bottom**: `pb-12`

### Columns Layout
- **Direction**: `flex justify-between` mobile, `md:justify-start md:gap-20 lg:gap-32` desktop
- **Right Group**: `md:ml-auto` (pushes to right edge on desktop)

### Column Headers (H4)
- **Font Size**: `text-[10px]`
- **Font Weight**: `font-bold`
- **Text Transform**: `uppercase`
- **Tracking**: `tracking-[0.2em]`
- **Color**: `text-white opacity-50`
- **Margin Bottom**: `mb-4`
- **Font Family**: `font-ui`

### Column Links
- **Font Size**: `text-[14px]`
- **Color**: `text-slate-300`
- **Hover Color**: `hover:text-white`
- **Transition**: `transition-colors duration-200`
- **Spacing**: `space-y-3`

### Mobile Alignment
- **Column 1**: `items-start text-left`
- **Right Group**: `items-end text-right` mobile, `md:items-start md:text-left` desktop
- **Gap**: `gap-10` mobile, `md:gap-20 lg:gap-32` desktop

### Bottom Bar
- **Container**: `max-w-7xl mx-auto px-6 lg:px-12`
- **Border**: `border-t border-white/10`
- **Padding Top**: `pt-8`
- **Margin Top**: `mt-0`
- **Layout**: `flex justify-between`
- **Font Size**: `text-[12px]`
- **Color**: `text-slate-500`

### Admin Link
- **Font Size**: `text-[10px]`
- **Color**: `text-slate-500`
- **Hover Color**: `hover:text-white`
- **Transition**: `transition-colors`

---

## GLOBAL DESIGN TOKENS

### Golden Gutter System
- **Hero Container**: `max-w-7xl mx-auto px-6 lg:px-12`
- **Footer Container**: `max-w-7xl mx-auto px-6 lg:px-12`
- **Marquee Container**: `max-w-7xl mx-auto px-6 md:px-12`
- **Header Container**: `max-w-[1440px] mx-auto px-6 md:px-12`
- **How It Works**: `max-w-[1440px] mx-auto px-6 md:px-20`
- **FAQ**: `max-w-[1440px] mx-auto px-6 md:px-20`
- **Spread the Word**: `max-w-[1440px] mx-auto px-6 md:px-12`
- **Pre-Footer**: `px-6 md:px-20`

### Border Radius System
- **Brand Radius**: `var(--radius-brand)` = `32px`
- **Card Radius**: `var(--radius-card)` = `40px`
- **Button Radius**: `rounded-full` (infinite) or `rounded-[32px]`

### Font Families
- **Heading**: `font-gelasio` (Gelasio) or `font-instrument` (Instrument Sans)
- **UI/Body**: `font-ui` (Inter)
- **Branding**: `'Instrument Sans', sans-serif`

### Section Spacing (Vertical)
- **Mobile**: `py-14` (56px) or `py-16` (64px)
- **Desktop**: `md:py-[100px]` (100px) or `md:py-[64px]` (64px)
- **FAQ Bottom Buffer**: `pb-32` (128px)

### Typography Hierarchy
- **Main H1**: `32-48px` (responsive)
- **Section H2**: `28-36px` or `32-42px` (responsive)
- **Subheading**: `16-20px` (responsive)
- **Body**: `14-16px` (responsive)
- **Small**: `12-13px` (responsive)

### Color Palette
- **Primary Background**: `#F9FCD4` (Hero Yellow)
- **Secondary Background**: `#ECF6FF` (Spread the Word Blue)
- **Tertiary Background**: `#FDFFD7` (Video Container)
- **Card Background**: `#F8F9FA` (Steps/FAQ)
- **Black**: `#000000`
- **White**: `#FFFFFF` or `#fafafa`
- **Ukrainian Blue**: `#0057B7`
- **Brand Blue**: `#003E82`, `#3C93EA`, `#D3E4FD`
- **Text Primary**: `text-slate-900`
- **Text Secondary**: `text-slate-600`
- **Text Tertiary**: `text-slate-400` or `text-slate-500`
- **Border**: `border-gray-100`, `border-slate-50`, `border-white/10`

### Transition Standards
- **Fast**: `duration-200`
- **Standard**: `duration-300`
- **Slow**: `duration-500`
- **Easing**: `ease-out`, `ease-in-out`, `cubic-bezier(0.4, 0, 0.2, 1)`

---

## NOTES

1. **Golden Gutter Variance**: Most sections use `max-w-7xl` (1280px), but Header uses `max-w-[1440px]` for full-width feel.
2. **Padding Variance**: Desktop horizontal padding varies: `lg:px-12`, `md:px-12`, `md:px-20` depending on section.
3. **Font Sizes**: Progressive enhancement from mobile to desktop with breakpoints at `391px`, `md` (768px), and `1440px`.
4. **Spacing Rhythm**: Base unit appears to be 4px (Tailwind default), with common values: 12px (gap-3), 24px (gap-6/mb-6), 32px (gap-8), 40px (mb-10), 48px (gap-12).
5. **Button Heights**: Consistent at 46px mobile, with some at 52px desktop for primary CTAs.

---

*End of Specification*
