# Weekly Routine Planning Website - Design Guidelines

## Design Approach

**Selected Approach:** Design System (Linear + Material Design Hybrid)

**Justification:** This is a utility-focused productivity application with information-dense content (tables, charts, tracking data). Users need efficiency, clarity, and consistent patterns. Drawing from Linear's clean productivity aesthetics combined with Material Design's data table excellence.

**Core Principles:**
- Information clarity over decoration
- Scannable data hierarchies
- Purposeful whitespace for breathing room
- Consistent interaction patterns across all tracking elements

## Typography System

**Font Stack:** 
- Primary: Inter (Google Fonts) - excellent for data tables and UI
- Monospace: JetBrains Mono (for numerical data/counts)

**Hierarchy:**
- Page Title: 2xl font, semibold weight
- Section Headers: xl font, semibold weight  
- Table Headers: base font, medium weight, uppercase tracking
- Body/Data: base font, regular weight
- Captions/Labels: sm font, medium weight
- Numerical Data: Monospace font for alignment

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, and 8 consistently
- Component padding: p-4 to p-6
- Section gaps: gap-6 to gap-8
- Page margins: p-6 on mobile, p-8 on desktop
- Table cell padding: p-3

**Grid Structure:**
- Desktop: 3-column layout (1fr 2fr 1fr) for consistency chart | routine table | screen time
- Mobile: Single column stack (consistency → routine table → screen time → insights)
- Max container width: max-w-7xl centered

## Component Library

### Weekly Routine Table (Center Focus)
- Clean bordered table with subtle cell borders
- Header row with day names (Mon-Sun) + "Routine" column
- 10 routine rows with editable routine names (pencil icon on hover)
- Interactive cells with three states:
  - Empty: subtle border, clickable area
  - Completed (✔): checkmark icon, filled background
  - Not Completed (✖): X icon, different filled treatment
- Bottom summary row: bolded text showing "X/10 completed" per day
- Rounded corners on table container
- Fixed table layout for consistent cell sizing

### Consistency Visualization (Left Sidebar)
- Vertical bar chart or heatmap grid
- 7 bars/boxes representing Mon-Sun
- Height/intensity indicates completion percentage
- Axis labels for days
- Legend showing completion scale
- Card container with rounded corners and border

### Screen Time Tracker (Right Sidebar)
- Compact table format: Day | Hours
- Input fields for daily hour entry
- Total weekly hours at bottom
- Same visual treatment as routine table (borders, spacing)
- Card container matching consistency chart

### Performance Insights Section
- Positioned below main 3-column layout (full width)
- Grid of insight cards: 2-3 columns on desktop, stack on mobile
- Each card shows:
  - Icon representing metric type
  - Large numerical value (monospace font)
  - Descriptive label below
  - Supporting context text
- Cards include: Best Week, Best Day, Most Consistent Day, Average Consistency, Trend Indicator
- Subtle elevation/border on cards

### History Navigation
- Positioned above routine table as compact toolbar
- Previous/Next week buttons (arrow icons)
- Current week label centered (e.g., "Week of Jan 1-7, 2024")
- "View All Weeks" dropdown/modal trigger
- Readonly indicator when viewing past weeks (subtle banner or icon)

### Navigation/Header
- Top app bar with minimal height
- App title/logo left-aligned
- Current/selected week indicator center
- History access button right-aligned
- Subtle bottom border separation

## Interaction Patterns

**Cell Click Behavior:**
- Single click cycles: Empty → ✔ → ✖ → Empty
- Smooth micro-transition between states (100ms)
- Clear visual feedback on active state

**Week Transitions:**
- Smooth content fade when switching weeks (200ms)
- Loading state for history retrieval
- Clear visual distinction between current (editable) and past (readonly) weeks

**Responsive Breakpoints:**
- Mobile: < 768px (single column stack)
- Tablet: 768px - 1024px (2-column: routine table + sidebar)
- Desktop: > 1024px (full 3-column layout)

## Accessibility
- WCAG AA contrast ratios minimum
- Keyboard navigation for table cells (arrow keys)
- Focus indicators on all interactive elements
- Screen reader labels for icon-only buttons
- ARIA labels for table structure and data cells

## Images
**No hero image required** - this is a data-focused productivity tool where immediate access to the tracking table is priority. Users should land directly into their weekly routine view without visual preamble.

## Visual Treatment Notes
- Borders: 1px subtle stroke, rounded corners (rounded-lg for cards, rounded-md for tables)
- Shadows: Minimal - only on elevated cards (shadow-sm)
- Icons: Use Heroicons (outline style for UI, solid for status indicators)
- Density: Comfortable spacing in tables - prioritize scannability over compactness
- States: Subtle hover states on interactive elements, clear active/selected states