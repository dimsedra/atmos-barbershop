# Design Specification: ATMOS Ecosystem & Multi-Portal Architecture

**Date:** 2026-09-17  
**Project:** ATMOS Hair Lounge & Sensory Sanctuary  
**Status:** Approved by Stakeholder (Eds)  
**Target Platform:** Next.js 15+ App Router, React 19, TypeScript, Tailwind CSS v4, Prisma ORM, PostgreSQL, Midtrans  

---

## 1. Executive Summary & Brand Positioning

**ATMOS** adalah jaringan *hair lounge & sensory sanctuary* berstandar tinggi di wilayah Jabodetabek. Membedakan diri secara radikal dari barbershop konvensional yang mengandalkan kecepatan dan antrean walk-in, ATMOS beroperasi dengan filosofi:
- **Strictly by Appointment**: Tidak melayani *walk-in* spontan guna menjamin privasi, ketenangan, dan ketiadaan antrean padat di ruang tunggu.
- **Sensory & Holistic Care**: Setiap layanan mengintegrasikan stimulasi audio ASMR (*Autonomous Sensory Meridian Response*), ritual relaksasi kepala/leher, serta opsi *Quiet Chair* (level interaksi percakapan minimal).
- **In-House Curated Formulations**: Seluruh lini produk perawatan rambut racikan mandiri (*custom haircare*) digunakan langsung dalam perawatan salon dan dipasarkan melalui e-commerce terkurasi.

Sistem perangkat lunak ATMOS dibangun sebagai ekosistem *full-stack* terpadu dengan pemisahan gerbang rute (*separated portals*) serta isolasi batas keamanan yang jelas antara pelanggan dan staf internal.

---

## 2. Core Architectural Principles & UI Design Directives

### 2.1 UI Hard Constraints ("Less is More")
Antarmuka web mematuhi disiplin estetika minimalis:
- **Zero Component Clutter**: Menghilangkan kartu dekoratif yang tidak perlu, *divider* berlebihan, dan widget grafik yang membingungkan.
- **Disciplined Whitespace**: Margin dan padding yang lapang dan seimbang untuk menciptakan atmosfer visual yang tenang, lapang, dan bernapas.
- **Design Tokens**: Mengadopsi palet warna monokromatik modern dari `generate/`:
  - `kanvas` (`#FAFAFC` / `#0E0E11` dark surface untuk bar navigasi)
  - `grafit` (`#18181B` / `#27272A`) untuk tipografi dan aksen kontras
  - `perak` (`#E4E4E7` / `#D4D4D8`) untuk garis batas subtil 1px
  - `aksen status` (`#047857` / `#10B981` emerald tenang) untuk penanda status aktif tanpa mencolok

### 2.2 Security & Authentication Boundary
- **Customer User Boundary (`CustomerUser`)**:
  - Berfokus pada pengalaman tanpa friksi (*low friction*).
  - Autentikasi cepat via OTP (WhatsApp/Email) atau *guest checkout* tanpa kewajiban mengingat kata sandi.
  - Sesi tersimpan dalam *client session cookie* yang hanya diizinkan mengakses portal publik (`/`, `/book`, `/shop`, `/customer/*`).
- **Internal Staff Boundary (`StaffUser`)**:
  - Dikelola dalam entitas terpisah khusus tim internal ATMOS.
  - Autentikasi ketat berbasis kata sandi berstandar hash kriptografi (`bcrypt`/`argon2`).
  - Halaman login terisolasi di `/internal/login`.
  - Middleware Next.js secara tegas menolak akses ke rute internal (`/ops`, `/supply`, `/hq`) bagi akun yang bukan `StaffUser`.

---

## 3. Role-Based Access Control (RBAC)

Sistem membedakan lima tingkat otorisasi:

