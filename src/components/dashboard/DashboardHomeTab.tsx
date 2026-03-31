import QRCode from "react-qr-code";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Share2, QrCode } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DashboardHomeTabProps {
  profileUrl: string;
  onOpenShareCenter: () => void;
}

const DashboardHomeTab = ({ profileUrl, onOpenShareCenter }: DashboardHomeTabProps) => {
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Enlace copiado",
      description: "Listo para compartir tu tarjeta.",
    });
  };

  const quickShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Mi tarjeta digital Pulpy",
        url: profileUrl,
      });
      return;
    }
    await copyToClipboard();
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Dashboard / Inicio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-2xl bg-secondary/40 p-6 md:p-8 flex flex-col items-center gap-4">
          <div className="rounded-2xl bg-card p-4 md:p-6 shadow-inner border border-border">
            <QRCode value={profileUrl} size={240} className="h-52 w-52 md:h-64 md:w-64" />
          </div>
          <p className="text-sm text-muted-foreground text-center">Código dinámico de tu perfil público</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button onClick={quickShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </Button>
          <Button variant="outline" onClick={copyToClipboard}>
            <Copy className="w-4 h-4 mr-2" />
            Copiar enlace
          </Button>
          <Button variant="secondary" onClick={onOpenShareCenter}>
            <QrCode className="w-4 h-4 mr-2" />
            QR & Compartir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardHomeTab;