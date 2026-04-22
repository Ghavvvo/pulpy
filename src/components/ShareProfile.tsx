import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Copy,
  Link as LinkIcon,
  Share2,
  Download,
  Crown,
  MessageCircle,
  Mail,
  Send,
  Linkedin,
  Twitter,
  Facebook,
  Phone,
  Slack,
  Hash,
  Bookmark,
  Image as ImageIcon,
  QrCode,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import QRCode from "react-qr-code";
import { jsPDF } from "jspdf";

interface ShareProfileProps {
  profileUrl: string;
  isPremium: boolean;
}

const ShareProfile = ({ profileUrl, isPremium }: ShareProfileProps) => {
  const qrWrapperRef = useRef<HTMLDivElement>(null);

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

  const getSvgMarkup = () => {
    const svgElement = qrWrapperRef.current?.querySelector("svg");
    if (!svgElement) throw new Error("No se encontró el QR");
    return new XMLSerializer().serializeToString(svgElement);
  };

  const downloadSvg = () => {
    try {
      const svgMarkup = getSvgMarkup();
      const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "pulpy-qr.svg";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Error", description: "No se pudo descargar SVG", variant: "destructive" });
    }
  };

  const renderQrToCanvas = async () => {
    const svgMarkup = getSvgMarkup();
    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = url;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("No se pudo renderizar QR"));
    });

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext("2d");

    if (!context) {
      URL.revokeObjectURL(url);
      throw new Error("No se pudo crear canvas");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 112, 112, 800, 800);
    URL.revokeObjectURL(url);
    return canvas;
  };

  const downloadPng = async () => {
    try {
      const canvas = await renderQrToCanvas();
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "pulpy-qr.png";
      link.click();
    } catch {
      toast({ title: "Error", description: "No se pudo descargar PNG", variant: "destructive" });
    }
  };

  const downloadPdf = async () => {
    try {
      const canvas = await renderQrToCanvas();
      const pngData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      pdf.setFontSize(18);
      pdf.text("Código QR de tu perfil Pulpy", 40, 50);
      pdf.addImage(pngData, "PNG", 112, 90, 380, 380);
      pdf.setFontSize(11);
      pdf.text(profileUrl, 40, 500, { maxWidth: 520 });
      pdf.save("pulpy-qr.pdf");
    } catch {
      toast({ title: "Error", description: "No se pudo descargar PDF", variant: "destructive" });
    }
  };

  type Channel =
    | "whatsapp"
    | "email"
    | "sms"
    | "linkedin"
    | "twitter"
    | "telegram"
    | "facebook"
    | "messenger"
    | "reddit"
    | "pinterest"
    | "tumblr"
    | "skype"
    | "slack"
    | "line"
    | "viber";

  const openChannel = (channel: Channel) => {
    const encodedUrl = encodeURIComponent(profileUrl);
    const encodedText = encodeURIComponent("Mira mi tarjeta digital Pulpy");
    const channels: Record<Channel, string> = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      email: `mailto:?subject=Mi%20tarjeta%20digital&body=${encodedText}%20${encodedUrl}`,
      sms: `sms:?body=${encodedText}%20${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      messenger: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}`,
      reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`,
      tumblr: `https://www.tumblr.com/share/link?url=${encodedUrl}&description=${encodedText}`,
      skype: `https://web.skype.com/share?url=${encodedUrl}&text=${encodedText}`,
      slack: `https://slack.com/intl/en/share?url=${encodedUrl}&text=${encodedText}`,
      line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
      viber: `viber://forward?text=${encodedText}%20${encodedUrl}`,
    };

    window.open(channels[channel], "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">QR & Compartir</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="rounded-2xl bg-secondary/30 p-6 flex flex-col items-center gap-4">
          <div ref={qrWrapperRef} className="rounded-2xl bg-card p-4 border border-border shadow-inner">
            <QRCode value={profileUrl} size={220} className="h-52 w-52" />
          </div>
          <p className="text-sm text-muted-foreground">QR dinámico para compartir tu tarjeta</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" onClick={downloadPng}>
            <Download className="w-4 h-4 mr-2" />
            PNG
          </Button>
          <Button variant="outline" onClick={downloadSvg}>
            <Download className="w-4 h-4 mr-2" />
            SVG
          </Button>
          <Button variant="outline" onClick={downloadPdf}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button onClick={shareProfile}>
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </Button>
        </div>

        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
          <p className="text-sm font-medium text-card-foreground">Canales de distribución</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => openChannel("whatsapp")}>
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={() => openChannel("email")}>
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button variant="outline" size="sm" onClick={() => openChannel("sms")}>
              <Send className="w-4 h-4 mr-2" />
              SMS
            </Button>
            <Button variant="outline" size="sm" onClick={() => openChannel("linkedin")}>
              <Linkedin className="w-4 h-4 mr-2" />
              LinkedIn
            </Button>
            <Button variant="outline" size="sm" onClick={() => openChannel("twitter")}>
              <Twitter className="w-4 h-4 mr-2" />
              Twitter/X
            </Button>
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="w-4 h-4 mr-2" />
              Copiar
            </Button>
          </div>
        </div>

        <div className="p-4 bg-secondary/40 rounded-xl border border-border space-y-3">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-primary" />
            <p className="font-medium text-sm">Funciones Premium</p>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Personalizar QR (colores, logo central, forma de patrón y ojos) {isPremium ? "activado" : "disponible en Premium"}.
            </p>
            <p>
              Enlace corto personalizado tipo <span className="font-medium text-foreground">custom.link/tunombre</span> {isPremium ? "activado" : "disponible en Premium"}.
            </p>
          </div>
        </div>

        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">📡</span>
            </div>
            <div>
              <p className="font-medium text-sm text-card-foreground">Tarjeta NFC</p>
              <p className="text-xs text-muted-foreground mt-1">
                Programa tu tarjeta NFC con este enlace y comparte tu perfil con un solo toque.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareProfile;
