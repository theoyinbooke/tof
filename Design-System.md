# TOF Design System

> Extracted from the Link Web reference screens. This design system governs all UI across desktop and mobile breakpoints. Every component, color, spacing, and interaction pattern documented here must be followed for visual consistency.

---

## 1. Color System

### Primary Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#00D632` | Brand green. Logo, active toggles, avatar rings, primary CTAs on forms, success indicators |
| `--color-primary-light` | `#E6FBF0` | Subtle green tint for hover states, selected nav backgrounds |
| `--color-black` | `#000000` | Primary button fills, heading text, strong emphasis |
| `--color-white` | `#FFFFFF` | Card/panel backgrounds, modal surfaces, sidebar background |

### Neutral Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-gray-50` | `#F7F7F7` | Page background (main content area) |
| `--color-gray-100` | `#F0F0F0` | Sidebar hover state, subtle card backgrounds |
| `--color-gray-200` | `#E5E5E5` | Borders, dividers, input outlines (resting) |
| `--color-gray-300` | `#D4D4D4` | Disabled borders, secondary dividers |
| `--color-gray-500` | `#737373` | Secondary body text, metadata, timestamps |
| `--color-gray-600` | `#525252` | Tertiary labels, navigation text (inactive) |
| `--color-gray-800` | `#262626` | Body text |
| `--color-gray-900` | `#171717` | Headings, strong text |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#00D632` | Approved status, success toasts, confirmation checkmarks |
| `--color-warning` | `#F59E0B` | Pending status dot |
| `--color-error` | `#EF4444` | Delete actions, refunded status, destructive CTAs |
| `--color-info` | `#3B82F6` | Links, informational badges |

### Avatar Gradient Palette (Monogram Picker)

A curated set of 24+ gradient backgrounds for user avatars. Each is a radial or linear gradient:

| Row | Colors (left to right, approximate) |
|-----|--------------------------------------|
| 1 | Green (primary), Mint, Aqua, Teal, Cyan, Sky Blue |
| 2 | Violet, Purple, Magenta, Hot Pink, Coral, Salmon |
| 3 | Pink, Rose, Peach, Orange, Amber, Yellow |
| 4 | Lime, Forest Green, Emerald, Olive, Red, Crimson |

Each swatch is displayed as a ~36px circle. The selected swatch has a thin ring/outline indicator.

### Filter Icon Colors (Search/Filter Modal)

| Filter | Icon Background |
|--------|----------------|
| Last week | Red/coral |
| Last month | Orange |
| Last 3 months | Yellow |
| Last 6 months | Teal/green |
| Last year | Purple |
| Income | Green |
| Outgoing | Red |
| Approved | Green |
| Pending | Yellow/amber |
| Refunded | Blue |

---

## 2. Typography

### Font Family

```css
--font-family-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-family-mono: "SF Mono", "Fira Code", "Fira Mono", monospace;
```

Use sans-serif for all UI. Monospace only for card numbers, OTP codes, and masked credentials.

### Type Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--text-page-title` | 20px (1.25rem) | 600 (Semi-bold) | 1.4 | Page headings: "Activity", "Settings", "Wallet", "Subscriptions" |
| `--text-section-label` | 11px (0.6875rem) | 500 (Medium) | 1.3 | Section category labels: "Account", "Security", "Notifications", "Cards". Uppercase, letter-spacing: 0.05em, color: gray-500 |
| `--text-modal-title` | 18px (1.125rem) | 600 (Semi-bold) | 1.4 | Modal headings: "Update card", "Passkeys", "Add address", "Confirm email" |
| `--text-body` | 14px (0.875rem) | 400 (Regular) | 1.5 | Default body text, form labels, list items, nav items |
| `--text-body-medium` | 14px (0.875rem) | 500 (Medium) | 1.5 | Navigation items (active), list primary text, button labels |
| `--text-small` | 12px (0.75rem) | 400 (Regular) | 1.4 | Timestamps, metadata, helper text, toast messages |
| `--text-xs` | 11px (0.6875rem) | 400 (Regular) | 1.3 | Badge text, fine print |
| `--text-detail-amount` | 24px (1.5rem) | 600 (Semi-bold) | 1.2 | Transaction/subscription amounts in detail panel |
| `--text-detail-name` | 16px (1rem) | 600 (Semi-bold) | 1.4 | Merchant/entity name in detail panel |
| `--text-otp` | 32px (2rem) | 700 (Bold) | 1.0 | OTP digit display. Active digits are larger/bolder; inactive digits are lighter/smaller |
| `--text-empty-heading` | 16px (1rem) | 600 (Semi-bold) | 1.4 | Empty state headings |
| `--text-empty-body` | 14px (0.875rem) | 400 (Regular) | 1.5 | Empty state descriptions, color: gray-500 |

