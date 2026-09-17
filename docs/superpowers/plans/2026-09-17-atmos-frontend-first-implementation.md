# ATMOS Front-End First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, highly-polished, and fully interactive front-end ecosystem for ATMOS (Public Front-of-House, Branch Operations `/ops`, Central Supply & Logistics `/supply`, and Executive/Management `/hq`) before attaching the persistent database backend.

**Architecture:** Next.js 15 App Router with React 19, TypeScript, and Tailwind CSS v4. State is managed via lightweight client/mock stores with localStorage persistence so that every user journey (customer booking, staff check-in, warehouse batch tracking, and branch monthly P&L calculation) can be tested end-to-end directly in the browser.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, Lucide React.

**Spec:** [docs/superpowers/specs/2026-09-17-atmos-ecosystem-design.md](file:///C:/Users/Dimas%20Edra%20Ar%20Rafi/ProjectHub/atmos-barbershop/docs/superpowers/specs/2026-09-17-atmos-ecosystem-design.md)

## Global Constraints
- **Strictly No Feature Bloat & Unsolicited Interactions**: Stick 100% to the core workflows defined in the spec.
- **Clean & Minimalist Over Maximalist ("Less is More")**: Spacious whitespace, restrained monochromatic palette with subtle emerald accents, zero component clutter.
- **Strictly by Appointment**: No walk-in appointments anywhere in the booking or operations flow.
- **Separated Portals**: Distinct layout structures for `/(public)`, `/(staff)/ops`, `/(warehouse)/supply`, and `/(management)/hq`.
- **Branch Manager Expense Input**: Manual operational expenses can only be submitted within the branch manager scope.

---

## File Structure Map

```
atmos-barbershop/
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # Root HTML & typography layout
│   │   ├── globals.css                    # Tailwind CSS v4 tokens & baseline styling
│   │   ├── (public)/
│   │   │   ├── layout.tsx                 # Public header (dark #0E0E11) & footer
│   │   │   ├── page.tsx                   # Landing page (Hero, Services, Capsters, Branches, Shop)
│   │   │   ├── book/page.tsx              # Full-page dedicated booking engine
│   │   │   ├── shop/page.tsx              # Curated haircare shop & routine builder
│   │   │   └── customer/orders/page.tsx   # Customer self-service order/booking tracking
│   │   ├── internal/
│   │   │   └── login/page.tsx             # Staff authentication portal & quick role switcher
│   │   ├── (staff)/ops/
│   │   │   ├── layout.tsx                 # Branch operations sidebar & header
│   │   │   ├── schedule/page.tsx          # Capster appointment timeline & quick actions
│   │   │   ├── concierge/page.tsx         # VIP assisted booking & reschedule modal
│   │   │   └── clients/page.tsx           # Customer dossier & sensory formula history
│   │   ├── (warehouse)/supply/
│   │   │   ├── layout.tsx                 # Central warehouse & logistics sidebar
│   │   │   ├── batches/page.tsx           # Batch receiving, FEFO tracking, and expiry status
│   │   │   ├── orders/page.tsx            # E-commerce packaging & courier AWB input
│   │   │   └── requisitions/page.tsx      # Branch salon restock fulfillment
│   │   └── (management)/hq/
│   │       ├── layout.tsx                 # Executive / Branch Manager sidebar & scope switch
│   │       ├── overview/page.tsx          # Seat occupancy, capster productivity, supply alerts
│   │       ├── finance/page.tsx           # Automated branch monthly P&L & manual expense drawer
│   │       └── branches/page.tsx          # Jabodetabek branches directory & staff allocation
│   ├── components/
│   │   ├── shared/                        # Badge, Modal, Button, Table, Drawer primitives
│   │   └── public/                        # Ported UI components from generate/src/components
│   ├── lib/
│   │   ├── mock/                          # Seed data & initial mock state
│   │   └── store/                         # Interactive state providers (localStorage backed)
│   └── types/
│       └── index.ts                       # Shared TypeScript interfaces for ecosystem
```

---

### Task 1: Next.js 15 Project Setup & Design System Tokens

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`
- Create: `src/app/globals.css`, `src/app/layout.tsx`
- Create: `src/types/index.ts`

**Interfaces:**
- Produces: Base project structure, typography styles, design tokens (`kanvas`, `grafit`, `perak`, `eucalyptus`), and core TypeScript types (`Booking`, `ProductBatch`, `BranchRequisition`, `BranchExpense`, `StaffUser`, `CustomerUser`).

- [ ] **Step 1: Initialize Next.js 15 and core dependencies**
  Configure `package.json` with `next: ^15.2.0`, `react: ^19.0.0`, `react-dom: ^19.0.0`, `tailwindcss: ^4.0.0`, `@tailwindcss/postcss: ^4.0.0`, `lucide-react: ^1.45.0`.
- [ ] **Step 2: Define Shared TypeScript Definitions in `src/types/index.ts`**
  Port and extend data structures from `generate/src/types/index.ts` to include StaffRole, BookingStatus, OrderStatus, ProductBatch, BranchExpense, and BranchMonthlyReport.
- [ ] **Step 3: Setup Design System Tokens in `src/app/globals.css`**
  Implement Tailwind CSS v4 variables: `--color-kanvas`, `--color-grafit`, `--color-perak`, font-display and font-mono rules matching `generate/`.
- [ ] **Step 4: Verify build and baseline compilation**
  Run: `npm run build` or `npm run lint` to verify zero type errors.
- [ ] **Step 5: Commit changes**
  Run: `git add . && git commit -m "feat: initialize Next.js 15 foundation and design tokens"`

---

### Task 2: Public Front-of-House Experience Porting (`/(public)`)

**Files:**
- Create: `src/app/(public)/layout.tsx`
- Create: `src/app/(public)/page.tsx`
- Create: `src/app/(public)/book/page.tsx`
- Create: `src/app/(public)/shop/page.tsx`
- Create: `src/app/(public)/customer/orders/page.tsx`
- Create: `src/components/public/*` (Navbar, Hero, Services, Capsters, BranchFinder, ShopSection, CartDrawer, BookingModal)

**Interfaces:**
- Consumes: Design tokens and Types from Task 1.
- Produces: Public landing page, strictly appointment booking engine, and e-commerce shopping flow.

- [ ] **Step 1: Port Public Navigation and Footer**
  Extract and adapt `Navbar.tsx` and `Footer.tsx` from `generate/` into reusable components in `src/components/public/`.
- [ ] **Step 2: Port Landing Page Sections**
  Port `Hero`, `ServicesSection`, `WhyUsSection`, `CapsterSection`, `BranchFinder`, and `ShopSection`.
- [ ] **Step 3: Implement Dedicated Booking Flow (`/book`)**
  Build the strictly-by-appointment booking wizard: Branch Selection → Treatment Menu → Stylist Selection → Date & Time Slots → Sensory Preferences (ASMR Mode, Massage Force, Quiet Chair) → Confirmation.
- [ ] **Step 4: Implement Shop & Routine Builder (`/shop`)**
  Connect `ProductDetailModal` and `CartDrawer` with persistent local cart state.
- [ ] **Step 5: Implement Customer Self-Service Tracking (`/customer/orders`)**
  A clean, minimalist page displaying recent bookings (with QR / booking code) and product order delivery status.
- [ ] **Step 6: Verify public routes in browser and commit**
  Run build check and verify responsive rendering across mobile and desktop.
  Commit: `git add . && git commit -m "feat: port public front-of-house and booking/shop flows"`

---

### Task 3: Internal Authentication & Role-Switching Mock Portal (`/internal/login`)

**Files:**
- Create: `src/app/internal/login/page.tsx`
- Create: `src/lib/store/auth-context.tsx`
- Create: `src/lib/mock/users.ts`

**Interfaces:**
- Produces: `useStaffAuth()` hook providing current staff profile (`BRANCH_STAFF`, `BRANCH_MANAGER`, `WAREHOUSE_STAFF`, `EXECUTIVE`) and active branch context.

- [ ] **Step 1: Create Mock Staff Users Seed in `src/lib/mock/users.ts`**
  Define sample accounts for each internal role: Senopati Staff, Senopati Branch Manager, Central Warehouse Lead, and HQ Executive Director.
- [ ] **Step 2: Implement `AuthContext` with LocalStorage Persistence**
  Create state container allowing easy switching between roles for realistic evaluation.
- [ ] **Step 3: Build Minimalist `/internal/login` Page**
  Form with username & password, plus a clean "Quick Switch Profile" pill bar for rapid testing during evaluation.
- [ ] **Step 4: Commit changes**
  Commit: `git add . && git commit -m "feat: implement internal authentication portal and role switcher"`

---

### Task 4: Branch Operations Portal (`/(staff)/ops`)

**Files:**
- Create: `src/app/(staff)/ops/layout.tsx`
- Create: `src/app/(staff)/ops/schedule/page.tsx`
- Create: `src/app/(staff)/ops/concierge/page.tsx`
- Create: `src/app/(staff)/ops/clients/page.tsx`
- Create: `src/components/ops/ServiceLogModal.tsx`
- Create: `src/lib/store/booking-store.tsx`

**Interfaces:**
- Consumes: `useStaffAuth()` from Task 3.
- Produces: Daily appointment timeline, status triggers (`[Check-In]`, `[Mulai Layanan]`, `[Selesai]`), sensory notes recorder, and VIP reschedule tools.

- [ ] **Step 1: Build Operational Shell & Navigation Header (`/ops/layout.tsx`)**
  Clean, spacious layout showing active branch name, date indicator, and navigation tabs (Jadwal Janji, VIP Concierge, Profil Pelanggan).
- [ ] **Step 2: Implement Appointment Schedule Board (`/ops/schedule`)**
  Display real-time bookings grouped by capster. Add single-click status action transitions:
  - `CONFIRMED` → `CHECKED_IN`
  - `CHECKED_IN` → `IN_SERVICE`
  - `IN_SERVICE` → `COMPLETED`
- [ ] **Step 3: Implement Post-Service Sensory Notes Modal (`ServiceLogModal.tsx`)**
  Triggered automatically on `COMPLETED`: records haircut clipper formula, scent preference, scalp condition.
- [ ] **Step 4: Implement VIP Concierge Reschedule & Direct Booking (`/ops/concierge`)**
  Form for salon receptionists to reschedule existing bookings or book on behalf of VIP clients without public checkout friction.
- [ ] **Step 5: Verify operations workflow and commit**
  Commit: `git add . && git commit -m "feat: implement branch operations portal with appointment pipeline"`

---

### Task 5: Central Supply & Logistics Portal (`/(warehouse)/supply`)

**Files:**
- Create: `src/app/(warehouse)/supply/layout.tsx`
- Create: `src/app/(warehouse)/supply/batches/page.tsx`
- Create: `src/app/(warehouse)/supply/orders/page.tsx`
- Create: `src/app/(warehouse)/supply/requisitions/page.tsx`
- Create: `src/lib/store/inventory-store.tsx`

**Interfaces:**
- Consumes: Inventory data models and Staff user context.
- Produces: FEFO batch tracking, expiry countdown alerts, order packaging pipeline, and branch restock dispatch.

- [ ] **Step 1: Build Supply Portal Shell (`/supply/layout.tsx`)**
  Warehouse navigation with live alert badges for items nearing expiry or pending branch restock requests.
- [ ] **Step 2: Implement Batch Management & Expiry Tracker (`/supply/batches`)**
  - Table displaying Batch Number, Product, Remaining Qty, Expiry Date, and Status (`ACTIVE`, `DEPLETED`, `EXPIRED`).
  - Modal form for receiving new batch (Product, Batch No, Initial Qty, Expiry Date).
  - Visual FEFO priority badges and automatic expiry indicator for batches past current date.
- [ ] **Step 3: Implement E-Commerce Order Fulfillment (`/supply/orders`)**
  Order cards filtered by status (`PAID` → `PACKED` → `SHIPPED`). Input modal for courier name (JNE, SiCepat) and tracking number (AWB/Resi).
- [ ] **Step 4: Implement Branch Restock Requisitions (`/supply/requisitions`)**
  List of salon product requests submitted by Branch Managers. Button to approve and dispatch items, automatically reducing warehouse batch stock.
- [ ] **Step 5: Commit changes**
  Commit: `git add . && git commit -m "feat: implement central supply and logistics portal with batch tracking"`

---

### Task 6: Management & Executive Portal (`/(management)/hq`)

**Files:**
- Create: `src/app/(management)/hq/layout.tsx`
- Create: `src/app/(management)/hq/overview/page.tsx`
- Create: `src/app/(management)/hq/finance/page.tsx`
- Create: `src/app/(management)/hq/branches/page.tsx`
- Create: `src/components/hq/ManualExpenseModal.tsx`
- Create: `src/lib/store/finance-store.tsx`

**Interfaces:**
- Consumes: Bookings from Task 4, Requisitions from Task 5, and Staff context from Task 3.
- Produces: Multi-branch executive KPIs, automated monthly P&L statements, and branch manager manual expense logging.

- [ ] **Step 1: Build Management Shell with Role-Aware Branch Filter (`/hq/layout.tsx`)**
  If user is `BRANCH_MANAGER`, lock the branch view to their assigned branch. If `EXECUTIVE`, provide a dropdown to toggle between "All Branches (Jabodetabek)" and individual studios.
- [ ] **Step 2: Implement Executive Overview Dashboard (`/hq/overview`)**
  Restrained, minimalist layout showing:
  - Seat Occupancy Rate per branch
  - Capster Service Hours / Productivity
  - Supply Health Alerts (nearing expiry batches & low stock)
- [ ] **Step 3: Implement Automated Monthly P&L Ledger (`/hq/finance`)**
  - Total Service Revenue (from `COMPLETED` bookings)
  - (-) Automated Staff Payroll & Service Commissions
  - (-) Automated Salon Product Deductions (from fulfilled requisitions)
  - (-) Manual Branch Operational Expenses
  - (=) Real Net Profit/Loss
- [ ] **Step 4: Implement Manual Operational Expense Drawer (`ManualExpenseModal.tsx`)**
  Exclusive to `BRANCH_MANAGER`: Modal to record branch expenses (Electricity/Utilities, Towel Laundry, Studio Maintenance, Miscellaneous) with instant recalculation of net profit.
- [ ] **Step 5: Implement Branch Directory & Team Roster (`/hq/branches`)**
  Directory of ATMOS Jabodetabek locations, operating hours, and active capsters.
- [ ] **Step 6: Commit changes**
  Commit: `git add . && git commit -m "feat: implement management and executive portal with automated P&L"`

---

### Task 7: End-to-End Flow Verification & Polish

**Files:**
- Modify: Linkages across portals and navigation transitions
- Test: Verification checklist against design constraints

- [ ] **Step 1: Verify Customer Booking Journey**
  Book an appointment on `/book`, verify it appears on the Senopati branch board in `/ops/schedule`.
- [ ] **Step 2: Verify Branch Operations Journey**
  Perform `Check-In` → `Mulai Layanan` → `Selesai`, fill the sensory log notes, verify booking updates in customer history and financial revenue.
- [ ] **Step 3: Verify Supply & Requisition Journey**
  Branch Manager requests salon shampoo on `/hq/requisitions` → Warehouse Staff approves on `/supply/requisitions` → verify inventory batch drops and branch product deduction increases in `/hq/finance`.
- [ ] **Step 4: Verify Branch Manager Manual Expense Logging**
  Log a laundry bill as Branch Manager → verify net profit immediately updates on `/hq/finance`.
- [ ] **Step 5: Verify UI Design Compliance**
  Audit all screens against the "Less is More" hard constraint: clean whitespace, zero clutter, high readability.
- [ ] **Step 6: Final Plan Commit**
  Commit: `git add . && git commit -m "chore: complete front-end first integration and verification"`
