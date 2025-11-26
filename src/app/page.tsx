import { Header, Footer } from "@/components/layout";
import {
  Hero,
  Features,
  Problems,
  Benefits,
  Instructor,
  Pricing,
  Gallery,
  Access,
  Faq,
  Reservation,
} from "@/components/sections";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Problems />
        <Benefits />
        <Instructor />
        <Pricing />
        <Gallery />
        <Access />
        <Faq />
        <Reservation />
      </main>
      <Footer />
    </>
  );
}