### Mobile Typography Adjustments

| Token | Desktop | Mobile (< 768px) |
|-------|---------|-------------------|
| Page title | 20px | 18px |
| Modal title | 18px | 16px |
| Detail amount | 24px | 20px |
| OTP digits | 32px | 28px |
| Body text | 14px | 14px (unchanged) |
| Small text | 12px | 12px (unchanged) |

---

## 3. Spacing System

Base unit: **4px**. All spacing is a multiple of 4.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight inline spacing, icon-to-text gap |
| `--space-2` | 8px | Between small elements, badge padding |
| `--space-3` | 12px | Input internal padding, list item padding vertical |
| `--space-4` | 16px | Default padding for cards, modals, nav items, section gaps |
| `--space-5` | 20px | Between form fields |
| `--space-6` | 24px | Section separator spacing, modal body padding |
| `--space-8` | 32px | Between major sections on settings pages |
| `--space-10` | 40px | Page-level vertical padding |
| `--space-12` | 48px | Empty state top spacing |
| `--space-16` | 64px | Large section breathing room |

### Content Widths

| Element | Width |
|---------|-------|
| Sidebar | 200px (desktop), hidden (mobile, hamburger toggle) |
| Detail panel | 320px (desktop), full-screen sheet (mobile) |
| Main content | Flexible, fills remaining space |
| Modal (small) | 400px max-width |
| Modal (medium) | 480px max-width |
| Toast notification | Auto-width, max 320px |
| Search modal | 440px max-width |

---

## 4. Layout Architecture

### Three-Panel Layout (Desktop)

```
┌──────────┬─────────────────────────────┬─────────────┐
│ Sidebar  │       Main Content          │   Detail    │
│  200px   │       (flexible)            │   320px     │
│          │                             │             │
│  Logo    │  Page Title    [Search]     │  Entity     │
│  Avatar  │                             │  Logo/Icon  │
│  Nav     │  List of items              │  Amount     │
│          │  (table rows)               │  Status     │
│          │                             │  Payment    │
│          │                             │  Actions    │
│  Footer  │                             │             │
│  Links   │                             │             │
└──────────┴─────────────────────────────┴─────────────┘
```

### Two-Panel Layout (No selection / Empty state)

When nothing is selected, the detail panel is hidden and the main content area centers an empty-state illustration.

### Mobile Layout (< 768px)

```
┌─────────────────────────────────┐
│  [☰]  Logo          [Search]   │  ← Top bar (56px height)
├─────────────────────────────────┤
│                                 │
│  Page Content                   │  ← Full-width content
│  (list items, forms, etc.)      │
│                                 │
├─────────────────────────────────┤
│  [Activity] [Subs] [Wallet] [⚙]│  ← Bottom tab bar (64px)
└─────────────────────────────────┘
```

**Mobile rules:**
- Sidebar becomes a **hamburger drawer** (slides in from left, 280px wide, overlay with scrim)
- Detail panel becomes a **bottom sheet** or **full-screen push view** with back arrow
- Bottom tab bar replaces sidebar nav for primary navigation (4 tabs: Activity, Subscriptions, Wallet, Settings)
- All modals become **full-screen sheets** sliding up from bottom on screens < 480px
- Touch targets minimum **44px x 44px**

---

## 5. Component Library

### 5.1 Sidebar Navigation

