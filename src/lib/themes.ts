export type ThemePreset = "light" | "dark" | "neon" | "minimal" | "gradient";

export interface ThemeDefinition {
  id: ThemePreset;
  name: string;
  description: string;
  // CSS vars applied at the microsite root
  vars: Record<string, string>;
  // Default background for the page
  background: string;
}

export const THEME_PRESETS: ThemeDefinition[] = [
  {
    id: "light",
    name: "Claro",
    description: "Limpio y minimalista en blanco.",
    vars: {
      "--ms-bg": "0 0% 100%",
      "--ms-fg": "240 10% 10%",
      "--ms-card": "0 0% 100%",
      "--ms-card-fg": "240 10% 10%",
      "--ms-muted": "240 5% 96%",
      "--ms-muted-fg": "240 4% 46%",
      "--ms-accent": "262 83% 58%",
      "--ms-accent-fg": "0 0% 100%",
      "--ms-border": "240 6% 90%",
    },
    background: "hsl(0 0% 100%)",
  },
  {
    id: "dark",
    name: "Oscuro",
    description: "Elegante en tonos profundos.",
    vars: {
      "--ms-bg": "240 10% 6%",
      "--ms-fg": "0 0% 98%",
      "--ms-card": "240 8% 10%",
      "--ms-card-fg": "0 0% 98%",
      "--ms-muted": "240 6% 14%",
      "--ms-muted-fg": "240 5% 65%",
      "--ms-accent": "262 83% 68%",
      "--ms-accent-fg": "0 0% 100%",
      "--ms-border": "240 6% 20%",
    },
    background: "hsl(240 10% 6%)",
  },
  {
    id: "neon",
    name: "Neón",
    description: "Vibrante con acentos eléctricos.",
    vars: {
      "--ms-bg": "270 50% 6%",
      "--ms-fg": "0 0% 98%",
      "--ms-card": "270 40% 10%",
      "--ms-card-fg": "0 0% 98%",
      "--ms-muted": "270 30% 16%",
      "--ms-muted-fg": "280 20% 75%",
      "--ms-accent": "180 100% 55%",
      "--ms-accent-fg": "270 50% 6%",
      "--ms-border": "300 60% 30%",
    },
    background:
      "radial-gradient(at 20% 20%, hsl(300 100% 30% / 0.5), transparent 60%), radial-gradient(at 80% 80%, hsl(180 100% 40% / 0.4), transparent 60%), hsl(270 50% 6%)",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Tipografía limpia, máximo blanco.",
    vars: {
      "--ms-bg": "30 20% 98%",
      "--ms-fg": "0 0% 8%",
      "--ms-card": "0 0% 100%",
      "--ms-card-fg": "0 0% 8%",
      "--ms-muted": "30 10% 94%",
      "--ms-muted-fg": "0 0% 40%",
      "--ms-accent": "0 0% 8%",
      "--ms-accent-fg": "0 0% 100%",
      "--ms-border": "30 10% 88%",
    },
    background: "hsl(30 20% 98%)",
  },
  {
    id: "gradient",
    name: "Gradiente",
    description: "Degradados modernos y suaves.",
    vars: {
      "--ms-bg": "240 30% 98%",
      "--ms-fg": "240 30% 12%",
      "--ms-card": "0 0% 100%",
      "--ms-card-fg": "240 30% 12%",
      "--ms-muted": "240 20% 95%",
      "--ms-muted-fg": "240 10% 45%",
      "--ms-accent": "280 80% 60%",
      "--ms-accent-fg": "0 0% 100%",
      "--ms-border": "240 15% 88%",
    },
    background:
      "linear-gradient(135deg, hsl(280 80% 92%) 0%, hsl(220 90% 92%) 50%, hsl(180 70% 92%) 100%)",
  },
];

export const DEFAULT_THEME: ThemePreset = "light";

export const FONT_OPTIONS: { id: string; name: string; stack: string }[] = [
  { id: "default", name: "Predeterminada", stack: "" },
  { id: "inter", name: "Inter", stack: "'Inter', system-ui, sans-serif" },
  { id: "manrope", name: "Manrope", stack: "'Manrope', system-ui, sans-serif" },
  { id: "playfair", name: "Playfair Display", stack: "'Playfair Display', Georgia, serif" },
  { id: "space-grotesk", name: "Space Grotesk", stack: "'Space Grotesk', system-ui, sans-serif" },
  { id: "dm-serif", name: "DM Serif Display", stack: "'DM Serif Display', Georgia, serif" },
  { id: "jetbrains", name: "JetBrains Mono", stack: "'JetBrains Mono', ui-monospace, monospace" },
];

export function hexToHslVar(hex: string): string | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hh = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hh = (g - b) / d + (g < b ? 6 : 0); break;
      case g: hh = (b - r) / d + 2; break;
      case b: hh = (r - g) / d + 4; break;
    }
    hh /= 6;
  }
  return `${Math.round(hh * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export interface MicrositeTheme {
  preset: ThemePreset;
  accentColor?: string; // hex, premium
  fontFamily?: string; // id, premium
  bgType?: "theme" | "color" | "gradient" | "image";
  bgValue?: string;
}
