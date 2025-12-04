import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Trash2, 
  GripVertical,
  Instagram, 
  Linkedin, 
  Twitter, 
  Globe, 
  Github 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string;
}

interface SocialLinkEditorProps {
  links: SocialLink[];
  onLinksChange: (links: SocialLink[]) => void;
}

const platforms = [
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "twitter", label: "Twitter / X", icon: Twitter },
  { value: "github", label: "GitHub", icon: Github },
  { value: "website", label: "Sitio Web", icon: Globe },
];

const SocialLinkEditor = ({ links, onLinksChange }: SocialLinkEditorProps) => {
  const [newLink, setNewLink] = useState<Partial<SocialLink>>({
    platform: "instagram",
    url: "",
    label: "",
  });

  const addLink = () => {
    if (!newLink.url || !newLink.label) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa la URL y la etiqueta",
        variant: "destructive",
      });
      return;
    }

    const link: SocialLink = {
      id: Date.now().toString(),
      platform: newLink.platform || "website",
      url: newLink.url,
      label: newLink.label,
    };

    onLinksChange([...links, link]);
    setNewLink({ platform: "instagram", url: "", label: "" });
    toast({
      title: "Enlace agregado",
      description: "El enlace se ha agregado correctamente",
    });
  };

  const removeLink = (id: string) => {
    onLinksChange(links.filter((link) => link.id !== id));
    toast({
      title: "Enlace eliminado",
      description: "El enlace se ha eliminado correctamente",
    });
  };

  const updateLink = (id: string, field: keyof SocialLink, value: string) => {
    onLinksChange(
      links.map((link) =>
        link.id === id ? { ...link, [field]: value } : link
      )
    );
  };

  const getPlatformIcon = (platform: string) => {
    const platformData = platforms.find((p) => p.value === platform);
    if (platformData) {
      const Icon = platformData.icon;
      return <Icon className="w-4 h-4" />;
    }
    return <Globe className="w-4 h-4" />;
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Enlaces de Redes Sociales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing links */}
        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl group"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                {getPlatformIcon(link.platform)}
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input
                  value={link.label}
                  onChange={(e) => updateLink(link.id, "label", e.target.value)}
                  placeholder="Etiqueta"
                  className="h-9"
                />
                <Input
                  value={link.url}
                  onChange={(e) => updateLink(link.id, "url", e.target.value)}
                  placeholder="URL"
                  className="h-9"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeLink(link.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add new link */}
        <div className="pt-4 border-t border-border">
          <Label className="text-sm font-medium mb-3 block">Agregar nuevo enlace</Label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select
              value={newLink.platform}
              onValueChange={(value) =>
                setNewLink({ ...newLink, platform: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Plataforma" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    <div className="flex items-center gap-2">
                      <platform.icon className="w-4 h-4" />
                      {platform.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Etiqueta (ej: Mi Instagram)"
              value={newLink.label}
              onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
            />
            <Input
              placeholder="URL"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            />
            <Button onClick={addLink} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialLinkEditor;
