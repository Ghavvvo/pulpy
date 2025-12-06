import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ProfileCard from "@/components/ProfileCard";
import SocialMediaCard from "@/components/SocialMediaCard";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Usuario público mockeado (simulando fetch de API)
const PUBLIC_PROFILES: Record<string, any> = {
  mariagarcia: {
    username: "mariagarcia",
    name: "María García",
    title: "Product Designer",
    company: "TechCorp",
    bio: "Diseñadora de producto apasionada por crear experiencias digitales que impacten positivamente en las personas.",
    location: "Madrid, España",
    email: "maria@techcorp.com",
    phone: "+34 612 345 678",
    avatar: "",
    coverType: 'color',
    coverColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    cardStyle: 'professional',
    socialLinks: [
      { id: "1", platform: "linkedin", url: "https://linkedin.com/in/mariagarcia", label: "LinkedIn" },
      { id: "2", platform: "twitter", url: "https://twitter.com/mariagarcia", label: "Twitter" },
      { id: "3", platform: "instagram", url: "https://instagram.com/mariagarcia", label: "Instagram" },
    ],
  },
};

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const intendedDestination = location.state?.intendedDestination;

  useEffect(() => {
    // Simular fetch de perfil público
    setTimeout(() => {
      if (username && PUBLIC_PROFILES[username]) {
        setProfile(PUBLIC_PROFILES[username]);
      }
      setLoading(false);
    }, 500);

    // Mostrar prompt de login si viene de una ruta protegida
    if (location.state?.showLoginPrompt) {
      setShowLoginPrompt(true);
    }
  }, [username, location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-4"></div>
          <div className="h-4 w-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Perfil no encontrado</h1>
          <p className="text-muted-foreground mb-8">
            El usuario @{username} no existe o ha sido eliminado.
          </p>
          <Button onClick={() => navigate("/")}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Header con opciones de login/signup */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-lg font-semibold">
            @{profile.username}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/login", { state: { from: intendedDestination || location.pathname } })}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Iniciar Sesión
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/signup", { state: { from: intendedDestination || location.pathname } })}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Crear Cuenta
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto flex justify-center">
          {profile.cardStyle === 'social' ? (
            <SocialMediaCard
              name={profile.name}
              avatar={profile.avatar}
              bio={profile.bio}
              socialLinks={profile.socialLinks}
              coverType={profile.coverType}
              coverImage={profile.coverImage}
              coverColor={profile.coverColor}
            />
          ) : (
            <ProfileCard
              name={profile.name}
              title={profile.title}
              company={profile.company}
              avatar={profile.avatar}
              bio={profile.bio}
              location={profile.location}
              email={profile.email}
              phone={profile.phone}
              socialLinks={profile.socialLinks}
              coverType={profile.coverType}
              coverImage={profile.coverImage}
              coverColor={profile.coverColor}
            />
          )}
        </div>
      </div>

      {/* Login Prompt Dialog */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acceso restringido</DialogTitle>
            <DialogDescription>
              Necesitas iniciar sesión para acceder a esta sección.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 mt-4">
            <Button
              className="flex-1"
              onClick={() => navigate("/login", { state: { from: intendedDestination || location.pathname } })}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Iniciar Sesión
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/signup", { state: { from: intendedDestination || location.pathname } })}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Crear Cuenta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicProfile;

