import React, { FC } from "react";
import styles from "./MainTitle.module.scss";

export const MainTitle: FC = () => {
  const title = "Love Days";
  return <h1 className={`${styles.title} text-center text-8xl font-bold py-12`}>{title}</h1>;
};
