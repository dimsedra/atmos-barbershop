# Design Specification: ATMOS Full-Stack Web Application

**Date:** 2026-09-10  
**Project:** ATMOS Barbershop & Sensory Salon  
**Status:** Approved for Implementation Planning  
**Target Environment:** Vercel (Next.js App Router) + Supabase (PostgreSQL & Auth) + Midtrans Sandbox  

---

## 1. Executive Summary & Brand Identity

**ATMOS** adalah jaringan barbershop & sensory salon *high-end* di kawasan Jabodetabek (Jakarta, Bogor, Depok, Tangerang, Bekasi). Berbeda dari barbershop konvensional yang berfokus pada kecepatan transaksi, ATMOS memosisikan diri sebagai *digital and physical sanctuary* yang mengutamakan relaksasi menyeluruh untuk pria dan wanita dengan diferensiasi utama: **ritual pijat kepala/leher dan stimulasi audio ASMR (*Autonomous Sensory Meridian Response*)**.

Aplikasi web ini dibangun sebagai portofolio *full-stack* tingkat lanjut dengan dua pilar transaksi utama (*first-class citizens*):
1. **Stylist-Centric Booking Engine**: Reservasi berbasis janji temu (*appointment-only*) dengan pemilihan cabang, perawatan sensory, barber/stylist spesifik, serta preferensi kenyamanan personal (mode ASMR, tekanan pijat, level percakapan / *quiet chair*, dan ruang privat).
2. **Curated E-Commerce & Routine Builder**: Penjualan produk perawatan rambut racikan mandiri (*custom haircare*) dengan fitur penyusunan 3 langkah rutinitas personal (bersihkan, rawat, tata).
3. **Dual-Sided Portal (RBAC)**:
   - **Customer Portal (`/dashboard`)**: Riwayat reservasi, status pesanan produk, dan profil preferensi rambut.
   - **Staff Operations & Logistics Dashboard (`/admin`)**: Kalender jadwal harian per cabang, *one-click customer check-in*, pencatatan riwayat treatment & preferensi sensory, serta *pipeline* logistik pengiriman pesanan (input resi/AWB).

---

## 2. Visual Design & UI System (Strict Constraints)

Antarmuka web memporting langsung desain dari direktori `generate/` yang menganut prinsip **"Less is More"**—desain minimalis, lapang, tenang, tanpa dekorasi berlebih (*zero clutter*):

### Color Tokens & Palette
- `putih` (`#ffffff`): Kanvas utama dan permukaan bersih.
- `kabut` (`#f1f3f5`) & `kabut-2` (`#e6e9ed`): Latar belakang sekunder dan kontainer subtil.
- `perak` (`#d5d9de`) & `perak-tua` (`#7c848e`): Garis batas halus (1px) dan teks sekunder.
- `batu` (`#4a525b`): Teks paragraf dengan kenyamanan baca tinggi (*pretty wrapping*).
- `grafit` (`#24292f`) & `grafit-pekat` (`#15181c`): Tipografi judul kontras tinggi dan aksen tombol utama.
- `eucalyptus` (`#6f8a78`) & `eucalyptus-muda` (`#e4ece6`): Aksen natural penanda status aktif dan audio play.

### Sensory Audio & Interactive Elements
- **Web Audio API Real-Time Synthesizer**: Sintesis audio browser langsung (dua lapis: *brown noise* ruang bernapas pada ~0.085Hz dan desis udara) tanpa ketergantungan file audio eksternal berukuran besar.
- **Dynamic Waveform SVG (`AmbientLine`)**: Animasi garis bernapas sinkron secara matematis dengan frekuensi suara.
- **Geographic SVG Map of Jabodetabek (`JabodetabekMap`)**: Proyeksi koordinat bujur/lintang nyata yang memetakan 10 cabang ATMOS dengan deteksi cabang terdekat menggunakan formula *Haversine*.

---

## 3. Technology Stack & System Architecture