| Role | Domain Rute | Deskripsi & Hak Akses |
|---|---|---|
| `CUSTOMER` | `/(public)` | Melakukan reservasi layanan, membeli produk, melihat riwayat booking & tracking resi sendiri. |
| `BRANCH_STAFF` | `/(staff)/ops` | Resepsionis & kapster studio. Mengelola jadwal harian, aksi *Check-in* → *In-Service* → *Check-out*, pencatatan formulasi treatment, dan *concierge reschedule*. |
| `BRANCH_MANAGER` | `/(staff)/ops` & `/(management)/hq` (Scoped) | Pimpinan cabang spesifik. Mengawasi jadwal staf cabangnya, mengajukan tiket restock produk salon, **menginput biaya operasional cabang secara manual**, dan melihat P&L bulanan cabangnya. |
| `WAREHOUSE_STAFF` | `/(warehouse)/supply` | Tim gudang pusat. Input batch produk (dengan tanggal kedaluwarsa), pemenuhan pesanan web (kemas & resi), dan persetujuan pengiriman restock cabang. |
| `EXECUTIVE` | `/(management)/hq` (Global) | Direktur & pemilik ATMOS. Memantau seluruh cabang Jabodetabek, komparasi performa cabang, audit laba rugi global, utilisasi kapster, dan kesehatan rantai pasok. |

---

## 4. Application Routes & Portals

### 4.1 Front-of-House Portal: `/(public)`
1. **Landing Experience (`/`)**:
   - Porting komponen dari `generate/`: Hero, Showcase Layanan, Mengapa Kami, Capster Roster, Branch Locator (Jabodetabek), E-Commerce Showcase, dan Testimonials.
2. **Dedicated Booking Engine (`/book`)**:
   - Pemilihan Cabang Jabodetabek → Layanan & Durasi → Kapster Pilihan → Kalender & Slot Waktu → Preferensi Sensory (ASMR, Tekanan Pijat, Quiet Chair) → Konfirmasi Pembayaran.
3. **E-Commerce Haircare (`/shop`)**:
   - Katalog produk racikan 3-langkah (Bersihkan, Rawat, Tata), detail produk, dan *Cart Drawer* terintegrasi.
4. **Customer Self-Service (`/customer/orders`)**:
   - Melihat status janji temu dan nomor resi pengiriman belanjaan produk.

### 4.2 Branch Operations Portal: `/(staff)/ops`
Akses terbatas untuk `BRANCH_STAFF` dan `BRANCH_MANAGER`:
1. **Papan Jadwal Harian (`/ops/schedule`)**:
   - Tampilan matriks waktu janji temu per kapster hari ini.
   - Tombol status aksi cepat:
     - `Check-In`: Ditandai saat tamu hadir tepat waktu.
     - `Mulai Layanan`: Tamu mulai menempati kursi treatment.
     - `Check-Out / Selesai`: Layanan tuntas.
2. **Formulir Input Formulasi & Sensory (`/ops/service-log`)**:
   - Muncul otomatis pasca check-out untuk mencatat preferensi rambut pelanggan (misal: "Aroma eucalyptus, kulit kepala sensitif, taper fade 1.5").
3. **VIP Concierge Booking & Reschedule (`/ops/concierge`)**:
   - Memfasilitasi pendaftaran jadwal baru atau memindahkan slot waktu atas permintaan langsung pelanggan VIP melalui telepon/WhatsApp salon.

### 4.3 Central Supply & Logistics Portal: `/(warehouse)/supply`
Akses terbatas untuk `WAREHOUSE_STAFF` dan `EXECUTIVE`:
1. **Manajemen Batch & Kedaluwarsa (`/supply/batches`)**:
   - Formulir input batch baru: Pemilihan Produk, Nomor Batch, Jumlah Unit Masuk, dan Tanggal Kedaluwarsa (*Expiry Date*).
   - Penegakan algoritma **FEFO** (*First Expired, First Out*).
   - Otomatisasi Kedaluwarsa: Sistem mendeteksi `currentDate > expiryDate` secara harian dan otomatis mencoret sisa stok batch terkait dari stok aktif.
2. **Pemenuhan Order E-Commerce (`/supply/orders`)**:
   - Antrean pesanan web: status `PAID` → `PACKED` → `SHIPPED`.
   - Input nama ekspedisi/kurir dan Nomor Resi (*Tracking AWB*).
