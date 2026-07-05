import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Globe, Instagram, Linkedin, QrCode } from "lucide-react";

const FakeQr = () => (
  <svg viewBox="0 0 33 33" className="w-44 h-44" aria-hidden="true">
    <rect width="33" height="33" fill="white" />
    {Array.from({ length: 33 * 33 }).map((_, i) => {
      const x = i % 33;
      const y = Math.floor(i / 33);
      // Deterministic pseudo-random pattern
      const on = (x * 7 + y * 13 + ((x * y) % 5)) % 3 === 0;
      // Finder patterns
      const inFinder =
        (x < 7 && y < 7) || (x > 25 && y < 7) || (x < 7 && y > 25);
      if (inFinder) return null;
      return on ? <rect key={i} x={x} y={y} width="1" height="1" fill="#0f172a" /> : null;
    })}
    {/* Finder patterns */}
    {[
      [0, 0],
      [26, 0],
      [0, 26],
    ].map(([fx, fy], i) => (
      <g key={i} transform={`translate(${fx} ${fy})`}>
        <rect width="7" height="7" fill="#0f172a" />
        <rect x="1" y="1" width="5" height="5" fill="white" />
        <rect x="2" y="2" width="3" height="3" fill="#0f172a" />
      </g>
    ))}
  </svg>
);

const FlipCardDemo = () => {
  return (
    <div className="flip-card w-[300px] h-[440px] mx-auto">
      <div className="flip-card-inner">
        {/* FRONT */}
        <div className="flip-card-front rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
          <div className="h-24 bg-gradient-to-br from-primary to-primary/60" />
          <div className="px-6 -mt-10 flex flex-col items-center text-center">
            <Avatar className="w-20 h-20 border-4 border-card shadow-md">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                AM
              </AvatarFallback>
            </Avatar>
            <h3 className="mt-3 text-lg font-bold text-card-foreground">Ana Martín</h3>
            <p className="text-sm text-muted-foreground">Diseñadora · Estudio Nova</p>
            <Badge variant="secondary" className="mt-2">@ana</Badge>

            <Button size="sm" className="mt-4 w-full">
              <Download className="w-4 h-4 mr-2" />
              Guardar contacto
            </Button>

            <div className="mt-3 grid grid-cols-3 gap-2 w-full">
              <div className="flex items-center justify-center py-2 rounded-lg bg-muted text-foreground">
                <Instagram className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-center py-2 rounded-lg bg-muted text-foreground">
                <Linkedin className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-center py-2 rounded-lg bg-muted text-foreground">
                <Globe className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div className="flip-card-back rounded-3xl border border-border bg-card shadow-xl flex flex-col items-center justify-center p-6">
          <div className="p-3 bg-white rounded-2xl shadow-sm">
            <FakeQr />
          </div>
          <p className="mt-5 text-sm font-medium text-card-foreground text-center">
            Escanea para ver mi perfil
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <QrCode className="w-3.5 h-3.5" />
            pulpy.link/ana
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCardDemo;
