import { Heart } from "lucide-react";
import Image from "next/image";
import NiuBoa from "@public/images/niu_boa.jpg";
import MiuLem from "@public/images/miu_nem.jpg";

const ProfileSection = () => {
  return (
    <div
      className="flex items-center justify-center gap-6 md:gap-10 lg:gap-16 animate-fade-in"
      style={{ animationDelay: "0.4s" }}
    >
      {/* Person 1 */}
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 p-0.5 glow-primary animate-float">
          <div className="w-full h-full rounded-full bg-card overflow-hidden">
            <Image
              src={NiuBoa}
              alt="Niu boà"
              className="w-full h-full object-cover"
              width={144}
              height={144}
            />
          </div>
        </div>
        <h3 className="mt-2 font-display text-lg md:text-xl lg:text-2xl font-semibold text-foreground">
          Niu boà
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground font-body">Forever yours</p>
      </div>

      {/* Heart connector */}
      <div className="flex flex-col items-center gap-1">
        <Heart
          className="w-8 h-8 md:w-10 md:h-10 lg:w-14 lg:h-14 text-primary animate-pulse-slow"
          fill="currentColor"
        />
        <span className="text-primary font-display text-sm md:text-base lg:text-lg">&</span>
      </div>

      {/* Person 2 */}
      <div className="flex flex-col items-center">
        <div
          className="w-20 h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 p-0.5 glow-primary animate-float"
          style={{ animationDelay: "1s" }}
        >
          <div className="w-full h-full rounded-full bg-card overflow-hidden">
            <Image
              src={MiuLem}
              alt="Mỉu Lem"
              className="w-full h-full object-cover"
              width={144}
              height={144}
            />
          </div>
        </div>
        <h3 className="mt-2 font-display text-lg md:text-xl lg:text-2xl font-semibold text-foreground">
          Mỉu Lem
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground font-body">Forever mine</p>
      </div>
    </div>
  );
};

export default ProfileSection;
