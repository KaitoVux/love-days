import { FC, useEffect, useState } from "react";
import Clock from "react-live-clock";
import styles from "./CountUp.module.scss";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export const CountUp: FC = () => {
    const startDate = new Date("2020-08-22T00:00:00");
    const [datePass, setDatePass] = useState<string>("");

    useEffect(() => {
        const now = dayjs();
        const duration = dayjs.duration(now.diff(dayjs(startDate)));
        setDatePass(
            `${duration.years()} Years ${duration.months() ? duration.months() + "Months" : ""} ${
                duration.days() ? duration.days() + " Days" : ""
            }`
        );
    }, []);

    return (
        <section id="clock">
            <div
                className={`${styles.wrapper} flex flex-col items-center rounded-full shadow-inner p-6 max-w-lg mx-auto`}
            >
                <span className={"text-5xl font-bold"}>{datePass}</span>
                <Clock
                    className={"text-4xl pt-4 font-medium"}
                    format={"HH [hours] mm [mins] ss [secs]"}
                    ticking={true}
                    timezone="Asia/Ho_Chi_Minh"
                />
            </div>
        </section>
    );
};
