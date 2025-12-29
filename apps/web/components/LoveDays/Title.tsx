import { Heart } from "lucide-react";

const Title = () => {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-3 animate-fade-in">
      <Heart
        className="w-5 h-5 md:w-7 md:h-7 lg:w-8 lg:h-8 text-primary animate-pulse-slow"
        fill="currentColor"
      />
      <h1 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold text-gradient leading-tight whitespace-nowrap pb-2">
        Love Days
      </h1>
      <Heart
        className="w-5 h-5 md:w-7 md:h-7 lg:w-8 lg:h-8 text-primary animate-pulse-slow"
        fill="currentColor"
      />
    </div>
  );
};

export default Title;