```
[ Client Layer ]
  Next.js 15+ App Router, React 19, TypeScript
  Tailwind CSS v4 (Design tokens: putih, kabut, perak, grafit, eucalyptus)
  Lucide React Icons, Web Audio API

[ Application & API Layer ]
  Next.js Server Actions (Mutations & Business Logic)
  Next.js Route Handlers (Midtrans Webhooks: /api/webhooks/midtrans)
  Zod (Runtime Schema & Payload Validation)
  Supabase SSR (@supabase/ssr) for Session & RBAC Middleware

[ Persistence & Payment Layer ]
  Prisma ORM (Schema migrations, relational queries, connection pooler)
  PostgreSQL (Supabase Managed DB with Supavisor)
  Midtrans Sandbox (Snap Token Generation & SHA-512 Webhook Verification)
```

---

## 4. Database Schema (Prisma Data Model)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  CUSTOMER
  STAFF
  ADMIN
}

enum BookingStatus {
  PENDING_PAYMENT
  CONFIRMED
  CHECKED_IN
  COMPLETED
  CANCELLED
}

enum OrderStatus {
  PENDING_PAYMENT
  PAID
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum ServiceAudience {
  pria
  wanita
  semua
}

enum ProductRole {
  bersihkan
  rawat
  tata
}

model User {
  id            String         @id @default(uuid())
  supabaseId    String         @unique
  email         String         @unique
  name          String
  phone         String?
  role          Role           @default(CUSTOMER)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  bookings      Booking[]
  orders        Order[]
  customerNotes CustomerNote[] @relation("CustomerNotes")
  authoredNotes CustomerNote[] @relation("AuthoredNotes")
}

model Branch {
  id          String    @id
  name        String
  area        String
  city        String
  address     String
  lat         Float
  lng         Float
  phone       String
  features    String[]
  privateRoom Boolean   @default(false)
  labelSide   String    @default("right")
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())

  barbers     Barber[]
  bookings    Booking[]
}

model Barber {
  id          String    @id
  name        String
  specialty   String
  since       Int
  isActive    Boolean   @default(true)
  
  branches    Branch[]
  bookings    Booking[]
}

model Service {
  id          String          @id
  name        String
  audience    ServiceAudience
  duration    Int             // in minutes (e.g. 45, 60, 90, 120)
  price       Int             // in IDR
  from        Boolean         @default(false)
  desc        String
  isActive    Boolean         @default(true)

  bookings    Booking[]
}

model AddOn {
  id       String @id
  name     String
  price    Int    // in IDR
  duration Int    // in minutes (e.g. 15)
}

model Booking {
  id            String        @id @default(uuid())
  bookingCode   String        @unique // e.g., ATMOS-BK-202609-XXXX
  userId        String
  branchId      String
  barberId      String
  serviceId     String
  addOns        String[]      // Array of AddOn IDs
  bookingDate   String        // YYYY-MM-DD
  startMinute   Int           // Minute from midnight (e.g. 600 for 10:00)
  totalDuration Int           // in minutes
  totalPrice    Int           // in IDR

  // Sensory & Personal Comfort Preferences
  asmrMode      String        @default("headphone") // "headphone" | "speaker" | "tanpa"
  massageForce  String        @default("standar")   // "standar" | "ringan" | "kuat" | "lewati"
  talkPreference String       @default("secukupnya") // "secukupnya" | "minimal"
  privateRoom   Boolean       @default(false)
  customerNotes String?

  status        BookingStatus @default(PENDING_PAYMENT)
  
  // Midtrans Payment Tracking
  midtransSnapToken String?
  midtransOrderId   String?   @unique
  paidAt            DateTime?

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  user          User          @relation(fields: [userId], references: [id])
  branch        Branch        @relation(fields: [branchId], references: [id])
  barber        Barber        @relation(fields: [barberId], references: [id])
  service       Service       @relation(fields: [serviceId], references: [id])
  serviceLog    CustomerNote?
}

