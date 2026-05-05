import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, Lock, Palette, Type, Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { THEME_PRESETS, FONT_OPTIONS, MicrositeTheme, ThemePreset } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface Props {
  value: MicrositeTheme;
  onChange: (next: MicrositeTheme) => void;
  isPremium: boolean;
  embedded?: boolean;
}

const GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
];

const ThemeCustomizer = ({ value, onChange, isPremium, embedded = false }: Props) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const setPreset = (preset: ThemePreset) => onChange({ ...value, preset });
  const setBg = (bgType: MicrositeTheme["bgType"], bgValue?: string) =>
    onChange({ ...value, bgType, bgValue });

  const handleAccent = (hex: string) => {
    if (!isPremium) return;
    onChange({ ...value, accentColor: hex });
  };

  const handleFont = (id: string) => {
    if (!isPremium) return;
    onChange({ ...value, fontFamily: id });
  };

  const handleBgImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    e.target.value = "";
    if (!file.type.startsWith("image/")) {
      toast({ title: "Formato no válido", description: "Solo imágenes", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Imagen muy grande", description: "Máximo 5MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const fileName = `${user.id}/bg-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("user-content")
        .upload(fileName, file, { cacheControl: "3600", upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("user-content").getPublicUrl(fileName);
      setBg("image", publicUrl);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudo subir la imagen", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (embedded) {
    return <div className="space-y-6">{renderInner()}</div>;
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Tema y personalización
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Elige cómo se verá tu microsite público.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">{renderInner()}</CardContent>
    </Card>
  );

  function renderInner() {
    return (<>
        {/* Theme presets */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Galería de temas</Label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {THEME_PRESETS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setPreset(t.id)}
                className={cn(
                  "group relative rounded-xl border-2 p-2 text-left transition-all hover:shadow-md",
                  value.preset === t.id ? "border-primary ring-2 ring-primary/30" : "border-border"
                )}
              >
                <div
                  className="h-16 w-full rounded-lg mb-2 border"
                  style={{ background: t.background }}
                />
                <p className="text-xs font-semibold">{t.name}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Accent color (premium) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Color de acento
            </Label>
            {!isPremium && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" /> Premium
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="color"
              value={value.accentColor || "#7c3aed"}
              onChange={(e) => handleAccent(e.target.value)}
              disabled={!isPremium}
              className="h-10 w-16 p-1 cursor-pointer disabled:cursor-not-allowed"
            />
            <Input
              type="text"
              placeholder="#7c3aed"
              value={value.accentColor || ""}
              onChange={(e) => handleAccent(e.target.value)}
              disabled={!isPremium}
              className="flex-1"
            />
            {value.accentColor && isPremium && (
              <Button variant="ghost" size="sm" onClick={() => onChange({ ...value, accentColor: undefined })}>
                Quitar
              </Button>
            )}
          </div>
        </div>

        {/* Typography (premium) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Type className="w-4 h-4" />
              Tipografía
            </Label>
            {!isPremium && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" /> Premium
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FONT_OPTIONS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => handleFont(f.id)}
                disabled={!isPremium}
                className={cn(
                  "rounded-lg border-2 px-3 py-2 text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed",
                  (value.fontFamily || "default") === f.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                )}
                style={f.stack ? { fontFamily: f.stack } : undefined}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        {/* Background */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Fondo del microsite
          </Label>
          <Tabs value={value.bgType || "theme"} onValueChange={(v) => setBg(v as any, value.bgValue)}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="theme">Tema</TabsTrigger>
              <TabsTrigger value="color">Color</TabsTrigger>
              <TabsTrigger value="gradient">Gradiente</TabsTrigger>
              <TabsTrigger value="image">Imagen</TabsTrigger>
            </TabsList>

            <TabsContent value="theme" className="pt-3">
              <p className="text-xs text-muted-foreground">Usa el fondo del tema seleccionado.</p>
            </TabsContent>

            <TabsContent value="color" className="pt-3">
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={value.bgType === "color" ? value.bgValue || "#ffffff" : "#ffffff"}
                  onChange={(e) => setBg("color", e.target.value)}
                  className="h-10 w-16 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  placeholder="#ffffff"
                  value={value.bgType === "color" ? value.bgValue || "" : ""}
                  onChange={(e) => setBg("color", e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="gradient" className="pt-3">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {GRADIENTS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setBg("gradient", g)}
                    className={cn(
                      "h-14 rounded-lg border-2 transition-all",
                      value.bgType === "gradient" && value.bgValue === g
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border"
                    )}
                    style={{ background: g }}
                    aria-label="Gradiente"
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="image" className="pt-3 space-y-3">
              {value.bgType === "image" && value.bgValue && (
                <div
                  className="h-24 w-full rounded-lg border"
                  style={{ backgroundImage: `url(${value.bgValue})`, backgroundSize: "cover", backgroundPosition: "center" }}
                />
              )}
              <label className="block">
                <input type="file" accept="image/*" className="hidden" onChange={handleBgImage} />
                <Button asChild variant="outline" className="w-full" disabled={uploading}>
                  <span>
                    {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    {uploading ? "Subiendo..." : "Subir imagen de fondo"}
                  </span>
                </Button>
              </label>
            </TabsContent>
          </Tabs>
        </div>
    </>);
  }
};

export default ThemeCustomizer;