3. **Pusat Permintaan Restock Cabang (`/supply/requisitions`)**:
   - Menerima tiket permintaan produk dari Branch Manager untuk pemakaian salon.
   - Aksi: `Approve & Dispatch` (memotong batch stok gudang pusat dan mencatat tanggal kirim).

### 4.4 Management & Executive Portal: `/(management)/hq`
Akses terbagi berdasarkan otorisasi (`BRANCH_MANAGER` terisolasi pada cabangnya, `EXECUTIVE` mencakup seluruh cabang):
1. **Ikhtisar Eksekutif (`/hq/overview`)**:
   - Rasio okupansi kursi (*Seat Occupancy Rate*) per cabang.
   - Jam produktivitas layanan kapster per periode.
   - Peringatan Dini Pasokan (*Supply Health Alert*): Notifikasi batch yang mendekati masa kedaluwarsa (<30 hari) dan status persediaan menipis.
2. **Laporan Laba/Rugi Bulanan Otomatis (`/hq/finance`)**:
   - **Komponen Pendapatan (+)**: Akumulasi nilai transaksi dari seluruh booking berstatus `COMPLETED` di cabang terkait.
   - **Beban Gaji Otomatis (-)**: Gaji pokok staf/kapster cabang + komisi per layanan yang diselesaikan.
   - **Beban Pemakaian Produk Otomatis (-)**: Total harga modal (*cost price*) dari batch produk yang dikirimkan via *BranchRequisition* untuk salon.
   - **Beban Operasional Manual (-)**: Kompilasi catatan biaya harian/bulanan (seperti tagihan listrik, air, binatu handuk, perbaikan fasilitas) yang **diinput manual oleh Branch Manager**.
   - **Laba Bersih Cabang (=)**: Nilai kalkulasi bersih riil performa cabang.
3. **Master Data Cabang & Personel (`/hq/branches`)**:
   - Konfigurasi cabang, jam operasional, dan alokasi personel.

---

## 5. Database Schema & Data Models (Prisma ORM)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

// --------------------------------------------------------
// ENUMS
// --------------------------------------------------------

enum StaffRole {
  BRANCH_STAFF
  BRANCH_MANAGER
  WAREHOUSE_STAFF
  EXECUTIVE
}

enum BookingStatus {
  CONFIRMED
  CHECKED_IN
  IN_SERVICE
  COMPLETED
  CANCELLED
}

enum OrderStatus {
  PENDING_PAYMENT
  PAID
  PACKED
  SHIPPED
  DELIVERED
  CANCELLED
}

enum BatchStatus {
  ACTIVE
  DEPLETED
  EXPIRED
}

enum RequisitionStatus {
  PENDING
  APPROVED
  DISPATCHED
  RECEIVED
  REJECTED
}

// --------------------------------------------------------
// AUTHENTICATION & USERS (ISOLATED BOUNDARIES)
// --------------------------------------------------------

model CustomerUser {
  id            String         @id @default(uuid())
  name          String
  phone         String         @unique
  email         String?        @unique
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  bookings      Booking[]
  orders        Order[]
  sensoryNotes  SensoryProfile[]
}

model StaffUser {
  id            String         @id @default(uuid())
  username      String         @unique
  email         String         @unique
  passwordHash  String
  fullName      String
  role          StaffRole
  branchId      String?        // Nullable untuk WAREHOUSE_STAFF dan EXECUTIVE
  baseSalary    Int            @default(0) // IDR
  isActive      Boolean        @default(true)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  branch        Branch?        @relation(fields: [branchId], references: [id])
  capsterProfile Capster?
  authoredNotes SensoryProfile[]
  manualExpenses BranchExpense[]
  requisitions  BranchRequisition[]
}

// --------------------------------------------------------
// BRANCH & CAPSTER
// --------------------------------------------------------

model Branch {
  id              String         @id
  name            String
  city            String
  address         String
  latitude        Float
  longitude       Float
  phone           String
  whatsapp        String
  isActive        Boolean        @default(true)
  createdAt       DateTime       @default(now())

  staff           StaffUser[]
  capsters        Capster[]
  bookings        Booking[]
  requisitions    BranchRequisition[]
  monthlyReports  BranchMonthlyReport[]
  expenses        BranchExpense[]
}

