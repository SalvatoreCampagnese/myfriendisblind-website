import Hero from "@/components/Hero";
import Switcher from "@/components/Switcher";
import Tower from "@/components/Tower";
import Gallery from "@/components/Gallery";
import TheGame from "@/components/TheGame";
import Roles from "@/components/Roles";
import Hazard from "@/components/Hazard";
import Perks from "@/components/Perks";
import Outro from "@/components/Outro";

export default function Page() {
  return (
    <>
      <Hero />
      {/* the proof first: one room seen twice, the tower, the rooms */}
      <Switcher />
      <Tower />
      <Gallery />
      <TheGame />
      <Roles />
      <Hazard />
      <Perks />
      <Outro />
    </>
  );
}