model Product {
  id        String      @id
  name      String
  tagline   String
  role      ProductRole
  size      String      // e.g. "250 ml", "30 ml"
  price     Int         // in IDR
  desc      String
  notes     String[]    // Key ingredients/notes
  howTo     String      // Application instructions
  image     String
  stock     Int         @default(100)
  isActive  Boolean     @default(true)

  orderItems OrderItem[]
}

model Order {
  id                String      @id @default(uuid())
  orderCode         String      @unique // e.g., ATMOS-ORD-202609-XXXX
  userId            String
  totalAmount       Int
  status            OrderStatus @default(PENDING_PAYMENT)

  // Shipping details
  recipientName     String
  recipientPhone    String
  shippingAddress   String
  shippingCity      String
  postalCode        String
  courierName       String?     // e.g. "JNE", "SiCepat"
  trackingNumber    String?     // Resi / AWB number

  // Midtrans Payment Tracking
  midtransSnapToken String?
  midtransOrderId   String?     @unique
  paidAt            DateTime?

  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  user              User        @relation(fields: [userId], references: [id])
  items             OrderItem[]
}

model OrderItem {
  id              String   @id @default(uuid())
  orderId         String
  productId       String
  quantity        Int
  priceAtPurchase Int      // Snapshot in IDR

  order           Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product         Product  @relation(fields: [productId], references: [id])
}

model CustomerNote {
  id          String   @id @default(uuid())
  customerId  String
  staffId     String
  bookingId   String?  @unique
  notes       String   // e.g. "Suka aroma sandalwood, kulit kepala sensitif, taper fade 1.5"
  createdAt   DateTime @default(now())

  customer    User     @relation("CustomerNotes", fields: [customerId], references: [id])
  staff       User     @relation("AuthoredNotes", fields: [staffId], references: [id])
  booking     Booking? @relation(fields: [bookingId], references: [id])
}
```

---

## 5. Core Workflows & Logic

### 5.1 Stylist-Centric Booking Flow
1. **Branch & Service Selection**: Customer selects branch and treatment (plus optional add-ons like +15m massage).
2. **Barber Selection**: Customer picks a specific barber attached to the branch, or selects "siapa-saja" (any available).
3. **Date & Real-Time Slot Generation**:
   - Operating hours: 10:00 - 21:00 (`OPEN_HOUR = 10`, `CLOSE_HOUR = 21`).
   - Server calculates 30-minute intervals from `10:00` until `21:00 - totalDuration`.
   - Query DB for existing bookings with `CONFIRMED` or `PENDING_PAYMENT` (created within last 15 minutes) for the chosen barber on that date.
   - Any overlapping time intervals are marked `tersedia: false`.
4. **Sensory Comfort Configuration**:
   - ASMR Mode: `headphone`, `speaker`, or `tanpa`.
   - Massage Intensity: `standar`, `ringan`, `kuat`, or `lewati`.
   - Conversation Style: `secukupnya` or `minimal` (*Quiet Chair*).
   - Private Room Request: Boolean (enabled if branch supports it).
5. **Checkout & Reservation Lock**:
   - Creates `Booking` record with status `PENDING_PAYMENT`.
   - Calls Midtrans Sandbox API to create transaction with ID `ATMOS-BK-...` and retrieve `snapToken`.
   - Customer completes payment via Midtrans Snap modal (QRIS / Virtual Account).

### 5.2 E-Commerce & Routine Builder
1. **Catalog & Routine Configurator**:
   - Routine matrix filters 3 products (Bersihkan, Rawat, Tata) based on `Rambut`, `Kulit Kepala`, and `Gaya`.
   - Set discount: 10% off total price when purchased as a 3-step ritual.
2. **Cart Management**:
   - Local state drawer with persistent item quantities.
3. **Checkout**:
   - Customer supplies recipient name, phone, full address, city, and postal code.
   - Creates `Order` with `OrderItem` snapshot prices and locks inventory.
   - Generates Midtrans Snap transaction with ID `ATMOS-ORD-...`.

### 5.3 Midtrans Webhook State Machine (`POST /api/webhooks/midtrans`)
- **Signature Verification**:
  ```ts
  const hash = crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`)
    .digest('hex');
  if (hash !== signature_key) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  ```
