import { useEffect, useMemo, useRef, useState } from "react";
import QRCodeStyling, {
  type DotType,
  type CornerSquareType,
  type CornerDotType,
  type Options as QrOptions,
} from "qr-code-styling";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Crown, Download, Image as ImageIcon, X, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface QrDesignerProps {
  profileUrl: string;
  isPremium: boolean;
  userId?: string;
  defaultLogo?: string;
  onUpgrade?: () => void;
}

interface QrConfig {
  dotsType: DotType;
  cornersSquareType: CornerSquareType;
  cornersDotType: CornerDotType;
  dotsColor: string;
  bgColor: string;
  cornersColor: string;
  logo?: string;
  frame: "none" | "scan" | "tap" | "follow" | "custom";
  frameText: string;
  frameColor: string;
}

const DEFAULT_CONFIG: QrConfig = {
  dotsType: "square",
  cornersSquareType: "square",
  cornersDotType: "square",
  dotsColor: "#0F0F23",
  bgColor: "#FFFFFF",
  cornersColor: "#0F0F23",
  frame: "none",
  frameText: "Escanéame",
  frameColor: "#6D28D9",
};

const DOT_TYPES: { value: DotType; label: string }[] = [
  { value: "square", label: "Cuadrado" },
  { value: "rounded", label: "Redondeado" },
  { value: "dots", label: "Puntos" },
  { value: "classy", label: "Elegante" },
  { value: "classy-rounded", label: "Elegante redondeado" },
  { value: "extra-rounded", label: "Extra redondeado" },
];

const CORNER_TYPES: { value: CornerSquareType; label: string }[] = [
  { value: "square", label: "Cuadrado" },
  { value: "extra-rounded", label: "Redondeado" },
  { value: "dot", label: "Círculo" },
];

const CORNER_DOT_TYPES: { value: CornerDotType; label: string }[] = [
  { value: "square", label: "Cuadrado" },
  { value: "dot", label: "Punto" },
];

const FRAME_OPTIONS = [
  { value: "none", label: "Sin marco" },
  { value: "scan", label: "Escanéame" },
  { value: "tap", label: "Tócame" },
  { value: "follow", label: "Sígueme" },
  { value: "custom", label: "Personalizado" },
] as const;

