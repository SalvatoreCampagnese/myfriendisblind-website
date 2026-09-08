import Hero from "@/components/Hero";
import TheGame from "@/components/TheGame";
import Roles from "@/components/Roles";
import Hazard from "@/components/Hazard";
import Perks from "@/components/Perks";
import Tower from "@/components/Tower";
import Gallery from "@/components/Gallery";
import Make from "@/components/Make";
import Outro from "@/components/Outro";

export default function Page() {
  return (
    <>
      <Hero />
      <TheGame />
      <Roles />
      <Hazard />
      <Perks />
      <Tower />
      <Gallery />
      <Make />
      <Outro />
    </>
  );
}