```
Structure:
- Logo (top-left, brand mark + wordmark)
- User Profile (circular avatar + name + email)
- Navigation Items (icon + label, stacked vertically)
- Footer (Help link, then Terms | Privacy | Cookies)
```

**Specs:**
- Background: `--color-white`
- Width: 200px fixed
- Avatar: 56px diameter circle, green gradient background, white initial letter (18px, bold)
- Edit icon: Small pencil circle badge on avatar bottom-right
- Nav item height: 40px
- Nav item padding: 12px horizontal
- Active state: `--color-gray-100` background, `--text-body-medium` weight
- Inactive: `--color-gray-600` text, no background
- Icon size: 18px, left-aligned with 8px gap to label
- Footer links: `--text-small`, `--color-gray-500`, separated by `|` or spaces

**Mobile:** Sidebar is hidden. Opens as overlay drawer with scrim (rgba(0,0,0,0.4)). Same layout inside.

### 5.2 Detail Panel (Right)

```
Structure:
- Entity icon/logo (centered, 48px)
- Entity name (16px semi-bold)
- Subtitle (12px, gray-500 — e.g., "Monthly")
- Amount (24px semi-bold)
- Metadata rows (label: value pairs)
  - Status (with colored dot)
  - Payment method
  - Refund info
- Action rows (icon + label + chevron)
  - Contact business
  - History / Manage at [merchant]
```

**Specs:**
- Background: `--color-white`
- Top padding: 24px
- Entity icon: Rounded square (8px radius) or circle, 48px
- Status dot: 8px diameter, colors per semantic palette
- Badge (e.g., "Default"): Pill shape, 1px gray-200 border, 6px vertical / 12px horizontal padding, text-xs
- Expandable rows: Chevron `>` icon on right, 14px gray-400
- Dividers: 1px `--color-gray-200`, full width with 16px horizontal margin

**Mobile:** Full-screen view with back arrow at top-left. Scrollable.

### 5.3 Modal / Dialog

```
Structure:
- Overlay: Semi-transparent scrim
- Modal card: White, centered, rounded corners
- Header: Title (left) + Close X (right), optional back arrow (left)
- Body: Form fields, content, illustration
- Footer: Action buttons (right-aligned or full-width)
```

**Specs:**
- Overlay: `rgba(0, 0, 0, 0.25)` — very subtle dimming with blur
- Card background: `--color-white`
- Border radius: 16px
- Box shadow: `0 8px 30px rgba(0, 0, 0, 0.12)`
- Max width: 400px (small) / 480px (medium)
- Padding: 24px
- Close button: 24px icon, top-right, `--color-gray-500`
- Back arrow: 24px icon, top-left, `--color-gray-800` (used in multi-step modals)
- Title: `--text-modal-title`, left-aligned below close row
- Animation: Fade in + slight scale up (200ms ease-out)

**Types observed:**
1. **Form modal** — Update card, Update email, Add address
2. **Confirmation modal** — Passkeys prompt with illustration and single CTA
3. **Picker modal** — Monogram colors, Emoji grid (taller, scrollable)
4. **Search modal** — Input + filters + results (440px wide)
5. **OTP modal** — Code input with large digits
6. **List modal** — Shipping addresses list with add option

**Mobile (< 480px):** Modals become bottom sheets that slide up. Border-radius only on top (16px 16px 0 0). Full width. Max height 90vh, scrollable.

### 5.4 Toast / Snackbar Notification

```
Structure:
- Pill-shaped container
- Green checkmark icon (left)
- Message text (right)
```

**Specs:**
- Position: Top center, 16px from top of main content area
- Background: `--color-gray-900` (dark) or `--color-white` with border
- Text: `--text-small`, white (on dark) or gray-800 (on light)
- Icon: 16px green checkmark circle
- Padding: 8px 16px
- Border radius: 999px (fully rounded pill)
- Shadow: `0 4px 12px rgba(0, 0, 0, 0.15)`
- Animation: Slide down + fade in (300ms). Auto-dismiss after 3 seconds. Slide up + fade out.
- Z-index: Above modals (z-50 or higher)

**Mobile:** Same positioning but with 16px horizontal margin from edges. Max-width: calc(100vw - 32px).

