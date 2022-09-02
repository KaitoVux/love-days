import type { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { Footer } from "../components/Footer";
import { MainSection } from "../components/MainSection";
import { Player } from "../components/Player";
import { MainTitle } from "../components/Title";
import { MainLayout } from "../layouts/MainLayout";

const CountUp = dynamic<{}>(() => import("../components/CountUp").then((module) => module.CountUp), {
    ssr: false,
});

const Home: NextPage = () => {
    return (
        <section id="main">
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
                    </div>
                    <div className="mx-auto pt-16 xs:pt-10">
                        <Player />
                    </div>
                </div>
                <Footer/>
            </MainLayout>
        </section>
    );
};

export default Home;
