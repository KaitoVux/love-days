'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export const Clock = () => {
    const [time, setTime] = useState(() => dayjs().hour(0).minute(0).second(0));

    useEffect(() => {
        // Update immediately on mount
        setTime(dayjs());

        const timer = setInterval(() => {
            setTime(dayjs());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="text-4xl pt-4 font-medium">
            {time.format('HH')} hours {time.format('mm')} mins {time.format('ss')} secs
        </div>
    );
}; 