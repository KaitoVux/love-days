"use client";

import { useState, useEffect } from "react";
import { calculateDaysBetween } from "@love-days/utils";

const Clock = () => {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setTime(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-xl md:text-2xl lg:text-3xl font-sans-clean text-muted-foreground tabular-nums">
      {time || "00:00:00"}
    </div>
  );
};

const CountUp = () => {
  const [mounted, setMounted] = useState(false);
  const startDate = new Date("2020-08-22T00:00:00");

  useEffect(() => {
    setMounted(true);
  }, []);

  const days = mounted ? calculateDaysBetween(startDate, new Date()) : 0;
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remainingDays = days % 30;

  return (
    <div
      className="flex flex-col items-center gap-4 p-6 md:p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/30 animate-fade-in"
      style={{ animationDelay: "0.6s" }}
    >
      <p className="text-sm md:text-base text-muted-foreground font-body uppercase tracking-wider">
        Together for
      </p>

      <div className="flex items-baseline gap-1">
        <span className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gradient">
          {days.toLocaleString()}
        </span>
        <span className="text-lg md:text-xl text-muted-foreground font-body">days</span>
      </div>

      <div className="flex gap-4 text-sm md:text-base text-muted-foreground font-body">
        <span>
          <strong className="text-foreground">{years}</strong> years
        </span>
        <span>
          <strong className="text-foreground">{months}</strong> months
        </span>
        <span>
          <strong className="text-foreground">{remainingDays}</strong> days
        </span>
      </div>

      <div className="mt-2">
        <Clock />
      </div>

      <p className="text-xs text-muted-foreground/70 font-body">Since August 22, 2020</p>
    </div>
  );
};

export default CountUp;
