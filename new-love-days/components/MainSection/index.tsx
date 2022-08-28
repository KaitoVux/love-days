import Image from "next/image";
import React, { FC } from "react";
import { RoundedImage } from "../RoundedImage";
import styles from "./MainSection.module.scss";
import NiuBoa from "../../public/images/niu_boa.jpg";
import MiuLem from "../../public/images/miu_nem.jpg";
import Heart from "../../public/icons/heart.png";
import dayjs from "dayjs";

export const MainSection: FC = () => {
    const startDate = new Date("2020-08-22T00:00:00");
    return (
        <section id="image-section" className="grid grid-cols-5 gap-4 py-24">
            <div className="flex justify-end col-start-2">
                <RoundedImage img={NiuBoa} />
            </div>
            <div className="flex flex-col justify-center items-center">
                <div>
                    <Image width={64} className={styles.heart} height={64} src={Heart} alt="" objectFit="cover" />
                </div>
                <span className={`${styles.date} text-3xl font-bold pt-4`}>{dayjs(startDate).format("DD-MM-YYYY")}</span>
            </div>
            <div className="flex justify-start">
                <RoundedImage img={MiuLem} />
            </div>
        </section>
    );
};