### 5.5 Form Inputs

**Text Input:**
- Height: 44px
- Border: 1px `--color-gray-200`
- Border radius: 8px
- Padding: 12px 16px
- Font: `--text-body`
- Placeholder: `--color-gray-300`
- Focus: Border color `--color-gray-900`, no colored outline (clean/minimal focus)
- Label: `--text-body`, `--color-gray-800`, positioned above input with 6px gap
- Disabled/masked text: Uses dots and shows last 4 digits (e.g., "•••• •••• •••• 6008")

**Dropdown/Select:**
- Same dimensions as text input
- Right chevron icon (`▼`), 12px, gray-400
- Opens native select or custom dropdown

**OTP / Code Input:**
- 6 individual digit boxes
- Each digit: ~44px wide, displayed large (32px font)
- Active digit: Slightly larger scale, bold weight
- Completed digits: Normal weight
- Animated cursor/highlight on active position
- "Resend code" link below, centered, `--text-small`, `--color-info`

**Mobile:** All inputs must be at least 44px height. Use `inputmode="numeric"` for OTP/card fields. Avoid zoom on focus — set font-size >= 16px.

### 5.6 Buttons

**Primary Button (Black):**
- Background: `--color-black`
- Text: `--color-white`, `--text-body-medium`
- Height: 44px
- Padding: 12px 24px
- Border radius: 8px
- Full-width in modals: 100% width, border-radius 12px
- Hover: slight opacity reduction (0.9) or lighten to gray-800

**Primary Button (Green — used on "Confirm" in some forms):**
- Background: `--color-primary`
- Text: `--color-white`, `--text-body-medium`
- Same dimensions as black primary
- Used for confirmations that aren't destructive (e.g., Add address)

**Secondary / Ghost Button:**
- Background: transparent
- Text: `--color-gray-800`, `--text-body-medium`
- Border: none
- Hover: `--color-gray-100` background
- Used for: "Cancel", navigation actions

**Outline Button (e.g., "Add passkey"):**
- Background: `--color-white`
- Border: 1px `--color-gray-200`
- Text: `--color-gray-800`, `--text-body-medium`
- Height: 36px
- Border radius: 8px
- Padding: 8px 16px

**Destructive Text Button:**
- Background: transparent
- Text: `--color-error` or `--color-gray-500`
- No border
- Used for: "Delete account", "Remove"
- Hover: Underline or slight color darken

**Mobile:** Minimum tap target 44px x 44px. Primary CTAs should be full-width at bottom of modal/sheet. Bottom padding of 34px on iOS for home indicator safe area.

### 5.7 Toggle Switch

- Width: 44px
- Height: 24px
- Track radius: 999px (pill)
- Active: `--color-primary` (green) track, white circle thumb
- Inactive: `--color-gray-200` track, white circle thumb
- Thumb: 20px diameter, white, subtle shadow
- Transition: 200ms ease

### 5.8 List Items / Table Rows

**Transaction Row:**
```
[Merchant Icon]  Merchant Name    Card Type    Date         Amount
   32px          14px medium      12px gray    12px gray    14px medium
```

- Height: 52px
- Padding: 12px 16px
- Divider: 1px `--color-gray-100` between rows
- Selected state: `--color-gray-50` background, left border 2px `--color-primary`
- Hover: `--color-gray-50` background
- Merchant icon: 32px circle or rounded square

**Settings Row:**
```
[Icon]  Label                                    Value / Chevron
 18px   14px medium                              14px gray   >
```

- Height: 48px
- Icon: 18px, `--color-gray-600`
- Chevron: 14px `>`, `--color-gray-300`
- Divider: 1px `--color-gray-100`
- Tappable full-width

**Mobile:** Rows expand to full width. Touch feedback with brief highlight on tap.

### 5.9 Empty State

```
Structure (centered vertically and horizontally):
- Icon/illustration (48-64px, brand green or neutral)
- Heading (16px semi-bold)
- Description (14px regular, gray-500)
- Optional: Brand logo row or CTA button below
```

