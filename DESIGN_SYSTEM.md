# DESIGN SYSTEM - SOURCE OF TRUTH (Steve Jobs Edition)

This document is the absolute authority for all design, user interface, and interaction decisions for the **BuyUkrainian** project. Violating these rules is strictly forbidden.

---

## 1. Core Philosophy: "Premium or Nothing"
We do not build generic "websites." We build tactile, immersive experiences. Every interaction must feel intentional, fluid, and high-value.
- **No Rectangles**: Avoid sharp, default bounding boxes.
- **No Jitter**: Animations must be smooth (`cubic-bezier` or `ease-out`).
- **No Flash**: Do not use distracting flashes or jarring color shifts.

---

## 2. Interaction & Focus (Critical Compliance)

### 🚫 The Forbidden Style
- **`outline` property**: NEVER use the default browser outline (the "blue rectangle") for `:focus` or `:hover`. It is "tacky" and violates the premium aesthetic.
- **Static Borders**: Do not use hard 1px borders on hover unless explicitly styled as part of a specific "Ghost Button" variant.

### ✅ The "Monochrome Purity" Hover Standard (Updated)
All text links and secondary actions must follow this blueprint:
1.  **Color Stability**: Text remains deeply saturated (Slate-800 or Black). **NO BLUE TEXT**.
2.  **Micro-Zoom**: A subtle `transform: scale(1.02)` to signal "lift."
3.  **Elegant Black Underline**: A 1px solid line that:
    -   Starts invisible (`scale-x-0`).
    -   Expanding smoothly (`scale-x-100`) on hover from the center.
    -   Has a `bottom` offset of at least **4px** to clear letter descenders.
    -   **CSS Example**:
        ```css
        .flagship-link {
          position: relative;
          color: #1f2937; /* Slate-800 */
          transition: transform 0.2s ease-in-out;
        }
        .flagship-link:hover {
          transform: scale(1.02);
        }
        .flagship-link::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 1px;
          bottom: 0px; /* Offset handled by padding or positioning */
          left: 0;
          background-color: currentColor; /* Matches Text (Black) */
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.2s ease-in-out;
        }
        .flagship-link:hover::after {
          transform: scaleX(1);
        }
        ```

### ✅ The "Premium Focus" Standard
For accessibility, we replace the ugly outline with a soft, rounded glow:
-   **Shadow**: `box-shadow: 0 0 0 4px rgba(197, 224, 245, 0.6)` (Soft Blue Halo).
-   **Radius**: Always match the element's border radius (e.g., `rounded-full` buttons must have pill-shaped focus rings).

---

## 3. Typography & Fluidity (Inter Scale)

### 🚫 No Static Pixels
Do not hardcode font sizes like `32px` or `48px` for main headings.

### ✅ Fluid Logic (Scale)
-   **H1 (Hero)**: `48px - 64px` (Fluid), Bold, `-0.02em` tracking.
-   **H2 (Section Titles)**: `32px`, Semibold, `-0.01em` tracking.
-   **Body Text**: `16px`, Regular, `0px` tracking.
-   **Slogan/Manifesto**: `18px - 20px`, Regular, Strictly `normal` letter-spacing.
-   **Buttons/Links**: `16px`, Medium, `0.3px` tracking.

---

### ✅ Universal Interaction Standard (.btn-premium)
-   **Mandate**: All interactive elements must use the `.btn-premium-action` standard. **No manual font-weight or size overrides allowed.**
-   **Font**: Inter
-   **Size**: `16px`
-   **Letter Spacing**: `0.3px`
-   **Weight**: Medium (500)
-   **Padding**: `px-8, py-3`
-   **Hover**: Transition weight to Semibold (600), scale `1.02`.
-   **Stats Labels**: adhere to this same typographic standard (Inter 16/0.3/500).

---

## 4. The Smart Header Standard (Apple Glass)
-   **Behavior**: Sticky on all pages (`sticky top-0`).
-   **Start**: Transparent.
-   **Scroll (>50px)**: Transition to **Frosted Glass**.
    -   **Background**: `rgba(251, 251, 251, 0.8)` (Alabaster @ 80%).
    -   **Blur**: `backdrop-filter: blur(12px)`.
    -   **Border**: 1px subtle bottom border `rgba(0,0,0,0.05)`.
    -   **Transition**: `all 0.4s ease`.

---

## 5. Color Palette

### The "Natural Canvas" Palette
-   **Canvas (Background)**: `#FBFBFB` (Alabaster Off-White) - Crisper, more premium than beige.
-   **Surface (Cards)**: `#FFFFFF` (Pure White) - Used for elevated elements.
-   **Water**: `#C5E0F5` (Fresh, Optimistic Blue)
-   **Text**: `#111827` (Onyx / Slate-900) - Never pure black `#000000` on white.
-   **Muted Text**: `#4B5563` (Slate-600) - For labels and secondary copy.
-   **Brand Accent**: `#2563EB` (Royal Blue) - For primary interactions.

---

## 5. Component Specifics

### Interactive Text & Buttons (The "Inter 16" Standard)
-   **Font**: Inter
-   **Size**: `16px`
-   **Letter Spacing**: `0.3px`
-   **Weight**: Medium (500)
-   **Hover**: Transition to Semibold (600) for tactile feedback.
-   **Slogans**: Never use wide letter-spacing. Use `normal` or tight tracking for readability.

### Buttons
-   **Primary**: Solid Black (`#000`), White Text, Pill Shape (`rounded-full`).
    -   Hover: Lift (`translateY(-2px)`), Weight Shift (500->600).
-   **Secondary/Ghost**: No background/border initially.
    -   Hover: Text color shift + Expanding Underline.

### Inputs
-   **Height**: Minimum `46px` (Touch Target compliant).
-   **State**: No ring outlines. Use a subtle border color shift (`border-gray-300` → `border-blue-500`) on focus.

### Proximity Grouping (Law of Common Region)
-   **Grouping**: Related elements (e.g., Image + Title + Text) must be visually grouped.
-   **Spacing**: The space *inside* a group must be significantly smaller than the space *between* groups.
-   **Invisible Boxes**: Use subtle background tints (e.g., `#FBFBFA`) and soft radii (`12px`) to create implicit containers without harsh borders.

---

## 6. Implementation Checklist
Before marking any UI task as "Done", verify:
1.  [ ] Did I remove the default outline?
2.  [ ] Does the hover state feel "soft" (no sharp jumps)?
3.  [ ] Is the typography using `clamp()` logic?
4.  [ ] Are the colors exact matches to the palette above?
5.  [ ] Does it look like a premium app (Airbnb/Apple), not a template?

**Instruction**: Read this file before ANY style changes.
