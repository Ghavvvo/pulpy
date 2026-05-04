import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import ProfileEditor from "@/components/ProfileEditor";
import UsernameEditor from "@/components/UsernameEditor";
import SocialLinkEditor from "@/components/SocialLinkEditor";
import ShareProfile from "@/components/ShareProfile";
import {PremiumAlert} from "@/components/PremiumAlert";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import { Edit3, Save, Loader2, Home, Share2 } from "lucide-react";
import {toast} from "@/hooks/use-toast";
import {useAuth} from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import DashboardHomeTab from "@/components/dashboard/DashboardHomeTab";
import ProfilePreviewPanel from "@/components/dashboard/ProfilePreviewPanel";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import CvUploader from "@/components/CvUploader";

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
    coverType: 'color' | 'image';
    coverImage?: string;
    coverColor?: string;
    cardStyle: 'professional' | 'social';
    cvUrl?: string;
}

const Dashboard = () => {
    const { username } = useParams();
    const { user, updateProfile, isPremium } = useAuth();

    const [profile, setProfile] = useState<ProfileData>({
        name: user?.name || "",
        title: user?.title || "",
        company: user?.company || "",
        bio: user?.bio || "",
        location: user?.location || "",
        email: user?.email || "",
        phone: user?.phone || "",
        avatar: user?.avatar || "",
        coverType: user?.coverType || 'color',
        coverColor: user?.coverColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        coverImage: user?.coverImage,
        cardStyle: user?.cardStyle || 'professional',
        cvUrl: user?.cvUrl,
    });

    const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
        user?.socialLinks || []
    );

    const [activeTab, setActiveTab] = useState("home");
    const [isSaving, setIsSaving] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(() => {
        if (!user) return false;
        return localStorage.getItem(`pulpy_onboarded_${user.id}`) !== "1";
    });

    const handleOnboardingComplete = () => {
        if (user) localStorage.setItem(`pulpy_onboarded_${user.id}`, "1");
        setShowOnboarding(false);
    };
    const [lastSavedSnapshot, setLastSavedSnapshot] = useState(() => JSON.stringify({
        profile: {
            name: user?.name || "",
            title: user?.title || "",
            company: user?.company || "",
            bio: user?.bio || "",
            location: user?.location || "",
            email: user?.email || "",
            phone: user?.phone || "",
            avatar: user?.avatar || "",
            coverType: user?.coverType || 'color',
            coverColor: user?.coverColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            coverImage: user?.coverImage,
            cardStyle: user?.cardStyle || 'professional',
            cvUrl: user?.cvUrl,
        },
        socialLinks: user?.socialLinks || [],
    }));

    // Sincronizar con el usuario cuando cambie
    useEffect(() => {
        if (user) {
            const nextProfile = {
                name: user.name,
                title: user.title,
                company: user.company,
                bio: user.bio,
                location: user.location,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                coverType: user.coverType,
                coverColor: user.coverColor,
                coverImage: user.coverImage,
                cardStyle: user.cardStyle,
            };

            setProfile(nextProfile);
            setSocialLinks(user.socialLinks);
            setLastSavedSnapshot(JSON.stringify({ profile: nextProfile, socialLinks: user.socialLinks }));
            setLastSavedAt(null);
        }
    }, [user]);

    const hasUnsavedChanges = JSON.stringify({ profile, socialLinks }) !== lastSavedSnapshot;

    const persistProfile = async (
        nextProfile: ProfileData,
        nextSocialLinks: SocialLink[],
        successDescription: string,
    ) => {
        setIsSaving(true);
        try {
            await updateProfile({
                ...nextProfile,
                socialLinks: nextSocialLinks,
            });

            setLastSavedSnapshot(JSON.stringify({ profile: nextProfile, socialLinks: nextSocialLinks }));
            setLastSavedAt(new Date());

            toast({
                title: "Cambios guardados",
                description: successDescription,
            });

            return true;
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudieron guardar los cambios. Intenta de nuevo.",
                variant: "destructive",
            });

            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = async () => {
        await persistProfile(profile, socialLinks, "Tu perfil ha sido actualizado correctamente");
    };

    const handleAutoSaveProfile = async (nextProfile: ProfileData) => {
        return persistProfile(nextProfile, socialLinks, "Los cambios de imagen se guardaron automáticamente");
    };

    const profileUrl = `${window.location.origin}/${username}`;

    return (
        <div className="min-h-screen bg-background">
            <Header/>

                {/* Premium Alert */}
                <div className="mb-6">
                    <PremiumAlert />
                </div>

            <main className="container mx-auto px-4 pt-24 pb-12">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                            Mi Tarjeta Digital
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Personaliza tu perfil y compártelo con el mundo
                        </p>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                        <TabsTrigger value="home" className="py-2.5">
                            <Home className="w-4 h-4 mr-2" />
                            Inicio
                        </TabsTrigger>
                        <TabsTrigger value="card" className="py-2.5">
                            <Edit3 className="w-4 h-4 mr-2" />
                            Mi Tarjeta
                        </TabsTrigger>
                        <TabsTrigger value="share" className="py-2.5">
                            <Share2 className="w-4 h-4 mr-2" />
                            QR & Compartir
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="home" className="space-y-6">
                        <DashboardHomeTab profileUrl={profileUrl} onOpenShareCenter={() => setActiveTab("share")} />
                    </TabsContent>

                    <TabsContent value="card" className="space-y-8 pb-28">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            <div className="xl:col-span-2 space-y-6">
                                <UsernameEditor />
                                <ProfileEditor profile={profile} onProfileChange={setProfile} onAutoSave={handleAutoSaveProfile} />
                                <SocialLinkEditor links={socialLinks} onLinksChange={setSocialLinks} />
                            </div>
                            <div className="xl:col-span-1">
                                <div className="sticky top-24">
                                    <ProfilePreviewPanel username={username} profile={profile} socialLinks={socialLinks} />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="share" className="space-y-6">
                        <ShareProfile profileUrl={profileUrl} isPremium={isPremium} />
                    </TabsContent>
                </Tabs>

                {activeTab === "card" && (
                    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                        <div className="container mx-auto px-4 py-3">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    {hasUnsavedChanges
                                        ? "Tienes cambios pendientes por guardar"
                                        : lastSavedAt
                                            ? `Todo guardado · ${lastSavedAt.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`
                                            : "Todo guardado"}
                                </p>

                                <Button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges} className="w-full sm:w-auto">
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <OnboardingWizard open={showOnboarding} onComplete={handleOnboardingComplete} />
        </div>
    );
};

export default Dashboard;