model Capster {
  id                  String     @id @default(uuid())
  staffUserId         String     @unique
  displayName         String
  specialties         String[]
  commissionPerService Int       @default(25000) // IDR per service
  rating              Float      @default(5.0)
  branchId            String

  staffUser           StaffUser  @relation(fields: [staffUserId], references: [id], onDelete: Cascade)
  branch              Branch     @relation(fields: [branchId], references: [id])
  bookings            Booking[]
}

// --------------------------------------------------------
// SERVICES & APPOINTMENTS (STRICTLY BY APPOINTMENT)
// --------------------------------------------------------

model Service {
  id              String         @id
  title           String
  subtitle        String
  duration        Int            // Menit
  price           Int            // IDR
  targetAudience  String         // Pria / Wanita / Semua
  asmrIncluded    Boolean        @default(true)
  description     String
  steps           String[]
  isActive        Boolean        @default(true)

  bookings        Booking[]
}

model Booking {
  id              String         @id @default(uuid())
  bookingCode     String         @unique // e.g., ATMOS-BK-202609-XXXX
  branchId        String
  serviceId       String
  capsterId       String
  customerId      String?        // Nullable jika diinput via Concierge Guest
  guestName       String
  guestPhone      String
  
  bookingDate     String         // YYYY-MM-DD
  startMinute     Int            // Menit sejak tengah malam (e.g. 600 untuk 10:00)
  duration        Int            // Menit
  totalPrice      Int            // IDR

  // Sensory Preferences
  asmrMode        String         @default("headphone") // "headphone" | "speaker" | "tanpa"
  massageForce    String         @default("standar")   // "ringan" | "standar" | "kuat" | "lewati"
  talkPreference  String         @default("secukupnya") // "secukupnya" | "quiet_chair"
  notes           String?

  status          BookingStatus  @default(CONFIRMED)
  checkedInAt     DateTime?
  serviceStartedAt DateTime?
  completedAt     DateTime?

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  branch          Branch         @relation(fields: [branchId], references: [id])
  service         Service        @relation(fields: [serviceId], references: [id])
  capster         Capster        @relation(fields: [capsterId], references: [id])
  customer        CustomerUser?  @relation(fields: [customerId], references: [id])
  sensoryProfile  SensoryProfile?
}

model SensoryProfile {
  id              String         @id @default(uuid())
  customerId      String
  staffId         String
  bookingId       String?        @unique
  formulaNotes    String         // Formula potongan, nomor guard, aroma minyak esensial
  scalpCondition  String?        // Karakteristik kulit kepala
  createdAt       DateTime       @default(now())

  customer        CustomerUser   @relation(fields: [customerId], references: [id])
  staff           StaffUser      @relation(fields: [staffId], references: [id])
  booking         Booking?       @relation(fields: [bookingId], references: [id])
}

// --------------------------------------------------------
// INVENTORY, BATCHES & EXPIRY ENGINE (CENTRALIZED)
// --------------------------------------------------------

model Product {
  id              String         @id
  name            String
  number          String         // e.g., "N° 01"
  tagline         String
  category        String         // "Bersihkan", "Rawat", "Tata"
  volume          String         // e.g., "250 ml"
  price           Int            // Retail price IDR
  costPrice       Int            // Modal pengadaan IDR
  ingredients     String
  scentNotes      String[]
  image           String
  isActive        Boolean        @default(true)

  batches         ProductBatch[]
  orderItems      OrderItem[]
  requisitionItems RequisitionItem[]
}

model ProductBatch {
  id              String         @id @default(uuid())
  productId       String
  batchNumber     String         // e.g., "BAT-2026-09-001"
  initialQuantity Int
  currentQuantity Int
  receivedDate    DateTime       @default(now())
  expiryDate      DateTime       // Tanggal kedaluwarsa
  status          BatchStatus    @default(ACTIVE)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  product         Product        @relation(fields: [productId], references: [id])
}

