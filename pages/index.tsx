import type { NextPage } from "next";
import Head from "next/head";
import { Footer } from "../components/Footer";
import { MainSection } from "../components/MainSection";
import { Player } from "../components/Player";
import { MainTitle } from "../components/Title";
import { MainLayout } from "../layouts/MainLayout";
import { CountUp } from "../components/CountUp";

const Home: NextPage = () => {
  return (
    <section id="main" className="min-h-screen">
      <Head>
        <title>Love Days</title>
        <meta name="description" content="Made by Dat Vu with love" />
        <link rel="icon" href="/favicon.png" />
      </Head>
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
};

export default Home;
