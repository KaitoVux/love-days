import type { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { MainSection } from "../components/MainSection";
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
                <MainTitle />
                <CountUp />
                <MainSection />
            </MainLayout>
        </section>
    );
};

export default Home;
