import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileCard from "@/components/ProfileCard";
import SocialMediaCard from "@/components/SocialMediaCard";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string;
}

interface ProfileData {
  name: string;
  title: string;
  company: string;
  bio: string;
  location: string;
  email: string;
  phone: string;
  avatar: string;
  coverType: "color" | "image";
  coverImage?: string;
  coverColor?: string;
  cardStyle: "professional" | "social";
}

interface ProfilePreviewPanelProps {
  username?: string;
  profile: ProfileData;
  socialLinks: SocialLink[];
}

const ProfilePreviewPanel = ({ username, profile, socialLinks }: ProfilePreviewPanelProps) => {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">Vista pública</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Mira tu perfil tal como lo verán tus visitantes.
            </p>
          </div>
        </div>
        <Button asChild size="sm" className="mt-3 w-full gap-2 rounded-full shadow-md">
          <Link
            to={`/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            state={{
              cachedProfile: {
                username,
                name: profile.name,
                title: profile.title,
                company: profile.company,
                bio: profile.bio,
                location: profile.location,
                email: "",
                phone: profile.phone,
                avatar: profile.avatar,
                coverType: profile.coverType,
                coverImage: profile.coverImage,
                coverColor: profile.coverColor,
                cardStyle: profile.cardStyle,
                socialLinks,
              },
            }}
          >
            <ExternalLink className="w-4 h-4" />
            Abrir vista pública
          </Link>
        </Button>
      </div>

      {profile.cardStyle === "professional" ? (
        <ProfileCard
          name={profile.name}
          title={profile.title}
          company={profile.company}
          avatar={profile.avatar}
          bio={profile.bio}
          location={profile.location}
          email={profile.email}
          phone={profile.phone}
          socialLinks={socialLinks}
          coverType={profile.coverType}
          coverImage={profile.coverImage}
          coverColor={profile.coverColor}
        />
      ) : (
        <SocialMediaCard
          name={profile.name}
          avatar={profile.avatar}
          bio={profile.bio}
          socialLinks={socialLinks}
          coverType={profile.coverType}
          coverImage={profile.coverImage}
          coverColor={profile.coverColor}
        />
      )}
    </div>
  );
};

export default ProfilePreviewPanel;