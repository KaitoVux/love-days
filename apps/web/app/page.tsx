import {
  Title,
  ProfileSection,
  CountUp,
  Footer,
  FloatingHearts,
  MusicSidebar,
} from "@/components/LoveDays";
import { getSongs } from "@love-days/utils";

export default async function Home() {
  // Fetch songs at build time (static export)
  const songs = await getSongs();

  return (
    <div className="min-h-[100svh] flex flex-col overflow-x-hidden relative">
      <FloatingHearts />
      <MusicSidebar songs={songs} />
      <main className="flex-1 container mx-auto px-4 pt-4 pb-16 md:pt-6 md:pb-20 flex flex-col items-center justify-center gap-4 md:gap-5 relative z-10">
        <Title />
        <ProfileSection />
        <CountUp />
      </main>
      <Footer />
    </div>
  );
}
