import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://collapsar.vercel.app"),
  title: "Collapsar — Merge to the Void",
  description:
    "Drop, merge, and collapse celestial bodies into a singularity. A daily-seeded merge puzzle with global leaderboards.",
  applicationName: "Collapsar",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Collapsar" },
  openGraph: {
    title: "Collapsar — Merge to the Void",
    description: "Drop, merge, and collapse celestial bodies into a singularity.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Collapsar — Merge to the Void",
    description: "Drop, merge, and collapse celestial bodies into a singularity.",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#05040a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