model BranchRequisition {
  id              String            @id @default(uuid())
  requisitionCode String            @unique // e.g., REQ-202609-XXXX
  branchId        String
  managerId       String
  status          RequisitionStatus @default(PENDING)
  totalCostValue  Int               @default(0) // Akumulasi costPrice produk yang diminta
  notes           String?
  dispatchedAt    DateTime?
  receivedAt      DateTime?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  branch          Branch            @relation(fields: [branchId], references: [id])
  manager         StaffUser         @relation(fields: [managerId], references: [id])
  items           RequisitionItem[]
}

model RequisitionItem {
  id              String            @id @default(uuid())
  requisitionId   String
  productId       String
  quantity        Int
  costPerUnit     Int

  requisition     BranchRequisition @relation(fields: [requisitionId], references: [id], onDelete: Cascade)
  product         Product           @relation(fields: [productId], references: [id])
}

// --------------------------------------------------------
// E-COMMERCE & LOGISTICS
// --------------------------------------------------------

model Order {
  id              String         @id @default(uuid())
  orderCode       String         @unique // e.g., ATMOS-ORD-202609-XXXX
  customerId      String?
  totalAmount     Int
  status          OrderStatus    @default(PAID)

  // Shipping Information
  recipientName   String
  recipientPhone  String
  shippingAddress String
  shippingCity    String
  postalCode      String
  courierName     String?        // e.g., "JNE", "SiCepat"
  trackingNumber  String?        // No. Resi (AWB)
  shippedAt       DateTime?

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  customer        CustomerUser?  @relation(fields: [customerId], references: [id])
  items           OrderItem[]
}

model OrderItem {
  id              String         @id @default(uuid())
  orderId         String
  productId       String
  quantity        Int
  priceAtPurchase Int

  order           Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product         Product        @relation(fields: [productId], references: [id])
}

// --------------------------------------------------------
// AUTOMATED BRANCH FINANCIALS & MANUAL EXPENSES
// --------------------------------------------------------

model BranchExpense {
  id              String         @id @default(uuid())
  branchId        String
  managerId       String
  category        String         // "Listrik & Utilitas", "Binatu Handuk", "Perawatan Studio", "Lainnya"
  amount          Int            // IDR
  description     String
  expenseDate     DateTime       @default(now())
  createdAt       DateTime       @default(now())

  branch          Branch         @relation(fields: [branchId], references: [id])
  manager         StaffUser      @relation(fields: [managerId], references: [id])
}

