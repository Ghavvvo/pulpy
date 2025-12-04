import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, Palette } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
}

interface ProfileEditorProps {
  profile: ProfileData;
  onProfileChange: (profile: ProfileData) => void;
}

const ProfileEditor = ({ profile, onProfileChange }: ProfileEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: keyof ProfileData, value: string) => {
    onProfileChange({ ...profile, [field]: value });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleCoverClick = () => {
    coverInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona una imagen válida",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive",
      });
      return;
    }

    // Convertir a URL para preview
    const reader = new FileReader();
    reader.onloadend = () => {
      updateField("avatar", reader.result as string);
      toast({
        title: "Foto actualizada",
        description: "Tu foto de perfil ha sido actualizada correctamente",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCoverFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona una imagen válida",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive",
      });
      return;
    }

    // Convertir a URL para preview
    const reader = new FileReader();
    reader.onloadend = () => {
      onProfileChange({
        ...profile,
        coverType: 'image',
        coverImage: reader.result as string
      });
      toast({
        title: "Portada actualizada",
        description: "Tu foto de portada ha sido actualizada correctamente",
      });
    };
    reader.readAsDataURL(file);
  };

  const predefinedColors = [
    { name: 'Azul', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Verde', value: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
    { name: 'Rosa', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { name: 'Naranja', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { name: 'Morado', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { name: 'Oscuro', value: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)' },
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Información del Perfil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cover Image/Color */}
        <div className="space-y-4">
          <Label>Portada del Perfil</Label>

          {/* Preview */}
          <div
            className="h-32 rounded-xl overflow-hidden relative group"
            style={
              profile.coverType === 'image' && profile.coverImage
                ? { backgroundImage: `url(${profile.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: profile.coverColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
            }
          >
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCoverClick}
                className="text-xs"
              >
                <ImageIcon className="w-3 h-3 mr-1" />
                Cambiar imagen
              </Button>
            </div>
          </div>

          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverFileChange}
            className="hidden"
          />

          {/* Options */}
          <div className="flex items-center gap-2">
            <Button
              variant={profile.coverType === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={handleCoverClick}
              className="flex-1"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Subir imagen
            </Button>
            <Button
              variant={profile.coverType === 'color' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onProfileChange({ ...profile, coverType: 'color' })}
              className="flex-1"
            >
              <Palette className="w-4 h-4 mr-2" />
              Color sólido
            </Button>
          </div>

          {/* Color picker */}
          {profile.coverType === 'color' && (
            <div className="grid grid-cols-3 gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => updateField('coverColor', color.value)}
                  className="h-12 rounded-lg border-2 border-border hover:border-primary transition-colors relative overflow-hidden group"
                  style={{ background: color.value }}
                  title={color.name}
                >
                  {profile.coverColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={handleAvatarClick}>
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