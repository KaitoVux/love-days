"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

// Extend dayjs with plugins
dayjs.extend(duration);
dayjs.extend(relativeTime);

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center p-3 md:p-4 bg-card/40 backdrop-blur-md rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(255,182,193,0.15)] min-w-[80px] md:min-w-[100px] animate-fade-in hover:scale-105 transition-transform duration-300">
    <span className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary drop-shadow-sm">
      {String(value).padStart(2, "0")}
    </span>
    <span className="text-xs md:text-sm font-body text-muted-foreground uppercase tracking-widest mt-1">
      {label}
    </span>
  </div>
);

const CountUp = () => {
  const [timeDiff, setTimeDiff] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalDays: 0,
  });

  const startDate = "2020-08-22T00:00:00";

  useEffect(() => {
    const updateTime = () => {
      const start = dayjs(startDate);
      const now = dayjs();
      const diff = dayjs.duration(now.diff(start));

      setTimeDiff({
        years: diff.years(),
        months: diff.months(),
        days: diff.days(),
        hours: diff.hours(),
        minutes: diff.minutes(),
        seconds: diff.seconds(),
        totalDays: Math.floor(now.diff(start, "day")),
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-5xl mx-auto py-8">
      <div className="flex flex-col items-center animate-fade-in gap-2">
        <p className="text-sm md:text-lg text-muted-foreground font-body tracking-wider">
          Together since <span className="text-primary font-bold">August 22, 2020</span>
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground flex items-center gap-3">
          <span className="text-primary">{timeDiff.totalDays.toLocaleString()}</span>
          <span className="text-primary">days of love</span>
          <span className="animate-heartbeat text-red-500">💕</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 w-full px-4">
        <TimeUnit value={timeDiff.years} label="Years" />
        <TimeUnit value={timeDiff.months} label="Months" />
        <TimeUnit value={timeDiff.days} label="Days" />
        <TimeUnit value={timeDiff.hours} label="Hours" />
        <TimeUnit value={timeDiff.minutes} label="Mins" />
        <TimeUnit value={timeDiff.seconds} label="Secs" />
      </div>
    </div>
  );
};

export default CountUp;
