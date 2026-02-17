# Belt Previewer Architecture Audit

## 1. Component Tree

```
belt-wizard              (root, light DOM — no shadow DOM)
├── belt-preview         (shadow DOM, Lit custom element)
│   └── cropper.ts       (helper: cropToContents — trims transparent pixels)
└── belt-checkout        (shadow DOM, Lit custom element)

Utility functions (not components):
├── icon()               (renders Material icons)
├── renderLoader()       (animated loading indicator)
├── textOption()         (radio button for text choices)
└── thumbnailOption()    (radio button with product thumbnail)
```

**Total Lit custom elements:** 3 (`belt-wizard`, `belt-preview`, `belt-checkout`)

### Data Flow

```
User selection (FormData in belt-wizard)
        │
        ▼
applySelectionToPreview()
        │
        ▼  (property binding)
belt-preview receives:
  .base     = image URL (belt strap)
  .buckle   = image URL
  .tip      = image URL
  .loops    = string[] of image URLs
  .conchos  = string[] of image URLs
  .buckleOnTop   = boolean (from product tag "top")
  .isRangerCore  = boolean (from product tag "Ranger Core")
        │
        ▼  (events bubble up)
belt-preview dispatches:
  reorder-loops   { fromIndex, toIndex }
  reorder-conchos { fromIndex, toIndex }
  remove-loop     { index }
  remove-concho   { index }
        │
        ▼
belt-wizard updates FormData → re-applies to preview
```

**State owner:** `belt-wizard.selection` (FormData) is the single source of truth.

---

## 2. Positioning Logic Catalog

### Container Structure (inside shadow DOM)

```
:host                            width: 100%; display: block
└── .height-wrapper              height: scaledHeight px
    └── .scale-wrapper           width: REF_WIDTH px; transform: scale(scaleFactor); transform-origin: top left
        └── .base-wrapper        position: relative; margin-left: 7%; margin-right: 6%
            ├── <canvas #base>   width: 100%; position: relative
            ├── <img #buckle>    position: absolute (center-vertically)
            ├── <div #loops>     position: absolute (center-vertically), display: flex
            │   └── .loop-item   width: 40px; height: 100%; margin-right: -20px
            │       └── .loop    max-height: 400%; pointer-events: none
            ├── <div #conchosList>  position: absolute (center-vertically), display: flex
            │   └── .concho-wrapper  max-height: 200px; max-width: 50px; overflow: hidden
            │       └── .concho      max-height: 200px; clip-path: inset(0 30% 0 30%); pointer-events: none
            └── <img #tip>       position: absolute (center-vertically)
```

### Responsive Scaling

| Viewport | activeRefWidth | scaleFactor | Behavior |
|----------|---------------|-------------|----------|
| > 991px (desktop) | 1200 (fixed) | containerWidth / 1200 | Fixed layout, CSS scale to fit |
| ≤ 991px (tablet/mobile) | actual width | 1.0 | Render at container width, no scaling |

### Accessory Positions (all relative to `.base-wrapper`)

| Accessory | Horizontal | Vertical | Height | Z-Index |
|-----------|-----------|----------|--------|---------|
| **Buckle** | `right: 90.5%` (normal) / `right: 89%` (Ranger Core); `left: auto` | `top: 50%; translateY(-50%)` | 400% | -1 (behind) or 10 (buckleOnTop / Ranger Core) |
| **Loops container** | `left: 1.8%` (normal) / `left: 5.6%` (Ranger Core) | `top: 50%; translateY(-50%)` | 100% | 10 |
| **Loop items** | flex children, 40px wide, 15px gap, -20px margin-right | centered in container | 100% of container | — |
| **Loop images** | — | — | max-height: 400% | — |
| **Conchos container** | `left: 18%; width: 50%` | `top: 50%; translateY(-50%)` | 100% | 10 |
| **Concho wrappers** | flex `space-between` distribution | centered | max-height: 200px | — |
| **Tip** | `right: -5%` | `top: 50%; translateY(-50%)` | 400% | 1 |

### Magic Numbers

- `.base-wrapper` margins: `7%` left, `6%` right
- Buckle right: `90.5%` / `89%`
- Loops left: `1.8%` / `5.6%`
- Conchos left: `18%`, width: `50%`
- Tip right: `-5%`
- Loop item width: `40px`, gap: `15px`, negative margin: `-20px`
- Concho wrapper: max `200px` tall, `50px` wide
- Concho clip-path: `inset(0 30% 0 30%)`
- Concho img scale: `5`
- Accessory heights: buckle/tip `400%`, loops `100%`, conchos `100%`

