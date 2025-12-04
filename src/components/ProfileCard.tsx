import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Instagram, 
  Linkedin, 
  Twitter, 
  Globe, 
  Github,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string;
}

interface ProfileCardProps {
  name: string;
  title: string;
  company: string;
  avatar?: string;
  bio?: string;
  location?: string;
  email?: string;
  phone?: string;
  socialLinks: SocialLink[];
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

const ProfileCard = ({
  name,
  title,
  company,
  avatar,
  bio,
  location,
  email,
  phone,
  socialLinks,
}: ProfileCardProps) => {
  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden bg-card shadow-xl rounded-3xl border-0">
      {/* Header gradient */}
      <div className="h-24 bg-gradient-to-br from-primary via-primary/80 to-accent-foreground" />
      
      {/* Profile content */}
      <div className="px-6 pb-6 -mt-12">
        <Avatar className="w-24 h-24 border-4 border-card shadow-lg">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
            {name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        <div className="mt-4 space-y-1">
          <h2 className="text-xl font-bold text-card-foreground">{name}</h2>
          <p className="text-muted-foreground">{title}</p>
          <Badge variant="secondary" className="mt-2">
            {company}
          </Badge>
        </div>

        {bio && (
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            {bio}
          </p>
        )}

        {/* Contact info */}
        <div className="mt-4 space-y-2">
          {location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
          )}
          {email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{phone}</span>
            </div>
          )}
        </div>

        {/* Social links */}
        <div className="mt-6 flex flex-wrap gap-3">
          {socialLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-200 text-sm font-medium"
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

export default ProfileCard;
