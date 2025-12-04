import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface ProfileData {
  name: string;
  title: string;
  company: string;
  bio: string;
  location: string;
  email: string;
  phone: string;
  avatar: string;
}

interface ProfileEditorProps {
  profile: ProfileData;
  onProfileChange: (profile: ProfileData) => void;
}

const ProfileEditor = ({ profile, onProfileChange }: ProfileEditorProps) => {
  const updateField = (field: keyof ProfileData, value: string) => {
    onProfileChange({ ...profile, [field]: value });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Información del Perfil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm">
            <Camera className="w-4 h-4 mr-2" />
            Cambiar foto
          </Button>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Tu nombre"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Cargo / Título</Label>
            <Input
              id="title"
              value={profile.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Ej: CEO, Diseñador, etc."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              value={profile.company}
              onChange={(e) => updateField("company", e.target.value)}
              placeholder="Nombre de tu empresa"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              value={profile.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="Ciudad, País"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="tu@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+1 234 567 890"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Biografía</Label>
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => updateField("bio", e.target.value)}
            placeholder="Cuéntanos sobre ti..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileEditor;