---

## 3. Belt Base Variants

### Current Differentiation

Belt bases are differentiated only by **product tags**:

| Tag | Effect on Positioning |
|-----|----------------------|
| `Ranger Core` | Buckle at `right: 89%` (vs 90.5%), loops at `left: 5.6%` (vs 1.8%) |
| `top` (on buckle product) | Buckle z-index: 10 (renders on top) |
| `1loop` | Limits max loops to 1 |
| `{N}mm` (e.g., `38mm`) | Width filter for compatible accessories |

There is **no per-base anchor metadata** — only the two-state "Ranger Core vs normal" toggle. All other belt bases share the same positions.

### Known Issue

Different belt bases produce different cropped image widths after `cropToContents()` trims transparent pixels. Since accessory positions are percentages of `.base-wrapper` (which always matches the canvas width), the same percentage maps to different physical points on different belt images. This is the root cause of misalignment across belt bases.

---

## 4. Zoom/Pan System

### How It Works

There is **no interactive zoom/pan controller**. The system uses **step-based CSS transforms** applied to the entire `<belt-preview>` element from outside (in the parent's light DOM CSS).

The wizard has 7 steps (indices 0–6):

| Index | Step ID | CSS Class | Focus Area |
|-------|---------|-----------|------------|
| 0 | base | `step-0` | Full belt (no transform) |
| 1 | size | `step-1` | Zoomed/panned to buckle end |
| 2 | buckle | `step-2` | Zoomed to buckle region |
| 3 | loops | `step-3` | Zoomed to loop region |
| 4 | conchos | `step-4` | Zoomed to middle |
| 5 | tip | `step-5` | Zoomed to tip end |
| 6 | summary | `step-6` | Full belt overview |

### Desktop Transforms (app.css)

```css
#preview belt-preview         { transition: transform 0.5s ease-in-out; left: -8px; }
#preview belt-preview.step-1  { transform: scale(1.5) translateX(130%);  transform-origin: left; }
#preview belt-preview.step-2  { transform: scale(2.5) translateX(14%);   transform-origin: left; }
#preview belt-preview.step-3  { transform: scale(2.5) translateX(12.5%); transform-origin: left; }
#preview belt-preview.step-4  { transform: scale(2) translateX(7.5%); }
#preview belt-preview.step-5  { transform: scale(1.5) translateX(-25%);  transform-origin: right; }
```

### Mobile Transforms (theme.css, `@media max-width`)

```css
#preview belt-preview.step-0  { transform: none !important; }
#preview belt-preview.step-1  { transform: scale(0.75) !important; }
#preview belt-preview.step-2  { transform: scale(2.5) translateX(15%) !important; transform-origin: left; }
#preview belt-preview.step-3  { transform: scale(1) !important; }
#preview belt-preview.step-4  { transform: scale(2.5) translateX(15%) !important; transform-origin: left; }
#preview belt-preview.step-5  { transform: scale(1) translateX(-5%) !important; }
#preview belt-preview.step-6  { transform: scale(1) translateX(-5%) !important; }
```

### Key Observation

The step transforms apply to the entire `<belt-preview>` host element. Since all accessories are children of `.scale-wrapper` → `.base-wrapper` inside the shadow DOM, they move as a single group with the belt base during step transitions. **This is correct** — accessories track the belt during zoom/pan.

There is a **double transform** situation on desktop:
1. Inner: `.scale-wrapper` scales from 1200px to fit container (`transform: scale(scaleFactor)`)
2. Outer: `#preview belt-preview.step-N` scales/translates for step focus

These compose correctly (inner scaling is part of the element's own rendering, outer transform is applied to the host).

---

## 5. Key Findings & Recommendations

### What Works
- Accessories are correctly grouped under the belt base's transform hierarchy
- The responsive scaling system (1200px ref + scale) handles desktop well
- Step transforms compose correctly with inner scaling
- Drag-and-drop reordering works within the flex containers

### What's Broken
1. **No per-base anchor system** — All non-Ranger-Core belts share identical percentage positions, but different belt images have different effective widths after cropping
2. **Percentage positions are relative to `.base-wrapper`** (which is always 87% of ref width) rather than relative to the belt image's actual content boundaries
3. **Magic numbers everywhere** — Position values are empirically tuned for one belt base and break on others
4. **Belt image width varies** — After `cropToContents()`, different belt base images produce different pixel widths, but the positioning system doesn't account for this

### Root Cause
The positioning assumes all belt bases have the same proportional layout (buckle attachment point at X%, tip at Y%). In reality, different belt styles have different proportions. The fix requires per-base anchor metadata.
