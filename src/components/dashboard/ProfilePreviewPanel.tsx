import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
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
      <Link
        to={`/${username}`}
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
        className="mx-2 flex items-center gap-2 text-sm text-muted-foreground hover:underline"
      >
        <Eye className="w-4 h-4" />
        Vista pública en tiempo real
      </Link>

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