model BranchMonthlyReport {
  id                    String   @id @default(uuid())
  branchId              String
  month                 Int      // 1 - 12
  year                  Int      // e.g., 2026

  // Automated Metrics
  grossServiceRevenue   Int      @default(0) // Total dari booking COMPLETED
  staffPayrollDeduction Int      @default(0) // Gaji pokok + komisi layanan kapster
  productUsageDeduction Int      @default(0) // Nilai modal produk dari Requisition salon
  manualExpenseDeduction Int     @default(0) // Total dari BranchExpense manual
  netProfit             Int      @default(0) // grossServiceRevenue - total deductions

  generatedAt           DateTime @default(now())
  updatedAt             DateTime @updatedAt

  branch                Branch   @relation(fields: [branchId], references: [id])

  @@unique([branchId, month, year])
}
```

---

## 6. Business Logic & Automated Workflows

### 6.1 Strictly Appointment-Only Slot Calculation
- Studio beroperasi pukul `10:00` sampai `21:00` WIB (`OPEN_MINUTE = 600`, `CLOSE_MINUTE = 1260`).
- Sistem menghitung interval waktu per 15/30 menit sesuai durasi layanan terpilih.
- Query memeriksa jadwal aktif kapster terpilih pada tanggal tersebut dengan status `CONFIRMED`, `CHECKED_IN`, atau `IN_SERVICE`.
- Slot yang bertabrakan (*overlap*) secara instan dinonaktifkan dari pemilihan antarmuka tamu.

### 6.2 FEFO Batch Expiry & Inventory Engine
1. **Penerimaan Batch**: Staf gudang mendaftarkan batch dengan kuantitas dan tanggal kedaluwarsa.
2. **Pengurangan Stok (Penjualan Web & Requisition Cabang)**:
   - Sistem mencari batch aktif (`status = ACTIVE`) dengan `expiryDate` terdekat yang masih berlaku.
   - Stok terpotong dari batch tersebut. Jika kuantitas habis, status diubah menjadi `DEPLETED`.
3. **Scheduled Expiry Sweep**:
   - Rutinitas server memeriksa seluruh batch aktif setiap hari pukul `00:01` WIB.
   - Seluruh batch dengan `expiryDate < currentDate` otomatis diubah ke `status = EXPIRED` dan kuantitas aktifnya dieliminasi.

### 6.3 Automated Financial Reconciliation
Setiap awal bulan (atau saat dipanggil *on-demand* oleh Branch Manager / Executive):
1. **Layanan Selesai**: `SUM(Booking.totalPrice)` untuk booking `COMPLETED` pada bulan tersebut.
2. **Kalkulasi Payroll**: `SUM(StaffUser.baseSalary)` + `COUNT(Services Completed) * Capster.commissionPerService`.
3. **Beban Produk Salon**: `SUM(RequisitionItem.quantity * RequisitionItem.costPerUnit)` untuk permintaan cabang berstatus `RECEIVED`.
4. **Beban Manual**: `SUM(BranchExpense.amount)` yang diinput oleh Branch Manager pada bulan tersebut.
5. **Kompilasi Laba Bersih**: `netProfit = ServiceRevenue - Payroll - ProductUsage - ManualExpenses`.

---

## 7. Migration & Implementation Stages

1. **Stage 1: Project Scaffolding & Shared Design Tokens**
   - Inisialisasi Next.js 15 App Router (TypeScript, Tailwind CSS v4, Lucide React).
   - Porting token warna dan font dari `generate/src/index.css`.
2. **Stage 2: Database Schema & Authentication Setup**
   - Migrasi skema Prisma ke Supabase PostgreSQL.
   - Implementasi dual-auth middleware (`CustomerUser` session vs `StaffUser` credentials di `/internal/login`).
3. **Stage 3: Public Front-of-House Porting**
   - Porting komponen landing page dari `generate/src/components/*` ke `app/(public)`.
   - Implementasi modul booking strictly by appointment (`/book`) dan e-commerce (`/shop`).
4. **Stage 4: Branch Operations Portal (`/(staff)/ops`)**
   - Implementasi papan jadwal harian kapster, tombol aksi check-in, form catatan formulasi sensory, dan concierge reschedule.
5. **Stage 5: Central Supply & Logistics Portal (`/(warehouse)/supply`)**
   - Implementasi manajemen batch produk dengan expiry tracking otomatis, antrean packing & nomor resi, serta persetujuan restock cabang.
6. **Stage 6: Management & Financial Portal (`/(management)/hq`)**
   - Dashboard analitik okupansi kursi dan utilisasi kapster.
   - Modul input biaya operasional cabang oleh Branch Manager.
   - Laporan laba/rugi bulanan terotomatisasi dan view audit eksekutif.

---

## 8. Verification & Acceptance Criteria

- [ ] **Akses Terisolasi**: Staf cabang atau pelanggan tidak dapat mengakses rute pimpinan (`/hq`) atau rute gudang (`/supply`).
- [ ] **Janji Temu Eksklusif**: Booking hanya menerima reservasi terjadwal; tidak ada opsi walk-in, dan benturan jadwal kapster dicegah secara otomatis.
- [ ] **Manajemen Batch FEFO**: Produk yang keluar dari gudang memotong batch terdekat masa kedaluwarsanya; batch kedaluwarsa dinonaktifkan otomatis.
- [ ] **Alur Logistik E-Commerce**: Pesanan pembeli web dapat diperbarui statusnya dan diberikan nomor resi kurir.
- [ ] **Integritas Pembukuan Cabang**: Branch Manager dapat menginput beban manual, dan sistem menghitung laba bersih bulanan cabang dengan menggabungkan omset, gaji otomatis, dan deduksi restock.
- [ ] **Kepatuhan UI**: Semua antarmuka menganut prinsip *Less is More*—bersih, lapang, tanpa dekorasi berlebih.
