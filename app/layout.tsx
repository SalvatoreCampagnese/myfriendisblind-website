import type { Metadata, Viewport } from "next";
import { Anton, Barlow, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClarityProvider } from "@/components/ClarityProvider";
import Chrome from "@/components/Chrome";

/* The game names one typeface in exactly one place. So does this site.
   Craze.ttf — the shipping face — is licensed for personal use only, so the
   web build substitutes Anton: the same heavy condensed sans silhouette,
   freely licensed. */
const display = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Barlow({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-mono", display: "swap" });

const SITE = "https://myfriendisblind.game";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "MY FRIEND IS BLIND — two players, one pair of eyes",
  description:
    "A two-player asymmetric co-op game. One of you sees the room. The other can tell that something is there, but not what it is. You cannot move your friend. You can only talk.",
  keywords: ["co-op game", "asymmetric multiplayer", "two player", "Godot", "communication game", "party game"],
  openGraph: {
    title: "MY FRIEND IS BLIND",
    description: "Two friends enter the same room. One of them can see it.",
    url: SITE,
    siteName: "My Friend Is Blind",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "The same room, seen twice: blurred and black on the left, sharp and lit on the right." }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MY FRIEND IS BLIND",
    description: "Two friends enter the same room. One of them can see it.",
    images: ["/og.jpg"],
  },
  icons: { icon: "/icon.png", apple: "/icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#07090C",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <ClarityProvider>
          <Chrome />
          <main id="top">{children}</main>
        </ClarityProvider>
      </body>
    </html>
  );
}
