import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PublicMicrosite from "@/components/public/PublicMicrosite";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { trackLinkClick, trackProfileView } from "@/lib/tracking";

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
            id: profile.id,
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
            cvUrl: profile.cv_url || undefined,
            isPremium: profile.is_premium === true || profile.plan === 'premium' || profile.plan === 'pro',
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

  }, [username, location]);

  // Registrar la visita una sola vez por sesión, solo en visitas reales
  // (no cuando se abre desde el dashboard con cachedProfile, que es preview del dueño).
  useEffect(() => {
    const isOwnerPreview = !!location.state?.cachedProfile;
    if (!profile?.id || !profile?.username || isOwnerPreview) return;
    trackProfileView(profile.id, profile.username);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

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
    <PublicMicrosite
      profile={profile}
      onDownloadVcf={handleDownloadVcf}
      onLinkClick={(link) => {
        if (!profile?.id || !profile?.username) return;
        trackLinkClick({
          profileId: profile.id,
          username: profile.username,
          linkId: link.id,
          platform: link.platform,
          label: link.label,
          url: link.url,
        });
      }}
      showWatermark={!profile.isPremium}
    />
  );
};

export default PublicProfile;

