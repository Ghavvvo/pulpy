import { Sparkles } from "lucide-react";

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

  return (
    <div className="border-t border-border bg-secondary/30 px-6 py-3 flex items-center justify-center">
      <a
        href="https://pulpy.app"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <Sparkles className="w-3 h-3 text-primary" />
        Hecho con <span className="font-semibold text-foreground">Pulpy</span>
      </a>
    </div>
  );
};

export default PulpyWatermark;
