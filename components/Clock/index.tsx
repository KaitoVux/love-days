import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export const Clock = () => {
    const [time, setTime] = useState(dayjs());

    useEffect(() => {
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