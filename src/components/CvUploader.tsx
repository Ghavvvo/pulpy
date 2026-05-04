import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Trash2, Loader2, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface CvUploaderProps {
  cvUrl?: string;
  onCvChange: (url: string | null) => Promise<void> | void;
}

const CvUploader = ({ cvUrl, onCvChange }: CvUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleClick = () => inputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    e.target.value = "";

    if (file.type !== "application/pdf") {
      toast({ title: "Formato no válido", description: "Solo se admiten archivos PDF", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Archivo muy grande", description: "El PDF debe pesar menos de 10MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileName = `${user.id}/cv-${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage
        .from("user-content")
        .upload(fileName, file, { cacheControl: "3600", upsert: true, contentType: "application/pdf" });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage.from("user-content").getPublicUrl(fileName);
      await onCvChange(publicUrl);
      toast({ title: "CV subido", description: "Tu CV se guardó automáticamente" });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudo subir el CV", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!cvUrl) return;
    setRemoving(true);
    try {
      const parts = cvUrl.split("/user-content/");
      if (parts[1]) {
        await supabase.storage.from("user-content").remove([parts[1]]);
      }
      await onCvChange(null);
      toast({ title: "CV eliminado" });
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar el CV", variant: "destructive" });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" />
          CV / Currículum (PDF)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Súbelo y los visitantes podrán descargarlo desde tu microsite. Máx. 10MB.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {cvUrl ? (
          <div className="flex items-center gap-3 p-4 rounded-xl border bg-secondary/40">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">CV publicado</p>
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
              >
                Ver archivo <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <Button variant="outline" size="sm" onClick={handleClick} disabled={uploading || removing}>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRemove} disabled={uploading || removing}>
              {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </div>
        ) : (
          <Button onClick={handleClick} disabled={uploading} className="w-full" variant="outline">
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            {uploading ? "Subiendo..." : "Subir CV en PDF"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CvUploader;
