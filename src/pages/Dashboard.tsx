import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import ProfileEditor from "@/components/ProfileEditor";
import UsernameEditor from "@/components/UsernameEditor";
import SocialLinkEditor from "@/components/SocialLinkEditor";
import ShareProfile from "@/components/ShareProfile";
import {PremiumAlert} from "@/components/PremiumAlert";
import {Tabs, TabsContent} from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Save, Loader2, User, IdCard, Link as LinkIcon, FileText, Sparkles } from "lucide-react";
import {toast} from "@/hooks/use-toast";
import {useAuth} from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import DashboardHomeTab from "@/components/dashboard/DashboardHomeTab";
import ProfilePreviewPanel from "@/components/dashboard/ProfilePreviewPanel";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import CvUploader from "@/components/CvUploader";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import { MicrositeTheme, DEFAULT_THEME } from "@/lib/themes";

interface SectionItemProps {
    id: string;
    step: number;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

const SectionItem = ({ id, step, icon, title, subtitle, children }: SectionItemProps) => (
    <AccordionItem
        value={id}
        className="border bg-card rounded-2xl shadow-sm overflow-hidden data-[state=open]:shadow-md transition-shadow"
    >
        <AccordionTrigger className="px-5 py-4 hover:no-underline group">
            <div className="flex items-center gap-4 flex-1 text-left">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary text-sm font-semibold flex-shrink-0">
                    {step}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                        <span className="text-muted-foreground group-hover:text-primary transition-colors">{icon}</span>
                        {title}
                    </div>
                    <p className="text-xs text-muted-foreground font-normal mt-0.5">{subtitle}</p>
                </div>
            </div>
        </AccordionTrigger>
        <AccordionContent className="px-5 pb-5 pt-1 space-y-6">{children}</AccordionContent>
    </AccordionItem>
);

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
    theme?: MicrositeTheme;
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
        theme: user?.theme || { preset: DEFAULT_THEME },
    });

    const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
        user?.socialLinks || []
    );

    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "home";
    const setActiveTab = (tab: string) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("tab", tab);
            return next;
        }, { replace: true });
    };
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
            theme: user?.theme || { preset: DEFAULT_THEME },
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
                cvUrl: user.cvUrl,
                theme: user.theme || { preset: DEFAULT_THEME },
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

    const handleCvChange = async (url: string | null) => {
        const nextProfile = { ...profile, cvUrl: url || undefined };
        setProfile(nextProfile);
        await persistProfile(nextProfile, socialLinks, "Tu CV se guardó automáticamente");
    };

    const profileUrl = `${window.location.origin}/${username}`;

    return (
        <div className="min-h-screen bg-background">
            <Header/>

                {/* Premium Alert */}
                <div className="mb-6">
                    <PremiumAlert />
                </div>

            <main className="container mx-auto px-4 pt-32 md:pt-24 pb-12">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                            {activeTab === "home" && "Inicio"}
                            {activeTab === "card" && "Mi Tarjeta Digital"}
                            {activeTab === "share" && "QR & Compartir"}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {activeTab === "home" && "Resumen rápido y acceso a tu perfil público"}
                            {activeTab === "card" && "Personaliza tu perfil y compártelo con el mundo"}
                            {activeTab === "share" && "Descarga tu QR y comparte tu enlace"}
                        </p>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

                    <TabsContent value="home" className="space-y-6">
                        <DashboardHomeTab profileUrl={profileUrl} onOpenShareCenter={() => setActiveTab("share")} />
                    </TabsContent>

                    <TabsContent value="card" className="space-y-8 pb-28">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            <div className="xl:col-span-2">
                                <Accordion type="multiple" defaultValue={["identity"]} className="space-y-3">
                                    <SectionItem
                                        id="identity"
                                        step={1}
                                        icon={<User className="w-4 h-4" />}
                                        title="Identidad"
                                        subtitle="Tu foto, nombre y enlace público"
                                    >
                                        <ProfileEditor
                                            profile={profile}
                                            onProfileChange={setProfile}
                                            onAutoSave={handleAutoSaveProfile}
                                            section="avatar"
                                            embedded
                                        />
                                        <UsernameEditor embedded />
                                    </SectionItem>

                                    <SectionItem
                                        id="info"
                                        step={2}
                                        icon={<IdCard className="w-4 h-4" />}
                                        title="Información"
                                        subtitle="Cargo, empresa, contacto y biografía"
                                    >
                                        <ProfileEditor
                                            profile={profile}
                                            onProfileChange={setProfile}
                                            onAutoSave={handleAutoSaveProfile}
                                            section="info"
                                            embedded
                                        />
                                    </SectionItem>

                                    <SectionItem
                                        id="links"
                                        step={3}
                                        icon={<LinkIcon className="w-4 h-4" />}
                                        title="Enlaces"
                                        subtitle="Redes sociales y links a tu contenido"
                                    >
                                        <SocialLinkEditor links={socialLinks} onLinksChange={setSocialLinks} embedded />
                                    </SectionItem>

                                    <SectionItem
                                        id="docs"
                                        step={4}
                                        icon={<FileText className="w-4 h-4" />}
                                        title="Documentos"
                                        subtitle="CV o currículum descargable en PDF"
                                    >
                                        <CvUploader cvUrl={profile.cvUrl} onCvChange={handleCvChange} embedded />
                                    </SectionItem>

                                    <SectionItem
                                        id="appearance"
                                        step={5}
                                        icon={<Sparkles className="w-4 h-4" />}
                                        title="Apariencia"
                                        subtitle="Estilo de tarjeta, portada, tema y colores"
                                    >
                                        <ProfileEditor
                                            profile={profile}
                                            onProfileChange={setProfile}
                                            onAutoSave={handleAutoSaveProfile}
                                            section="appearance"
                                            embedded
                                        />
                                        <div className="pt-2 border-t" />
                                        <ThemeCustomizer
                                            value={profile.theme || { preset: DEFAULT_THEME }}
                                            onChange={(theme) => setProfile({ ...profile, theme })}
                                            isPremium={isPremium}
                                            embedded
                                        />
                                    </SectionItem>
                                </Accordion>
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
