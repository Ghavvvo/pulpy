import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Copy, Link as LinkIcon, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ShareProfileProps {
  profileUrl: string;
}

const ShareProfile = ({ profileUrl }: ShareProfileProps) => {
  const [showQR, setShowQR] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Enlace copiado",
      description: "El enlace ha sido copiado al portapapeles",
    });
  };

  const shareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mi Tarjeta Digital Pulpy",
          url: profileUrl,
        });
      } catch (error) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Compartir Perfil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URL Field */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              readOnly
              value={profileUrl}
              className="pl-10 bg-secondary/50"
            />
          </div>
          <Button variant="outline" size="icon" onClick={copyToClipboard}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => setShowQR(!showQR)}
            className="w-full"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Código QR
          </Button>
          <Button onClick={shareProfile} className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </Button>
        </div>

        {/* QR Code placeholder */}
        {showQR && (
          <div className="flex flex-col items-center p-6 bg-secondary/30 rounded-xl">
            <div className="w-48 h-48 bg-card rounded-xl shadow-inner flex items-center justify-center border-2 border-dashed border-border">
              <div className="text-center">
                <QrCode className="w-24 h-24 text-primary mx-auto" />
                <p className="text-xs text-muted-foreground mt-2">QR Code</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Escanea para ver el perfil
            </p>
          </div>
        )}

        {/* NFC Info */}
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">📡</span>
            </div>
            <div>
              <p className="font-medium text-sm text-card-foreground">Tarjeta NFC</p>
              <p className="text-xs text-muted-foreground mt-1">
                Programa tu tarjeta NFC con este enlace para compartir tu perfil con un solo toque.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareProfile;
