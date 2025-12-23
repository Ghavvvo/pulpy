import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ProfileCard from "@/components/ProfileCard";
import SocialMediaCard from "@/components/SocialMediaCard";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, LogOut, User, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const intendedDestination = location.state?.intendedDestination;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDownloadVcf = () => {
    if (!profile) return;

    // Paso 2: Crear contenido VCF
    const vcfContent = `BEGIN:VCARD
VERSION:3.0
FN:${profile.name}
TEL:${profile.phone || ''}
EMAIL:${profile.email || ''}
ORG:${profile.company || ''}
TITLE:${profile.title || ''}
URL:${window.location.href}
NOTE:${profile.bio || ''}
END:VCARD`;

    // Paso 3: Convertir a Blob
    const blob = new Blob([vcfContent], { type: 'text/vcard' });

    // Paso 4: Crear URL temporal
    const url = URL.createObjectURL(blob);

    // Paso 5: Crear enlace invisible
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.username || 'contacto'}.vcf`;
    document.body.appendChild(link);

    // Paso 6: Simular clic
    link.click();

    // Paso 7: Limpiar memoria
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!username) {
        setLoading(false);
        return;
      }

      try {
        // Fetch profile with social links
        const { data: profile, error } = await supabase
          .from('profiles')
          .select(`
            *,
            social_links (
              id,
              platform,
              url,
              label,
              display_order
            )
          `)
          .eq('username', username)
          .single();

        if (error) throw error;

        if (profile) {
          // Map database data to component format
          const profileData = {
            username: profile.username,
            name: profile.full_name || '',
            title: profile.title || '',
            company: profile.company || '',
            bio: profile.bio || '',
            location: profile.location || '',
            email: '', // Don't expose email publicly
            phone: profile.phone || '',
            avatar: profile.avatar_url || '',
            coverType: profile.cover_type || 'color',
            coverImage: profile.cover_image_url,
            coverColor: profile.cover_color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            cardStyle: profile.card_style || 'professional',
            socialLinks: (profile.social_links || [])
              .sort((a: any, b: any) => a.display_order - b.display_order)
              .map((link: any) => ({
                id: link.id,
                platform: link.platform,
                url: link.url,
                label: link.label || link.platform,
              })),
          };

          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error fetching public profile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    // Check if cached profile is available and matches the username
    if (location.state?.cachedProfile && location.state.cachedProfile.username === username) {
      setProfile(location.state.cachedProfile);
      setLoading(false);
    } else {
      fetchPublicProfile();
    }

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
      {/* Header con opciones de login/signup o logout */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-lg ">
            @{profile.username}
          </div>
          <div className="flex gap-2">
            {isAuthenticated && user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/${user.username}/dashboard`)}
                >
                  <User className="h-4 mr-2" />
                  Mi Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login", { state: { from: intendedDestination || location.pathname } })}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/signup", { state: { from: intendedDestination || location.pathname } })}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Crear Cuenta</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-24 h-svh pb-12 px-4 flex items-center justify-center">
        <div className="container mx-auto flex flex-col items-center justify-center gap-6">
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

          <Button
            variant="default"
            size="lg"
            className="w-full max-w-sm mx-auto shadow-lg hover:shadow-xl transition-all"
            onClick={handleDownloadVcf}
          >
            <Download className="w-5 h-5 mr-2" />
            Guardar Contacto
          </Button>
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
              variant="ghost"
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