**Brand Logo Row (Subscriptions empty state):**
- Horizontal row of circular logos (32px each)
- 12px gap between logos
- Labels below each (11px, gray-500)
- Displayed centered below the description

### 5.10 Search / Filter Overlay

```
Structure:
- Overlay scrim (same as modal)
- Search card (440px max-width, centered)
- Search input at top with magnifying glass icon
- Filter sections with category headers
- Result rows below search input when typing
```

**Filter Categories:**
- Section headers: `--text-section-label`, uppercase
- Filter items: Icon (24px colored circle) + label (14px), vertically stacked
- Sections: Date, Type, Status
- Each filter item: 40px row height, full-width tap target

**Search Results:**
- Same format as transaction list rows
- Displayed inline below search input
- "No results" state: Centered text with description and link

**Mobile:** Search becomes full-screen. Input at top with cancel button. Filters in scrollable sheet below.

### 5.11 Status Badges / Indicators

**Dot + Text Status:**
- Dot: 8px circle, semantic color
- Text: `--text-small`, right-aligned in detail panel
- Variants: "Approved" (green), "Pending" (amber), "Refunded" (blue), "Cancelled" (gray)

**Pill Badge (e.g., "Default" on cards):**
- Border: 1px `--color-gray-200`
- Border radius: 999px
- Padding: 4px 12px
- Text: `--text-xs`, `--color-gray-600`

### 5.12 Card Display (Wallet)

**Card List Item:**
```
[Card Icon 24px]  Card Name (e.g., "Visa Debit 6008")     [Default badge]
```

**Card Detail (Right Panel):**
- Card brand logo: 48px, full-color (e.g., Visa blue/gold)
- Card name: `--text-detail-name` with edit pencil icon
- Badge: "Default" pill
- Actions list: Set as default (toggle), Update card, Remove
- Each action: icon + label + chevron or toggle

### 5.13 Confirmation Flow (Multi-Step Modal)

The modal system supports multi-step flows with:
1. **Back arrow** (top-left) to return to previous step
2. **Progress indication** via content change (not a progress bar)
3. **Success state**: Icon transitions to checkmark, bottom bar turns dark with check
4. **Auto-close**: After success confirmation, modal auto-dismisses (1.5s) and shows toast

---

## 6. Iconography

- Style: Outlined (stroke-based), 1.5px stroke weight
- Size: 18px default for nav/list icons, 24px for modal/action icons
- Color: `--color-gray-600` default, `--color-gray-900` active/hover
- Source: Consistent icon set (Lucide-style or similar)
- Key icons observed:
  - Activity: Clock/history icon
  - Subscriptions: Repeat/refresh icon
  - Wallet: Credit card icon
  - Settings: Gear/cog icon
  - Search: Magnifying glass
  - Close: X mark
  - Back: Left chevron `<`
  - Forward/expand: Right chevron `>`
  - Edit: Pencil
  - Add: Plus `+`
  - Checkmark: For success states
  - Shield/Lock: For security/passkey sections

---

## 7. Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Small badges, tags |
| `--radius-md` | 8px | Inputs, buttons, cards, list items |
| `--radius-lg` | 12px | Full-width modal buttons, larger cards |
| `--radius-xl` | 16px | Modals, bottom sheets |
| `--radius-full` | 999px | Avatars, pills, toggle switches, toasts |

---

