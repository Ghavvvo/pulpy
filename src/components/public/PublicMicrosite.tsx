import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, Globe, Linkedin, Twitter, Instagram, Github, MapPin, Phone } from "lucide-react";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string;
}

interface PublicProfileData {
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
  socialLinks: SocialLink[];
}

interface PublicMicrositeProps {
  profile: PublicProfileData;
  onDownloadVcf: () => void;
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

const PublicMicrosite = ({ profile, onDownloadVcf }: PublicMicrositeProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      <section
        className="h-44 w-full"
        style={
          profile.coverType === "image" && profile.coverImage
            ? { backgroundImage: `url(${profile.coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: profile.coverColor || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }
        }
      />

      <main className="container mx-auto px-4 pb-10 -mt-14 max-w-2xl">
        <Card className="rounded-3xl border shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 border-4 border-card shadow-md">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {profile.name
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <h1 className="text-2xl sm:text-3xl font-bold mt-4 text-card-foreground">{profile.name}</h1>
              {(profile.title || profile.company) && (
                <p className="text-muted-foreground mt-1">
                  {[profile.title, profile.company].filter(Boolean).join(" · ")}
                </p>
              )}
              <Badge variant="secondary" className="mt-3">@{profile.username}</Badge>

              {profile.bio && <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl">{profile.bio}</p>}

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <Button size="lg" onClick={onDownloadVcf}>
                  <Download className="w-4 h-4 mr-2" />
                  Guardar contacto
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href={`/${profile.username}`}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir enlace
                  </a>
                </Button>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
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
                  className="inline-flex items-center justify-center gap-2 rounded-xl border bg-secondary/40 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
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