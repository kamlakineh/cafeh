import type { Metadata } from "next";
import "../src/index.css";

export const metadata: Metadata = {
  title: "Aura Café — Luxury Dining Experience",
  description:
    "Premium dark-themed café with gold accents. Truffle Wagyu burgers, craft drinks, and an unforgettable dining experience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