## 8. Shadows & Elevation

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.06)` | Cards, list headers |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | Dropdown menus, popovers |
| `--shadow-lg` | `0 8px 30px rgba(0,0,0,0.12)` | Modals, dialogs |
| `--shadow-toast` | `0 4px 12px rgba(0,0,0,0.15)` | Toast notifications |

---

## 9. Animation & Motion

| Pattern | Duration | Easing | Description |
|---------|----------|--------|-------------|
| Modal appear | 200ms | `ease-out` | Fade + scale from 0.95 to 1.0 |
| Modal dismiss | 150ms | `ease-in` | Fade + scale to 0.95 |
| Toast enter | 300ms | `ease-out` | Slide down from -20px + fade in |
| Toast exit | 200ms | `ease-in` | Slide up + fade out |
| Sheet slide (mobile) | 300ms | `cubic-bezier(0.32, 0.72, 0, 1)` | Bottom sheet slides up |
| Toggle switch | 200ms | `ease` | Thumb slides left/right |
| Nav hover | 150ms | `ease` | Background color transition |
| List item select | 100ms | `ease` | Background highlight |
| OTP digit | 150ms | `spring` | Scale bounce on entry |
| Drawer slide | 300ms | `cubic-bezier(0.32, 0.72, 0, 1)` | Sidebar slides in from left |
| Scrim fade | 200ms | `ease` | Overlay opacity transition |

---

## 10. Mobile-First Responsive Strategy

### Breakpoints

| Name | Value | Description |
|------|-------|-------------|
| `xs` | 0 - 479px | Small phones. Modals → full-screen sheets. Single column. |
| `sm` | 480px - 639px | Large phones. Modals → bottom sheets (90vh). |
| `md` | 640px - 767px | Small tablets. Two-column possible. |
| `lg` | 768px - 1023px | Tablets. Sidebar visible, detail as overlay. |
| `xl` | 1024px - 1279px | Small desktop. Full three-panel layout. |
| `2xl` | 1280px+ | Full desktop. Three-panel with comfortable spacing. |

### Mobile Navigation (< 768px)

**Bottom Tab Bar:**
- Height: 64px (+ safe area inset bottom on iOS)
- Background: `--color-white`
- Border top: 1px `--color-gray-200`
- 4 tabs: Activity, Subscriptions, Wallet, Settings
- Each tab: Icon (24px) + label (10px) stacked vertically
- Active: `--color-primary` icon + label
- Inactive: `--color-gray-400` icon + label
- Tap area: Full width divided by 4, full height

**Top Bar (Mobile):**
- Height: 56px
- Background: `--color-white`
- Left: Hamburger menu (or back arrow on sub-pages)
- Center: Page title or logo
- Right: Search icon or action button
- Border bottom: 1px `--color-gray-200`

### Mobile-Specific Patterns

| Desktop Pattern | Mobile Adaptation |
|----------------|-------------------|
| Left sidebar | Hamburger drawer overlay (280px, left edge) |
| Right detail panel | Full-screen push view with back arrow |
| Centered modal | Bottom sheet (slides up, rounded top corners) |
| Search overlay | Full-screen with top search bar |
| Settings list | Full-width rows, same heights |
| Toast notification | Top center, respects safe area, max-width calc(100vw - 32px) |
| Three-panel layout | Single-column, stacked navigation |
| Hover states | Replaced with active/pressed states (50ms gray-100 highlight) |
| Right-click menus | Long-press → action sheet |

### Touch & Accessibility

- Minimum tap target: **44px x 44px** (Apple HIG / WCAG)
- Touch feedback: Brief background highlight on tap (100ms)
- Swipe gestures:
  - Swipe right on list item → Quick actions (optional)
  - Swipe down on sheet → Dismiss
  - Pull to refresh on main content lists
- Safe areas: Respect `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` on all fixed elements
- Font scaling: Support Dynamic Type / system font scaling up to 200%
- Focus outlines: 2px `--color-primary` offset for keyboard navigation
- Reduced motion: Honor `prefers-reduced-motion` — disable all animations, use instant transitions

---

## 11. Page-Specific Patterns

### Activity Page
- Default view: Transaction list grouped by month (e.g., "Feb 2025")
- Group headers: `--text-section-label`, sticky on scroll
- Transaction rows: Merchant icon, name, card type, date, amount
- Search: Opens filter overlay with date/type/status filters
- Empty state: Green Link icon + "Your Link activity will show up here."
- Selecting a transaction opens detail panel (desktop) or pushes view (mobile)

### Subscriptions Page
- List of active/inactive subscriptions
- Status inline: "Cancelled [date]" in gray
- Amount right-aligned
- Empty state: Swirl icon + "No subscriptions yet" + "Add and manage your favorite services." + brand logo row
- Detail panel: Logo, name, billing frequency, status (with dot), amount, actions

### Wallet Page
- Card list with icon, name, last 4 digits, "Default" badge
- "+" button top-right to add card
- Detail panel: Large card brand logo, name (editable), badge, billing address, actions (Set as default toggle, Update card, Remove)
- Update card modal: Card number (masked), Expiration, CVC fields + Cancel/Confirm buttons

### Settings Page
- Sections with clear headers:
  - **Promotional banner** (top): "Log in faster next time" with CTA — dismissable with X
  - **Account**: Name, Email, Phone, Shipping addresses (each row opens modal or detail)
  - **Security**: Connected apps, Passkeys, Login activity
  - **Notifications**: Payments, Marketing (toggles)
  - **Support**: Get support (opens help)
  - **Footer actions**: "Log out" (text button) | "Delete account" (destructive text, red/gray)

---

## 12. Pattern: Confirmation & Verification Flows

### Email Verification (Two-step)
1. **Step 1 — Verify current email**: Shows current email in input (read-only appearance), explanation text, "Verify email" CTA
2. **Step 2 — OTP Entry**: "Enter the code sent to [email]", 6-digit input, "Resend code" link, loading spinner during verification

### Passkey Addition
1. **Step 1 — Prompt**: Illustration (person with shield), "Log in faster with your face or fingerprint.", "Add passkey" CTA
2. **Step 2 — System dialog**: OS-level biometric prompt (handled by browser API)
3. **Step 3 — Success**: Checkmark replaces illustration, dark success bar at bottom
4. **Step 4 — Toast**: Modal auto-closes, "Passkey added" toast appears

### Address Addition
1. Single modal with form: Full name, Country/region (dropdown), Address line 1, Address line 2, Postal code
2. "Set as default" toggle at bottom
3. "Confirm" green CTA

---

## 13. Tailwind CSS Token Mapping

```js
// tailwind.config.ts — extend theme
{
  colors: {
    primary: {
      DEFAULT: '#00D632',
      light: '#E6FBF0',
    },
    gray: {
      50: '#F7F7F7',
      100: '#F0F0F0',
      200: '#E5E5E5',
      300: '#D4D4D4',
      500: '#737373',
      600: '#525252',
      800: '#262626',
      900: '#171717',
    },
    success: '#00D632',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '999px',
  },
  boxShadow: {
    sm: '0 1px 3px rgba(0,0,0,0.06)',
    md: '0 4px 12px rgba(0,0,0,0.08)',
    lg: '0 8px 30px rgba(0,0,0,0.12)',
    toast: '0 4px 12px rgba(0,0,0,0.15)',
  },
  spacing: {
    // Uses default Tailwind 4px base scale
  },
  fontSize: {
    xs: ['0.6875rem', { lineHeight: '1.3' }],
    sm: ['0.75rem', { lineHeight: '1.4' }],
    base: ['0.875rem', { lineHeight: '1.5' }],
    lg: ['1rem', { lineHeight: '1.4' }],
    xl: ['1.125rem', { lineHeight: '1.4' }],
    '2xl': ['1.25rem', { lineHeight: '1.4' }],
    '3xl': ['1.5rem', { lineHeight: '1.2' }],
    '4xl': ['2rem', { lineHeight: '1.0' }],
  },
}
```

---

## 14. Design Principles

1. **Clean and minimal**: White backgrounds, thin borders, generous whitespace. No gradients on surfaces (only in avatar palette). No heavy shadows.
2. **Monochrome + one accent**: The entire UI is grayscale except for the green primary color. Avoid introducing additional colors beyond the semantic palette.
3. **Information density scales**: Desktop shows three panels simultaneously. Mobile shows one panel at a time with clear navigation between them.
4. **Consistent interaction language**: All secondary content opens in modals (desktop) or sheets (mobile). All confirmations use the same toast pattern. All multi-step flows use back arrows.
5. **Progressive disclosure**: Settings are grouped into sections. Details are in expandable rows. Complex actions are behind modals, not inline.
6. **Mobile-native feel**: Bottom tab bar, bottom sheets, swipe gestures, safe area respect, 44px touch targets. The mobile experience should feel like a native app, not a responsive website.
