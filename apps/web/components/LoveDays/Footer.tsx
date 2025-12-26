import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-4 md:py-6 text-center animate-fade-in" style={{ animationDelay: "0.8s" }}>
      <p className="text-sm md:text-base text-muted-foreground font-body flex items-center justify-center gap-2">
        Made with <Heart className="w-4 h-4 text-primary animate-pulse-slow" fill="currentColor" />{" "}
        for us
      </p>
    </footer>
  );
};

export default Footer;
