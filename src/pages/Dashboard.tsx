import {useState} from "react";
import Header from "@/components/Header";
import ProfileCard from "@/components/ProfileCard";
import SocialMediaCard from "@/components/SocialMediaCard";
import ProfileEditor from "@/components/ProfileEditor";
import SocialLinkEditor from "@/components/SocialLinkEditor";
import ShareProfile from "@/components/ShareProfile";
import QrCard from "@/components/QrCard.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Eye, Edit3, Save} from "lucide-react";
import {toast} from "@/hooks/use-toast";

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
}

const Dashboard = () => {
    const [profile, setProfile] = useState<ProfileData>({
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
    });

    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
        {id: "1", platform: "linkedin", url: "https://linkedin.com/in/mariagarcia", label: "LinkedIn"},
        {id: "2", platform: "twitter", url: "https://twitter.com/mariagarcia", label: "Twitter"},
        {id: "3", platform: "instagram", url: "https://instagram.com/mariagarcia", label: "Instagram"},
    ]);

    const [activeTab, setActiveTab] = useState("edit");

    const handleSave = () => {
        toast({
            title: "Cambios guardados",
            description: "Tu perfil ha sido actualizado correctamente",
        });
    };

    const profileUrl = "https://pulpy.app/m/mariagarcia";

    return (
        <div className="min-h-screen bg-background">
            <Header/>

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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Editor Section */}
                    <div className="lg:col-span-2  space-y-6">
                        <Tabs  value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full lg:hidden  max-w-md grid-cols-2">
                                <TabsTrigger value="edit" className="flex items-center gap-2">
                                    <Edit3 className="w-4 h-4"/>
                                    Editar
                                </TabsTrigger>
                                <TabsTrigger value="preview" className="flex items-center lg:hidden">
                                    <Eye className="w-4 h-4"/>
                                    Vista previa
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="edit" className="mt-6 space-y-6">
                                <ProfileEditor
                                    profile={profile}
                                    onProfileChange={setProfile}
                                />
                                <SocialLinkEditor
                                    links={socialLinks}
                                    onLinksChange={setSocialLinks}
                                />

                            </TabsContent>


                            <TabsContent value="preview" className="mt-6 lg:hidden">
                                <div className="flex justify-center">
                                    {profile.cardStyle === 'professional' ? (
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
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Preview Section (Desktop) */}
                    <div className="hidden lg:block">
                        <div className="sticky top-24">
                            <div className="mb-4 mx-8 flex items-center gap-2 text-sm text-muted-foreground">
                                <Eye className="w-4 h-4"/>
                                Vista previa en tiempo real
                            </div>
                            {profile.cardStyle === 'professional' ? (
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
                    </div>
                    <ShareProfile profileUrl={profileUrl}/>
                    <QrCard></QrCard>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
