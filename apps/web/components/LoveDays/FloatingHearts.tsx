"use client";

import { Heart } from "lucide-react";
import { useMemo } from "react";

const FloatingHearts = () => {
  const hearts = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${8 + Math.random() * 6}s`,
        size: 12 + Math.random() * 16,
        opacity: 0.1 + Math.random() * 0.2,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map(heart => (
        <Heart
          key={heart.id}
          className="absolute text-primary animate-float-up"
          style={{
            left: heart.left,
            bottom: "-20px",
            width: heart.size,
            height: heart.size,
            opacity: heart.opacity,
            animationDelay: heart.delay,
            animationDuration: heart.duration,
          }}
          fill="currentColor"
        />
      ))}
    </div>
  );
};

export default FloatingHearts;