const QrDesigner = ({ profileUrl, isPremium, userId, defaultLogo, onUpgrade }: QrDesignerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, updateProfile } = useAuth();

  const [config, setConfig] = useState<QrConfig>(() => {
    const saved = (user as { qrConfig?: Partial<QrConfig> } | null)?.qrConfig;
    return { ...DEFAULT_CONFIG, ...(saved || {}), logo: saved?.logo ?? defaultLogo };
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const effectiveConfig = useMemo<QrConfig>(() => {
    if (isPremium) return config;
    return {
      ...DEFAULT_CONFIG,
      // Free users get plain QR with current URL only
    };
  }, [config, isPremium]);

  const qrSize = 260;

  const buildOptions = (size: number, withLogo: boolean): QrOptions => ({
    width: size,
    height: size,
    type: "svg",
    data: profileUrl,
    margin: 8,
    qrOptions: { errorCorrectionLevel: "H" },
    image: withLogo && effectiveConfig.logo ? effectiveConfig.logo : undefined,
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 4,
      imageSize: 0.25,
      hideBackgroundDots: true,
    },
    dotsOptions: { color: effectiveConfig.dotsColor, type: effectiveConfig.dotsType },
    backgroundOptions: { color: effectiveConfig.bgColor },
    cornersSquareOptions: {
      color: effectiveConfig.cornersColor,
      type: effectiveConfig.cornersSquareType,
    },
    cornersDotOptions: {
      color: effectiveConfig.cornersColor,
      type: effectiveConfig.cornersDotType,
    },
  });

  // Initialize / re-render preview
  useEffect(() => {
    if (!containerRef.current) return;
    if (!qrInstanceRef.current) {
      qrInstanceRef.current = new QRCodeStyling(buildOptions(qrSize, true));
      containerRef.current.innerHTML = "";
      qrInstanceRef.current.append(containerRef.current);
    } else {
      qrInstanceRef.current.update(buildOptions(qrSize, true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileUrl, effectiveConfig]);

  const updateConfig = (patch: Partial<QrConfig>) => {
    if (!isPremium) {
      onUpgrade?.();
      return;
    }
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      // persist quietly
      try {
        void (updateProfile as (d: unknown) => unknown)({ qrConfig: next });
      } catch { /* ignore */ }
      return next;
    });
  };

  const frameLabel = (() => {
    switch (effectiveConfig.frame) {
      case "scan":
        return "ESCANÉAME";
      case "tap":
        return "TÓCAME";
      case "follow":
        return "SÍGUEME";
      case "custom":
        return effectiveConfig.frameText.toUpperCase();
      default:
        return "";
    }
  })();

  const renderForExport = async (size = 1024): Promise<HTMLCanvasElement> => {
    const exportInstance = new QRCodeStyling(buildOptions(size, true));
    const blob = await exportInstance.getRawData("png");
    if (!blob) throw new Error("No se pudo generar QR");
    const url = URL.createObjectURL(blob as Blob);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    await new Promise((r, j) => {
      img.onload = () => r(null);
      img.onerror = () => j(new Error("Error de carga"));
    });

    const padding = 64;
    const frameH = frameLabel ? 110 : 0;
    const canvas = document.createElement("canvas");
    canvas.width = size + padding * 2;
    canvas.height = size + padding * 2 + frameH;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = effectiveConfig.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, padding, padding, size, size);

    if (frameLabel) {
      ctx.fillStyle = effectiveConfig.frameColor;
      ctx.fillRect(0, size + padding * 2, canvas.width, frameH);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 56px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(frameLabel, canvas.width / 2, size + padding * 2 + frameH / 2);
    }

    URL.revokeObjectURL(url);
    return canvas;
  };

  const downloadPng = async () => {
    try {
      const canvas = await renderForExport(1024);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "pulpy-qr.png";
      link.click();
    } catch {
      toast({ title: "Error", description: "No se pudo descargar PNG", variant: "destructive" });
    }
  };

  const downloadSvg = async () => {
    try {
      // SVG export does not include the frame; gives raw vector QR
      const exportInstance = new QRCodeStyling(buildOptions(1024, true));
      const blob = await exportInstance.getRawData("svg");
      if (!blob) throw new Error("No SVG");
      const url = URL.createObjectURL(blob as Blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "pulpy-qr.svg";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Error", description: "No se pudo descargar SVG", variant: "destructive" });
    }
  };

  const downloadPdf = async () => {
    try {
      const canvas = await renderForExport(1024);
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      pdf.setFontSize(18);
      pdf.text("Código QR de tu perfil Pulpy", 40, 50);
      const w = 380;
      const h = (canvas.height / canvas.width) * w;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", (595 - w) / 2, 90, w, h);
      pdf.setFontSize(11);
      pdf.text(profileUrl, 40, 110 + h + 30, { maxWidth: 520 });
      pdf.save("pulpy-qr.pdf");
    } catch {
      toast({ title: "Error", description: "No se pudo descargar PDF", variant: "destructive" });
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (!isPremium) {
      onUpgrade?.();
      return;
    }
    if (!userId) return;
    setUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${userId}/qr-logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      updateConfig({ logo: data.publicUrl });
    } catch {
      toast({ title: "Error", description: "No se pudo subir el logo", variant: "destructive" });
    } finally {
      setUploadingLogo(false);
    }
  };

  const PremiumLock = () =>
    !isPremium ? (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-xl">
        <Button size="sm" onClick={onUpgrade} className="rounded-full">
          <Crown className="w-3.5 h-3.5 mr-1.5" /> Desbloquear con Premium
        </Button>
      </div>
    ) : null;

  return (
    <div className="space-y-5">
      {/* Preview */}
      <div className="rounded-2xl bg-secondary/30 p-6 flex flex-col items-center gap-3">
        <div
          className="rounded-xl overflow-hidden shadow-inner border border-border"
          style={{ background: effectiveConfig.bgColor }}
        >
          <div ref={containerRef} className="flex items-center justify-center" />
          {frameLabel && (
            <div
              className="text-center py-2 text-white text-xs font-bold tracking-wider"
              style={{ background: effectiveConfig.frameColor }}
            >
              {frameLabel}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Vista previa en vivo</p>
      </div>

      {/* Download buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" size="sm" onClick={downloadPng}>
          <Download className="w-4 h-4 mr-1.5" /> PNG
        </Button>
        <Button variant="outline" size="sm" onClick={downloadSvg}>
          <Download className="w-4 h-4 mr-1.5" /> SVG
        </Button>
        <Button variant="outline" size="sm" onClick={downloadPdf}>
          <Download className="w-4 h-4 mr-1.5" /> PDF
        </Button>
      </div>

      {/* Customization */}
      <div className="relative rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Personalización Premium</h3>
          </div>
          {!isPremium && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Lock className="w-3 h-3" /> Bloqueado
            </span>
          )}
        </div>

        <Tabs defaultValue="style" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="style">Estilo</TabsTrigger>
            <TabsTrigger value="colors">Colores</TabsTrigger>
            <TabsTrigger value="logo">Logo</TabsTrigger>
            <TabsTrigger value="frame">Marco</TabsTrigger>
          </TabsList>

          <TabsContent value="style" className="space-y-3 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Forma de puntos</Label>
                <Select
                  value={config.dotsType}
                  onValueChange={(v) => updateConfig({ dotsType: v as DotType })}
                  disabled={!isPremium}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DOT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Esquinas (cuadro)</Label>
                <Select
                  value={config.cornersSquareType}
                  onValueChange={(v) => updateConfig({ cornersSquareType: v as CornerSquareType })}
                  disabled={!isPremium}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CORNER_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Esquinas (punto)</Label>
                <Select
                  value={config.cornersDotType}
                  onValueChange={(v) => updateConfig({ cornersDotType: v as CornerDotType })}
                  disabled={!isPremium}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CORNER_DOT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-3 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ColorField
                label="Puntos"
                value={config.dotsColor}
                onChange={(v) => updateConfig({ dotsColor: v })}
                disabled={!isPremium}
              />
              <ColorField
                label="Fondo"
                value={config.bgColor}
                onChange={(v) => updateConfig({ bgColor: v })}
                disabled={!isPremium}
              />
              <ColorField
                label="Esquinas"
                value={config.cornersColor}
                onChange={(v) => updateConfig({ cornersColor: v })}
                disabled={!isPremium}
              />
            </div>
          </TabsContent>

          <TabsContent value="logo" className="space-y-3 pt-4">
            <div className="flex items-center gap-3">
              {effectiveConfig.logo ? (
                <div className="relative w-16 h-16 rounded-lg border border-border overflow-hidden bg-muted">
                  <img src={effectiveConfig.logo} alt="logo" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => updateConfig({ logo: undefined })}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                    aria-label="Quitar logo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!isPremium || uploadingLogo}
                >
                  {uploadingLogo ? "Subiendo..." : "Subir logo"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG/SVG cuadrado. Se centra en el QR.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleLogoUpload(f);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="frame" className="space-y-3 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Marco con CTA</Label>
                <Select
                  value={config.frame}
                  onValueChange={(v) => updateConfig({ frame: v as QrConfig["frame"] })}
                  disabled={!isPremium}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FRAME_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ColorField
                label="Color del marco"
                value={config.frameColor}
                onChange={(v) => updateConfig({ frameColor: v })}
                disabled={!isPremium}
              />
              {config.frame === "custom" && (
                <div className="sm:col-span-2">
                  <Label className="text-xs">Texto personalizado</Label>
                  <Input
                    className="mt-1"
                    value={config.frameText}
                    onChange={(e) => updateConfig({ frameText: e.target.value.slice(0, 24) })}
                    disabled={!isPremium}
                    placeholder="Ej: Sígueme en Instagram"
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <PremiumLock />
      </div>
    </div>
  );
};

const ColorField = ({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) => (
  <div>
    <Label className="text-xs">{label}</Label>
    <div className="mt-1 flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-10 h-9 rounded cursor-pointer border border-border bg-transparent disabled:cursor-not-allowed"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="font-mono text-xs"
      />
    </div>
  </div>
);

export default QrDesigner;
