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
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 inline-flex flex-col items-center gap-0.5"
      >
        <img src={logo} alt="Pulpy" className="w-6 h-6 object-contain" />
        <span className="text-[10px] font-medium text-muted-foreground">
          Hecho con <span className="font-semibold text-foreground">Pulpy</span>
        </span>
      </a>
    );
  }

  // "card" variant: logo del pulpo + texto, esquina inferior derecha, sin contorno
  return (
    <a
      href="https://pulpy.app"
      target="_blank"
      rel="noopener noreferrer"
      title="Hecho con Pulpy"
      className="absolute bottom-3 right-3 z-10 inline-flex flex-col items-center gap-0.5 opacity-80 hover:opacity-100 transition-opacity"
    >
      <img src={logo} alt="Pulpy" className="w-7 h-7 object-contain" />
      <span className="text-[9px] leading-none font-medium text-muted-foreground whitespace-nowrap">
        Hecho con <span className="font-semibold text-foreground">Pulpy</span>
      </span>
    </a>
  );
};

export default PulpyWatermark;
