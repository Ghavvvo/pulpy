import { Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";

interface PulpyWatermarkProps {
  variant?: "card" | "floating";
}

const PulpyWatermark = ({ variant = "card" }: PulpyWatermarkProps) => {
  if (variant === "floating") {
    return (
      <a
        href="https://pulpy.app"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur border border-border shadow-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        Hecho con <span className="font-semibold text-foreground">Pulpy</span>
      </a>
    );
  }

  // "card" variant: logo del pulpo en la esquina superior derecha de la cover
  return (
    <a
      href="https://pulpy.app"
      target="_blank"
      rel="noopener noreferrer"
      title="Hecho con Pulpy"
      className="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-8 h-8 rounded-full bg-card/80 backdrop-blur border border-border shadow-md hover:bg-card transition-colors"
    >
      <img src={logo} alt="Pulpy" className="w-5 h-5 object-contain" />
    </a>
  );
};

export default PulpyWatermark;
