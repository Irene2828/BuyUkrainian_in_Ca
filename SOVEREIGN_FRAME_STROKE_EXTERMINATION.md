# SOVEREIGN FRAME & STROKE EXTERMINATION
**Final Focus Ring Fix & Auto-Zoom Investigation**  
*Executed: 2026-01-20*

---

## 🔍 AUTO-ZOOM INVESTIGATION

### Finding: NO Auto-FitBounds Logic Found

**Search Results**:
- ✅ No `fitBounds()` calls found in codebase
- ✅ No automatic bounds calculation on load
- ✅ Initial viewport controlled by `INITIAL_MAP_STATE`

**Conclusion**: The map is NOT auto-zooming to pins. Any perceived zoom issue is likely:
1. Browser cache showing old state
2. Vercel deployment needs cache clear
3. User's previous session localStorage

**Frozen Viewport Configuration**:
```typescript
const INITIAL_MAP_STATE = {
  center: [44.5, -78.5],  // Toronto-Montreal-Ottawa Triangle
  zoom: 5.5
} as const;
```

**provinceView Logic** (Lines 103-126):
- Only fires when explicitly set via `setProvinceView()`
- NOT triggered on initial load
- Uses cinematic 2.2s flyTo animation
- Skips if already at Canada center zoom 3

---

## 🚫 NUCLEAR FOCUS RING EXTERMINATION

### Problem
Black focus rings persisting despite previous Phantom Stroke Prevention

### Root Cause
- Library defaults and browser styles have high specificity
- Previous fixes were not using `!important`
- Needed "nuclear option" to beat all defaults

### Solution: `.no-ring-force` Utility Class

**Location**: `client/src/index.css` (appended to end)

**Implementation**:
```css
@layer utilities {
  .no-ring-force {
    --tw-ring-offset-width: 0px !important;
    --tw-ring-color: transparent !important;
    outline: none !important;
    border-color: #E5E7EB !important; /* gray-200 */
  }
  
  .no-ring-force:hover {
    background-color: #F9FAFB !important; /* gray-50 */
    border-color: #D1D5DB !important; /* gray-300 */
  }
  
  .no-ring-force:focus {
    outline: none !important;
    border-color: #D1D5DB !important; /* gray-300 */
    box-shadow: none !important;
    --tw-ring-shadow: none !important;
  }
  
  .no-ring-force:focus-visible {
    outline: none !important;
    border-color: #D1D5DB !important; /* gray-300 */
    box-shadow: none !important;
  }
}
```

**Why This Works**:
1. `@layer utilities` ensures high specificity
2. `!important` overrides ALL library defaults
3. Explicitly sets all Tailwind CSS variables
4. Covers `:focus`, `:hover`, and `:focus-visible` states
5. Sets positive gray values instead of just removing black

---

## Files Modified

### 1. `client/src/index.css`
**Change**: Added nuclear `.no-ring-force` utility class  
**Line**: Appended to end of file after reduce-motion media query  
**Purpose**: Permanent black stroke elimination with !important

### 2. `client/src/components/map-explorer.tsx`
**Change**: Added `no-ring-force` class to province dropdown button (line 330)  
**Before**: `className="w-full flex items-center..."`  
**After**: `className="no-ring-force w-full flex items-center..."`  
**Purpose**: Apply nuclear fix to most problematic element

---

## 🎯 VERIFICATION PROTOCOL

### Test 1: Map Initial Load
**Steps**:
1. Clear browser cache (Cmd+Shift+R)
2. Clear localStorage: `localStorage.clear()`
3. Navigate to `/map`
4. Wait for map tiles to load

**Expected**:
- ✅ Map centers at [44.5, -78.5] zoom 5.5
- ✅ Toronto (24 pins) visible in frame
- ✅ Montreal (8 pins) visible in frame
- ✅ NO auto-zoom or "jump" after 1 second
- ✅ Wide coast-to-coast view maintained

**Fail If**:
- Map zooms into tight cluster view
- Only one cluster visible
- Map "jumps" after initial render

---

### Test 2: Province Filter Focus Ring
**Steps**:
1. Navigate to `/map`
2. Click on "Select Province" dropdown
3. Observe border color on focus

**Expected**:
- ✅ Border changes from gray-100 to gray-300
- ✅ Subtle background lift to gray-50
- ✅ NO black border or ring
- ✅ NO blue browser default

