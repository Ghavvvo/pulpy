import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Check, Share2, Copy, Sparkles, ArrowRight, ArrowLeft, Link as LinkIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useImageUpload } from "@/hooks/useImageUpload";
import { toast } from "@/hooks/use-toast";

interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
}

const PLATFORMS = [
  { id: "instagram", label: "Instagram", placeholder: "https://instagram.com/tuusuario" },
  { id: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/tuusuario" },
  { id: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/521234567890" },
  { id: "website", label: "Sitio web", placeholder: "https://tusitio.com" },
  { id: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@tuusuario" },
  { id: "x", label: "X / Twitter", placeholder: "https://x.com/tuusuario" },
];

const TOTAL_STEPS = 4;

const OnboardingWizard = ({ open, onComplete }: OnboardingWizardProps) => {
  const { user, updateProfile } = useAuth();
  const { uploadImage, uploadingAvatar } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [platform, setPlatform] = useState(PLATFORMS[0].id);
  const [linkUrl, setLinkUrl] = useState("");

  if (!user) return null;

  const profileUrl = `${window.location.origin}/${user.username}`;
  const progress = (step / TOTAL_STEPS) * 100;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file, user.id, "avatar");
    if (url) {
      setAvatar(url);
      await updateProfile({ avatar: url });
      toast({ title: "Foto guardada", description: "Tu foto se ve genial 🐙" });
    }
  };

  const handleNext = async () => {
    setSaving(true);
    try {
      if (step === 2 && bio !== user.bio) {
        await updateProfile({ bio });
      }
      if (step === 3 && linkUrl.trim()) {
        const platformInfo = PLATFORMS.find((p) => p.id === platform)!;
        const newLinks = [
          ...user.socialLinks,
          {
            id: `${platform}-${Date.now()}`,
            platform,
            url: linkUrl.trim(),
            label: platformInfo.label,
          },
        ];
        await updateProfile({ socialLinks: newLinks });
      }
      setStep((s) => s + 1);
    } catch {
      toast({ title: "Error", description: "No se pudo guardar. Intenta de nuevo.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({ title: "¡Copiado!", description: "Tu enlace está en el portapapeles" });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Mi tarjeta Pulpy`, url: profileUrl });
      } catch {}
    } else {
      handleCopy();
    }
  };

  const canAdvance = () => {
    if (step === 1) return true; // skippable
    if (step === 2) return true; // skippable
    if (step === 3) return true; // skippable
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden" hideCloseButton>
        <div className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">
              Paso {step} de {TOTAL_STEPS}
            </span>
            <button
              onClick={onComplete}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Saltar tour
            </button>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        <div className="p-6 min-h-[340px] flex flex-col">
          {step === 1 && (
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                <Sparkles className="w-3 h-3" /> Bienvenido a Pulpy
              </div>
              <h2 className="text-2xl font-bold mb-2">Sube tu foto</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Una buena foto duplica tus visitas. Que se vea tu cara con buena luz.
              </p>

              <div className="relative mb-4">
                <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                  <AvatarImage src={avatar} />
                  <AvatarFallback className="text-3xl bg-primary/10">
                    {user.name?.charAt(0).toUpperCase() || "P"}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              {avatar && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Foto guardada
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 flex flex-col">
              <h2 className="text-2xl font-bold mb-2">Cuéntanos sobre ti</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Una bio corta ayuda a que te recuerden. 1-2 frases bastan.
              </p>
              <div className="space-y-2">
                <Label htmlFor="bio">Tu bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Diseñador de producto. Ayudo a startups a lanzar más rápido."
                  rows={4}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground text-right">{bio.length}/160</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex-1 flex flex-col">
              <h2 className="text-2xl font-bold mb-2">Agrega tu primer enlace</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Tu red más importante. Después podrás agregar más desde el dashboard.
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        platform === p.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-muted border-border"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link">URL</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="link"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder={PLATFORMS.find((p) => p.id === platform)?.placeholder}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">¡Tu Pulpy está lista!</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Comparte tu enlace y empieza a recibir visitas.
              </p>
              <div className="w-full p-3 rounded-lg bg-muted border flex items-center gap-2 mb-4">
                <span className="text-sm font-mono truncate flex-1 text-left">{profileUrl}</span>
                <Button size="sm" variant="ghost" onClick={handleCopy}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <Button onClick={handleShare} className="w-full" size="lg">
                <Share2 className="w-4 h-4 mr-2" />
                Compartir mi tarjeta
              </Button>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between gap-3">
          {step > 1 && step < 4 ? (
            <Button variant="ghost" size="sm" onClick={() => setStep((s) => s - 1)} disabled={saving}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Atrás
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button onClick={handleNext} disabled={saving || !canAdvance()} size="sm">
              {saving ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <>
                  Continuar <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={onComplete} size="sm">
              Ir a mi dashboard <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWizard;
