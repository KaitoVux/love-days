import { Footer } from "@/components/Footer";
import { MainSection } from "@/components/MainSection";
import { Player } from "@/components/Player";
import { MainTitle } from "@/components/Title";
import { CountUp } from "@/components/CountUp";
import { MainLayout } from "@/layouts/MainLayout";

export default function Home() {
  return (
    <section id="main" className="min-h-screen">
      <MainLayout>
        <div className="grid md:grid-cols-3 xs:grid-cols-1 lg:gap-3 md:gap-2">
          <div className="md:col-span-2">
            <MainTitle />
            <CountUp />
            <MainSection />
            <Footer />
          </div>
          <div className="mx-auto pt-16">
            <Player />
          </div>
        </div>
      </MainLayout>
    </section>
  );
}
    