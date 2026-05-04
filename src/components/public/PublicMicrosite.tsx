import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Globe, Linkedin, Twitter, Instagram, Github, MapPin, Phone, FileText } from "lucide-react";
import PulpyWatermark from "@/components/PulpyWatermark";
import { THEME_PRESETS, FONT_OPTIONS, MicrositeTheme, hexToHslVar, DEFAULT_THEME } from "@/lib/themes";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string;
}

interface PublicProfileData {
  id?: string;
  username: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  location: string;
  phone: string;
  avatar: string;
  coverType: "color" | "image";
  coverImage?: string;
  coverColor?: string;
  cvUrl?: string;
  socialLinks: SocialLink[];
  theme?: MicrositeTheme;
  isPremium?: boolean;
}

interface PublicMicrositeProps {
  profile: PublicProfileData;
  onDownloadVcf: () => void;
  onLinkClick?: (link: SocialLink) => void;
  showWatermark?: boolean;
}

const getPlatformIcon = (platform: string) => {
  const icons: Record<string, JSX.Element> = {
    instagram: <Instagram className="w-5 h-5" />,
    linkedin: <Linkedin className="w-5 h-5" />,
    twitter: <Twitter className="w-5 h-5" />,
    github: <Github className="w-5 h-5" />,
    website: <Globe className="w-5 h-5" />,
  };
  return icons[platform] ?? <Globe className="w-5 h-5" />;
};

const PublicMicrosite = ({ profile, onDownloadVcf, onLinkClick, showWatermark = false }: PublicMicrositeProps) => {
  const theme = profile.theme;
  const preset = THEME_PRESETS.find((t) => t.id === (theme?.preset || DEFAULT_THEME)) || THEME_PRESETS[0];

  const { rootStyle, pageBg } = useMemo(() => {
    const style: Record<string, string> = { ...preset.vars };
    // Premium accent override
    if (profile.isPremium && theme?.accentColor) {
      const hsl = hexToHslVar(theme.accentColor);
      if (hsl) style["--ms-accent"] = hsl;
    }
    // Premium font override
    if (profile.isPremium && theme?.fontFamily) {
      const f = FONT_OPTIONS.find((x) => x.id === theme.fontFamily);
      if (f?.stack) style["fontFamily"] = f.stack;
    }
    let bg = preset.background;
    if (theme?.bgType === "color" && theme.bgValue) bg = theme.bgValue;
    else if (theme?.bgType === "gradient" && theme.bgValue) bg = theme.bgValue;
    else if (theme?.bgType === "image" && theme.bgValue)
      bg = `url(${theme.bgValue}) center/cover no-repeat`;
    return { rootStyle: style, pageBg: bg };
  }, [preset, theme, profile.isPremium]);

  return (
    <div className="microsite-root min-h-screen" style={{ ...rootStyle, background: pageBg, color: "hsl(var(--ms-fg))" }}>
      <section
        className="h-44 w-full"
        style={
          profile.coverType === "image" && profile.coverImage
            ? { backgroundImage: `url(${profile.coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: profile.coverColor || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }
        }
      />

      <main className="container mx-auto px-4 pb-10 -mt-14 max-w-2xl">
        <Card
          className="relative rounded-3xl shadow-lg overflow-hidden"
          style={{
            background: "hsl(var(--ms-card))",
            color: "hsl(var(--ms-card-fg))",
            borderColor: "hsl(var(--ms-border))",
            borderWidth: 1,
          }}
        >
          {showWatermark && <PulpyWatermark variant="card" />}
          <div className={`p-6 sm:p-8 ${showWatermark ? "pb-20 sm:pb-20" : ""}`}>
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 border-4 shadow-md" style={{ borderColor: "hsl(var(--ms-card))" }}>
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback
                  className="text-2xl font-semibold"
                  style={{ background: "hsl(var(--ms-accent))", color: "hsl(var(--ms-accent-fg))" }}
                >
                  {profile.name
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <h1 className="text-2xl sm:text-3xl font-bold mt-4">{profile.name}</h1>
              {(profile.title || profile.company) && (
                <p className="mt-1" style={{ color: "hsl(var(--ms-muted-fg))" }}>
                  {[profile.title, profile.company].filter(Boolean).join(" · ")}
                </p>
              )}
              <Badge
                variant="secondary"
                className="mt-3"
                style={{ background: "hsl(var(--ms-muted))", color: "hsl(var(--ms-muted-fg))" }}
              >
                @{profile.username}
              </Badge>

              {profile.bio && (
                <p className="mt-4 text-sm sm:text-base max-w-xl" style={{ color: "hsl(var(--ms-muted-fg))" }}>
                  {profile.bio}
                </p>
              )}

              <div className="mt-6 w-full space-y-2">
                <Button
                  size="lg"
                  className="w-full hover:opacity-90"
                  style={{ background: "hsl(var(--ms-accent))", color: "hsl(var(--ms-accent-fg))" }}
                  onClick={onDownloadVcf}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Guardar contacto
                </Button>
                {profile.cvUrl && (
                  <Button asChild size="lg" variant="outline" className="w-full"
                    style={{ borderColor: "hsl(var(--ms-border))", color: "hsl(var(--ms-fg))", background: "transparent" }}>
                    <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" download>
                      <FileText className="w-4 h-4 mr-2" />
                      Descargar CV
                    </a>
                  </Button>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-sm" style={{ color: "hsl(var(--ms-muted-fg))" }}>
                {profile.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </span>
                )}
                {profile.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    {profile.phone}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onLinkClick?.(link)}
                  onAuxClick={() => onLinkClick?.(link)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                  style={{
                    background: "hsl(var(--ms-muted))",
                    color: "hsl(var(--ms-fg))",
                    border: "1px solid hsl(var(--ms-border))",
                  }}
                >
                  {getPlatformIcon(link.platform)}
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default PublicMicrosite;
