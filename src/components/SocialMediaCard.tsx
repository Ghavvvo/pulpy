import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { 
  Instagram, 
  Linkedin, 
  Twitter, 
  Globe, 
  Github,
} from "lucide-react";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string;
}

interface SocialMediaCardProps {
  name: string;
  avatar?: string;
  bio?: string;
  socialLinks: SocialLink[];
  coverType?: 'color' | 'image';
  coverImage?: string;
  coverColor?: string;
}

const getPlatformIcon = (platform: string) => {
  const icons: Record<string, React.ReactNode> = {
    instagram: <Instagram className="w-5 h-5" />,
    linkedin: <Linkedin className="w-5 h-5" />,
    twitter: <Twitter className="w-5 h-5" />,
    github: <Github className="w-5 h-5" />,
    website: <Globe className="w-5 h-5" />,
  };
  return icons[platform] || <Globe className="w-5 h-5" />;
};

const SocialMediaCard = ({
  name,
  avatar,
  bio,
  socialLinks,
  coverType = 'color',
  coverImage,
  coverColor = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
}: SocialMediaCardProps) => {
  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden bg-card shadow-xl rounded-3xl border-0">
      {/* Header gradient or image */}
      <div 
        className="h-32"
        style={
          coverType === 'image' && coverImage
            ? { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: coverColor }
        }
      />
      
      {/* Profile content */}
      <div className="px-6 pb-8 -mt-16 flex flex-col items-center text-center">
        <Avatar className="w-28 h-28 border-4 border-card shadow-lg">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
            {name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        <h2 className="mt-4 text-2xl font-bold text-card-foreground">{name}</h2>

        {bio && (
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
            {bio}
          </p>
        )}

        {/* Social links - Linktree style */}
        <div className="mt-6 w-full space-y-3">
          {socialLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full px-6 py-4 rounded-2xl bg-secondary hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all duration-200 text-base font-medium shadow-sm"
            >
              {getPlatformIcon(link.platform)}
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default SocialMediaCard;