- **Dispatched State Transitions**:
  - **Booking Dispatcher (`ATMOS-BK-*`)**:
    - Status `settlement` | `capture`: Set `Booking.status = CONFIRMED`, `paidAt = now()`.
    - Status `deny` | `cancel` | `expire`: Set `Booking.status = CANCELLED`.
  - **Order Dispatcher (`ATMOS-ORD-*`)**:
    - Status `settlement` | `capture`: Set `Order.status = PAID`, decrement `Product.stock`, `paidAt = now()`.
    - Status `deny` | `cancel` | `expire`: Set `Order.status = CANCELLED`.

---

## 6. Staff & Operations Dashboard (`/admin`)

- **Route Guard**: Middleware enforces `user.role === 'STAFF' || user.role === 'ADMIN'`.
- **Schedule Management**:
  - Filter daily bookings by branch and date.
  - Action: **Check-In** button sets `Booking.status = CHECKED_IN`.
  - Action: **Complete & Add Notes** sets `Booking.status = COMPLETED` and creates a `CustomerNote` record linked to customer's dossier.
- **Logistics Pipeline**:
  - Filter orders: `PAID` → `PROCESSING` → `SHIPPED` → `DELIVERED`.
  - Logistics modal: Input courier name and tracking number (AWB/Resi), transitioning order to `SHIPPED`.
- **Client Sensory Profile Dossier**:
  - Search customer by name/phone/email.
  - View historical haircut details, past sensory notes, and purchase history.

---

## 7. Migration & Porting Plan from `generate/`

1. **Next.js Project Initialization**:
   - Initialize Next.js 15 App Router with TypeScript and Tailwind CSS v4 in the root workspace.
   - Copy `index.css` design tokens (`putih`, `kabut`, `perak`, `grafit`, `eucalyptus`, animations).
2. **Component Porting**:
   - Port `components/Ambient.tsx` and `lib/ambient.ts` (Web Audio API).
   - Port `components/JabodetabekMap.tsx` and `lib/geo.ts` (Haversine & SVG projection).
   - Port `components/Nav.tsx`, `components/Footer.tsx`, `components/ui.tsx`, `components/ProductCard.tsx`, `components/CartDrawer.tsx`.
3. **Page Routes Mapping**:
   - `pages/Home.tsx` → `app/(public)/page.tsx`
   - `pages/Layanan.tsx` → `app/(public)/layanan/page.tsx`
   - `pages/Cabang.tsx` → `app/(public)/cabang/page.tsx`
   - `pages/Shop.tsx` → `app/(public)/shop/page.tsx`
   - `pages/Booking.tsx` → `app/(public)/book/page.tsx`
4. **Backend & Persistence Layer Setup**:
   - Configure Prisma schema with connection pooling for Supabase.
   - Seed script importing 10 branches, 8 services, 11 barbers, and 5 products from `data.ts`.
   - Setup Midtrans Node.js client (`midtrans-client`) and webhook route handler.
5. **New Authenticated Portals**:
   - Implement Customer Dashboard: `app/(customer)/dashboard/page.tsx`.
   - Implement Staff Operations Dashboard: `app/(staff)/admin/page.tsx`.

---

## 8. Verification & Acceptance Criteria

- [ ] **Visual Identity**: All ported pages match the clean, restrained white/silver palette without component clutter or feature bloat.
- [ ] **Sensory Web Audio**: Ambient sound synthesizer plays smoothly and wave line animates without audio glitches or external file loads.
- [ ] **Interactive SVG Map**: Jabodetabek map correctly calculates distances and selects branches.
- [ ] **Booking Flow**: Slot availability reflects real database records per barber; overlapping slots are locked upon payment.
- [ ] **Midtrans Sandbox Integration**: Both Booking and E-commerce transactions trigger Snap popup, receive webhooks, and transition states reliably.
- [ ] **Staff Dashboard**: Staff can check-in customers, write sensory notes, view history, and enter tracking numbers for shipped orders.
