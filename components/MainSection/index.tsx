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
        <section id="image-section" className="grid lg:grid-cols-3 sm:grid-cols-1 lg:gap-4 md:gap-2 py-24">
            <div className="flex justify-end xs:justify-center flex-col items-center">
                <RoundedImage img={NiuBoa} />
                <span className={`pt-10 text-5xl ${styles.name}`}>Niu boà</span>
            </div>
            <div className="flex flex-col justify-center items-center xs:py-4">
                <div>
                    <Image 
                        width={64} 
                        height={64} 
                        className={styles.heart} 
                        src={Heart} 
                        alt=""
                        style={{ objectFit: 'cover' }} 
                    />
                </div>
                <span className={`${styles.date} text-3xl font-bold pt-4`}>
                    {dayjs(startDate).format("DD-MM-YYYY")}
                </span>
            </div>
            <div className="flex lg:justify-start xs:justify-center flex-col items-center">
                <RoundedImage img={MiuLem} />
                <span className={`pt-10 text-5xl ${styles.name}`}>Mỉu Lem</span>
            </div>
        </section>
    );
};
