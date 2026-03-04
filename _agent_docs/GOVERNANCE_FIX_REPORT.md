# DESIGN SYSTEM GOVERNANCE FIX

**Date**: 2026-02-02
**Status**: ✅ COMPLETE

---

## 🎯 **CRITICAL FIXES**

### 1. **HERO CTA STABILIZATION**
**File**: `client/src/components/hero.tsx`
-   **Bug Fixed**: Removed unstable `hover:bg-black` that was causing potential conflicts or "white flash".
-   **Solution**: Applied `hover:bg-black/90` to create a subtle, premium opacity shift while maintaining the black brand color.
-   **Font Normalization**: Hard-coded `text-[16px]` to ensure pixel-perfect parity with the Prefooter CTA, eliminating `text-base` browser variability.

### 2. **SYSTEM ALIGNMENT**
-   **Result**: The Hero "Explore" button now behaves identically to the "Go to the Map" button in the Community Impact section. Consistency restored.
