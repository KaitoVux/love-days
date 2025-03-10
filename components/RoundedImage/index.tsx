import Image, { StaticImageData } from "next/image";
import React, { FC } from "react";
import styles from "./RoundedImage.module.scss";

export const RoundedImage: FC<{ img: StaticImageData }> = ({ img }) => {
    return (
        <div className={`${styles.imgWrapper} animate-spin-slow`}>
            <Image 
                className="rounded-full shadow-inner" 
                style={{ 
                    objectFit: 'cover',
                    objectPosition: 'center'
                }} 
                src={img} 
                alt=""
                width={200}
                height={200}
            />
        </div>
    );
};
