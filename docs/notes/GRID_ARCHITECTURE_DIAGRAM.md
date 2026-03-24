# Video Grid Architecture Diagram

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                     VideoRoom Component                     │
│                  (Main orchestration)                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
         ┌─────────┼─────────┐
         │         │         │
         ▼         ▼         ▼
    ┌─────────┐ ┌──────────────┐ ┌─────────────┐
    │ Header  │ │  Responsive  │ │  Sidebar    │
    │ (Fixed) │ │ VideoGrid    │ │ (Desktop)   │
    └─────────┘ │              │ └─────────────┘
                │ CSS Grid     │
                │ ┌──────────┐ │
                │ │Tile 1    │ │ ┌─────────────┐
                │ │16:9      │ │ │ FloatingBar │
                │ └──────────┘ │ │  (Controls) │
                │ ┌──────────┐ │ │  (Fixed)    │
                │ │Tile 2    │ │ └─────────────┘
                │ │16:9      │ │
                │ └──────────┘ │
                │ ┌──────────┐ │
                │ │Tile N    │ │
                │ │16:9      │ │
                │ └──────────┘ │
                │ (scrollable) │
                └──────────────┘
```

## Participant Tile Structure

```
┌─────────────────────────────────────────┐
│  ParticipantTile Component              │
│  ┌───────────────────────────────────┐  │
│  │       Video Stream (16×9)         │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │                             │  │  │
│  │  │   Camera Feed or            │  │  │
│  │  │   Placeholder               │  │  │
│  │  │                             │  │  │
│  │  └─────────────────────────────┘  │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │ Gradient Overlay            │  │  │
│  │  │ (for text readability)      │  │  │
│  │  └─────────────────────────────┘  │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │ Dr. John Smith     🔇 📷 🎤 │  │  │
│  │  │ Doctor                      │  │  │
│  │  └─────────────────────────────┘  │  │
│  │                                   │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │ Green ring when speaking    │  │  │
│  │  │ Scale animation 1.02x       │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Grid Algorithm Flow

```
┌─────────────────────────────────┐
│  Participant Count Changes      │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ getGridConfiguration(count)     │
│─────────────────────────────────│
│  if (count === 1)               │
│    return { cols: 1, rows: 1 }  │
│  else if (count === 2)          │
│    return { cols: 2, rows: 1 }  │
│  else if (count <= 4)           │
│    return { cols: 2, rows: 2 }  │
│  else if (count <= 6)           │
│    return { cols: 3, rows: 2 }  │
│  ... (and so on)                │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ getResponsiveGridCols(count)    │
│─────────────────────────────────│
│ Returns Tailwind classes:       │
│ "grid-cols-2 sm:grid-cols-3     │
│  lg:grid-cols-4"                │
│                                 │
│ Mobile: 1-2 columns             │
│ Tablet: 2-3 columns             │
│ Desktop: 2-4 columns            │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ Render CSS Grid                 │
│─────────────────────────────────│
│ <div className="grid            │
│      gap-2 sm:gap-3 lg:gap-4    │
│      grid-cols-X ...">           │
│   {tiles.map(...)}              │
│ </div>                          │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ Render Result:                  │
│ ✅ Optimal grid layout          │
│ ✅ No overflow                  │
│ ✅ All videos visible           │
│ ✅ Responsive on all devices    │
└─────────────────────────────────┘
```

## Responsive Breakpoint System

```
┌─────────────────────────────────────────────────────────────┐
│                    Screen Width                             │
├─────────────────┬─────────────────┬───────────────────────┤
│  < 640px        │ 640px - 1024px  │    > 1024px           │
│  (Mobile)       │  (Tablet)       │    (Desktop)          │
├─────────────────┼─────────────────┼───────────────────────┤
│                 │                 │                       │
│  1-2 columns    │  2-3 columns    │  2-4 columns (full)   │
│  Compact gaps   │  Medium gaps    │  Large gaps           │
│  Small text     │  Normal text    │  Large text           │
│  xs/sm icons    │  sm icons       │  sm/lg icons          │
│  Stacked layout │  Semi-wide      │  Fully expanded       │
│                 │                 │                       │
└─────────────────┴─────────────────┴───────────────────────┘

Example for 6 participants:

Mobile              Tablet              Desktop
(360px)            (768px)             (1440px)
─────────────      ─────────────       ──────────────────
│  1  │  3  │      │  1  │  2  │      │  1  │  2  │  3  │
├─────┼─────┤      │─────┼─────┤      ├──────┼──────┼──────┤
│  2  │  4  │      │  3  │  4  │      │  4  │  5  │  6  │
├─────┼─────┤      │─────┼─────┤      ├──────┼──────┼──────┤
│  5  │  6  │      │  5  │  6  │
─────────────      ─────────────
(scrolls)
```

## Data Flow

