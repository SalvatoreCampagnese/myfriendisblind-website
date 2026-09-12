import type { Metadata } from "next";
import Deck from "@/components/pitch/Deck";

/* The deck lives at its own route rather than as a section of the home page:
   it is a document with its own reading order, and it takes the viewport. */

export const metadata: Metadata = {
  title: "PITCH — My Friend Is Blind",
  description:
    "Il pitch deck di My Friend Is Blind, settembre 2026: co-op asimmetrico per PC. Prodotto, mercato, comparable, pricing, proiezioni e go-to-market.",
  alternates: { canonical: "/pitch" },
  openGraph: {
    title: "MY FRIEND IS BLIND — PITCH DECK",
    description: "Due giocatori. Informazioni diverse. Una sola possibilità: comunicare.",
    url: "/pitch",
    type: "article",
  },
  // A deck is a snapshot of one month's numbers, not a page to rank.
  robots: { index: false, follow: true },
};

export default function PitchPage() {
  return <Deck />;
}
