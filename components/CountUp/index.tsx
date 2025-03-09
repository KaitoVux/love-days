import { FC, useEffect, useState } from "react";
import styles from "./CountUp.module.scss";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { Clock } from "../Clock";

dayjs.extend(duration);

export const CountUp: FC = () => {
    const startDate = new Date("2020-08-22T00:00:00");
    const [datePass, setDatePass] = useState<string>("");

    useEffect(() => {
        const updateDuration = () => {
            const now = dayjs();
            const duration = dayjs.duration(now.diff(dayjs(startDate)));
            setDatePass(
                `${duration.years()} Years ${duration.months() ? duration.months() + " Months" : ""} ${
                    duration.days() ? duration.days() + " Days" : ""
                }`
            );
        };

        // Update immediately
        updateDuration();

        // Update every minute
        const timer = setInterval(updateDuration, 60000);

        return () => clearInterval(timer);
    }, []);

    return (
        <section id="clock">
            <div className={"flex justify-center"}>
                <div
                    className={`${styles.wrapper} flex flex-col items-center rounded-full w-fit shadow-inner px-9 py-6`}
                >
                    <div className={"text-5xl font-bold"}>{datePass}</div>
                    <Clock />
                </div>
            </div>
        </section>
    );
};