```
VideoContext (useVideoContext)
│
├─ participants[]
│  ├─ id
│  ├─ name
│  ├─ role
│  ├─ micOn (boolean)
│  ├─ cameraOn (boolean)
│  └─ isSpeaking (boolean)
│
├─ call (Stream SDK)
│
└─ client (Stream SDK)
    │
    ▼
ResponsiveVideoGrid
    │
    ├─ getGridConfiguration()
    │  └─ → { cols, rows }
    │
    ├─ getResponsiveGridCols()
    │  └─ → CSS classes
    │
    └─ ParticipantTile (repeating)
        └─ ParticipantView (Stream SDK)
```

## CSS Grid Layout Example

```
For 4 participants (2×2 grid):

┌──────────────────────────────────────┐
│  CSS Grid Container                  │
│  ├─ grid-template-columns: repeat(   │
│  │    2, 1fr)  ← 2 equal columns     │
│  ├─ grid-auto-rows: minmax(0, 1fr)   │
│  │    ← auto height, prevent overflow│
│  └─ gap: 12px  ← space between tiles │
│                                      │
│  ┌─────────────┬─────────────┐       │
│  │  Tile 1     │  Tile 2     │       │
│  │  1fr width  │  1fr width  │       │
│  │  auto height│  auto height│       │
│  ├─────────────┼─────────────┤       │
│  │  Tile 3     │  Tile 4     │       │
│  │  1fr width  │  1fr width  │       │
│  │  auto height│  auto height│       │
│  └─────────────┴─────────────┘       │
│                                      │
│  Result: Perfectly equal 2×2 grid    │
└──────────────────────────────────────┘
```

## Performance Architecture

```
┌────────────────────────────────────────┐
│        Performance Optimization        │
├────────────────────────────────────────┤
│                                        │
│  CSS Grid Rendering                   │
│  ├─ GPU Accelerated ✅                │
│  ├─ No JavaScript layout ✅           │
│  └─ 60fps reflow capability ✅        │
│                                        │
│  Memoization                          │
│  ├─ ParticipantTile memoized          │
│  ├─ Re-renders only when              │
│  │  participant data changes          │
│  └─ Status updates isolated ✅        │
│                                        │
│  CSS Animations                       │
│  ├─ GPU rendered (border, scale)      │
│  ├─ No JavaScript calculation         │
│  └─ Smooth 60fps ✅                   │
│                                        │
│  Container Optimization               │
│  ├─ Fixed positioning for             │
│  │  header/controls (no reflow)       │
│  ├─ Absolute grid (no layout impact)  │
│  └─ Efficient z-stacking              │
│                                        │
└────────────────────────────────────────┘
```

## Feature Implementation Map

```
┌──────────────────────────────────────────────────────────────┐
│                    Video Tile Features                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Video Display          Status Indicators                   │
│  ─────────────          ──────────────                      │
│  • ParticipantView      • Microphone: 🔇 (red)             │
│  • 16:9 aspect ratio    • Camera: 📷 (red)                 │
│  • Gradient overlay     • Speaking: 🎤 (green)            │
│  • Smooth fit-cover     • Animated pulse                    │
│                                                              │
│  Active Speaker         Information Badge                   │
│  ───────────────        ──────────────                      │
│  • Green ring           • Participant name                  │
│  • 3px border           • Role (doctor/patient)             │
│  • Scale 1.02x          • Responsive text                   │
│  • Pulse animation      • Bottom-left position              │
│                                                              │
│  Animations             Interactions                        │
│  ──────────             ────────────                        │
│  • Fade-in (join)       • Hover: border brightness          │
│  • Zoom-in (join)       • Hover: shadow increase            │
│  • Staggered (50ms)     • Hover: subtle scale               │
│  • Bounce (speaking)    • Smooth transitions                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Responsive Design Cascade

```
Mobile First Approach
     ↓
┌────────────────────────────────────┐
│ Base CSS Classes (Mobile)          │
│ gap-2, px-3, pb-28                 │
│ grid-cols-2 (max 2 cols)           │
│ text-xs (small fonts)              │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│ sm: Tablet (640px+)                │
│ sm:gap-3, sm:px-4, sm:pb-36        │
│ sm:grid-cols-3 (3 cols)            │
│ sm:text-sm (normal fonts)          │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│ lg: Desktop (1024px+)              │
│ lg:gap-4, lg:px-6, lg:pb-40        │
│ lg:grid-cols-4 (4 cols)            │
│ lg:text-base (large fonts)         │
└────────────────────────────────────┘

Result: One CSS file → Three layouts = Efficiency 🚀
```

---

## Summary

✅ **Grid Algorithm**: Dynamic calculation for any participant count  
✅ **Responsive Design**: Mobile-first approach with breakpoints  
✅ **Performance**: CSS Grid (GPU) + Memoization (React)  
✅ **User Experience**: Smooth animations + visual feedback  
✅ **Accessibility**: Semantic HTML + proper contrast  
✅ **Browser Support**: Modern browsers 90+

**Result**: Production-ready, professional video grid! 🎉