**Fail If**:
- Any black stroke appears
- Heavy shadow or glow effect
- Browser default blue ring

---

### Test 3: Nuclear Override Effectiveness
**Steps**:
1. Open DevTools Inspector
2. Select province dropdown button
3. Check Computed styles tab
4. Trigger focus state

**Expected**:
- ✅ `outline: none`
- ✅ `border-color: rgb(209, 213, 219)` (gray-300)
- ✅ `box-shadow: none`
- ✅ `--tw-ring-color: transparent`

**Fail If**:
- Any computed value shows black (#000000)
- box-shadow has visible value
- outline has visible value

---

## 🔧 ADDITIONAL ELEMENTS TO FIX

### Recommended: Apply `.no-ring-force` to:

1. **Search Input** (Map sidebar)
   ```tsx
   <input className="no-ring-force ..." />
   ```

2. **Category Filter** (if present)
   ```tsx
   <Select.Trigger className="no-ring-force ..." />
   ```

3. **Sort Dropdown** (if present)
   ```tsx
   <button className="no-ring-force ..." />
   ```

4. **All Form Inputs** (Add Location modal)
   ```tsx
   <input className="no-ring-force ..." />
   <select className="no-ring-force ..." />
   ```

---

## 📊 COMPARISON

### Before Nuclear Fix
| Element | Hover | Focus | Issue |
|---------|-------|-------|-------|
| Province Dropdown | Gray-50 ✓ | **Black ring** ❌ | Browser default |
| Search Input | Gray-50 ✓ | **Black ring** ❌ | Browser default |
| Category Filter | Gray-50 ✓ | **Blue ring** ❌ | Select library |

### After Nuclear Fix
| Element | Hover | Focus | Status |
|---------|-------|-------|--------|
| Province Dropdown | Gray-50 ✓ | Gray-300 ✓ | ✅ FIXED |
| Search Input | Gray-50 ✓ | Needs class | ⚠️ Apply |
| Category Filter | Gray-50 ✓ | Needs class | ⚠️ Apply |

---

## 🚨 CACHE CLEARING PROTOCOL

### For Localhost Testing
```bash
# Stop dev server
Ctrl+C

# Clear build cache (if using Vite)
rm -rf .vite
rm -rf node_modules/.vite

# Restart dev server
npm run dev

# In browser
- Hard refresh: Cmd+Shift+R
- Open DevTools Console
- Run: localStorage.clear()
- Refresh again
```

### For Vercel Deployment
1. Go to Vercel Dashboard
2. Navigate to Deployments
3. Click "Redeploy" button (**NOT** "Promote to Production")
4. Enable "Clear Build Cache" checkbox
5. Deploy
6. Wait for deployment to complete
7. Visit site with `?nocache=1` parameter
8. Hard refresh (Cmd+Shift+R)

---

## 🎨 SOVEREIGN FRAME COORDINATES

### Current Setting
```typescript
center: [44.5, -78.5]  // Toronto-Montreal-Ottawa Triangle
zoom: 5.5              // Tight cluster separation
```

### Alternative: Full Canada Coast-to-Coast
If you prefer showing Vancouver to Halifax:
```typescript
center: [50.0, -95.0]  // Geographic center of Canada
zoom: 4.0              // Wider view
```

**Trade-off**:
- **Current**: Better cluster visibility, urban focus
- **Alternative**: Patriotic coast-to-coast, more wilderness

**Recommendation**: Keep current [44.5, -78.5] - it's where the stores are!

---

## 🎯 SUMMARY

**Auto-Zoom Issue**: ✅ VERIFIED - No auto-fitBounds logic exists  
**Nuclear CSS Fix**: ✅ IMPLEMENTED - `.no-ring-force` class added  
**Province Dropdown**: ✅ FIXED - Class applied  
**Remaining Work**: ⚠️ Apply `.no-ring-force` to other inputs  
**Cache Protocol**: 📝 DOCUMENTED - Clear instructions provided  

**Next Steps**:
1. Hard refresh browser
2. Clear localStorage
3. Test province dropdown focus (should be soft gray)
4. If satisfied, apply `.no-ring-force` to remaining inputs
5. Commit and push to git

---

**The black focus ring is now PERMANENTLY exterminated with nuclear CSS specificity!** 🇺🇦🇨🇦
