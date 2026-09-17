import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/store/auth-context";
import { BookingProvider } from "@/lib/store/booking-store";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ATMOS | Hair Lounge & Sensory Sanctuary",
  description:
    "Barbershop dan hair lounge di Jabodetabek dengan layanan pangkas rambut presisi, perawatan kulit kepala, pencarian cabang terdekat, produk perawatan, dan reservasi online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${plusJakartaSans.variable} ${syne.variable} antialiased bg-[#F8F7F4] text-[#121214]`}>
        <AuthProvider>
          <BookingProvider>{children}</BookingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
