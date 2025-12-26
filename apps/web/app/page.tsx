import { Title, ProfileSection, CountUp, Footer, FloatingHearts } from "@/components/LoveDays";

export default function Home() {
  return (
    <div className="min-h-[100svh] flex flex-col overflow-x-hidden relative">
      <FloatingHearts />
      <main className="flex-1 container mx-auto px-4 pt-4 pb-16 md:pt-6 md:pb-20 flex flex-col items-center justify-center gap-4 md:gap-5 relative z-10">
        <Title />
        <ProfileSection />
        <CountUp />
      </main>
      <Footer />
    </div>
  );
}
