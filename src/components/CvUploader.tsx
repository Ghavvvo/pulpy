import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Upload, Trash2, Loader2, ExternalLink, BookOpen, UtensilsCrossed, Briefcase, Crown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export type DocumentType = "cv" | "catalog" | "menu" | "portfolio";

const DOC_TYPES: { id: DocumentType; label: string; icon: JSX.Element; defaultBtn: string }[] = [
  { id: "cv", label: "CV / Currículum", icon: <FileText className="w-4 h-4" />, defaultBtn: "Descargar CV" },
  { id: "catalog", label: "Catálogo", icon: <BookOpen className="w-4 h-4" />, defaultBtn: "Ver catálogo" },
  { id: "menu", label: "Menú", icon: <UtensilsCrossed className="w-4 h-4" />, defaultBtn: "Ver menú" },
  { id: "portfolio", label: "Portafolio / Brochure", icon: <Briefcase className="w-4 h-4" />, defaultBtn: "Ver portafolio" },
];

interface CvUploaderProps {
  cvUrl?: string;
  documentType?: DocumentType;
  documentLabel?: string;
  onCvChange: (url: string | null) => Promise<void> | void;
  onDocumentTypeChange?: (type: DocumentType) => Promise<void> | void;
  onDocumentLabelChange?: (label: string) => Promise<void> | void;
  embedded?: boolean;
  isPremium?: boolean;
}

const CvUploader = ({
  cvUrl,
  documentType = "cv",
  documentLabel,
  onCvChange,
  onDocumentTypeChange,
  onDocumentLabelChange,
  embedded = false,
  isPremium = false,
}: CvUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [labelDraft, setLabelDraft] = useState(documentLabel || "");

  const meta = DOC_TYPES.find((t) => t.id === documentType) || DOC_TYPES[0];

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
      // Borrar previo si existe
      if (cvUrl) {
        const parts = cvUrl.split("/user-content/");
        if (parts[1]) await supabase.storage.from("user-content").remove([parts[1].split("?")[0]]);
      }
      const fileName = `${user.id}/doc-${documentType}-${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage
        .from("user-content")
        .upload(fileName, file, { cacheControl: "3600", upsert: true, contentType: "application/pdf" });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage.from("user-content").getPublicUrl(fileName);
      await onCvChange(publicUrl);
      toast({ title: "Documento subido", description: "Tu PDF se guardó automáticamente" });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudo subir el documento", variant: "destructive" });
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
        await supabase.storage.from("user-content").remove([parts[1].split("?")[0]]);
      }
      await onCvChange(null);
      toast({ title: "Documento eliminado" });
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar el documento", variant: "destructive" });
    } finally {
      setRemoving(false);
    }
  };

  const body = (
    <div className="space-y-4">
      {!isPremium && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-800">
          <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <Crown className="w-3 h-3 text-amber-500" /> Premium
          </span>
          <span className="text-xs text-amber-600 dark:text-amber-400">
            <a href="/pricing" className="underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-300">Actualiza a Premium</a> para subir documentos
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Tipo de documento</Label>
          <Select value={documentType} onValueChange={(v) => onDocumentTypeChange?.(v as DocumentType)} disabled={!isPremium}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOC_TYPES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <span className="inline-flex items-center gap-2">{t.icon}{t.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="docLabel">Texto del botón <span className="text-muted-foreground text-xs">(opcional)</span></Label>
          <Input
            id="docLabel"
            value={labelDraft}
            onChange={(e) => setLabelDraft(e.target.value)}
            onBlur={() => {
              if ((labelDraft || "") !== (documentLabel || "")) onDocumentLabelChange?.(labelDraft);
            }}
            placeholder={meta.defaultBtn}
            disabled={!isPremium}
          />
        </div>
      </div>

      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
      {cvUrl ? (
        <div className="flex items-center gap-3 p-4 rounded-xl border bg-secondary/40">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
            {meta.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{meta.label} publicado</p>
            <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
              Ver archivo <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <Button variant="outline" size="sm" onClick={handleClick} disabled={uploading || removing || !isPremium}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRemove} disabled={uploading || removing || !isPremium}>
            {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
      ) : (
        <Button onClick={handleClick} disabled={uploading || !isPremium} className="w-full" variant="outline">
          {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
          {uploading ? "Subiendo..." : `Subir ${meta.label} en PDF`}
        </Button>
      )}
      {embedded && (
        <p className="text-xs text-muted-foreground">PDF, máx. 10MB. Se guarda automáticamente. Solo 1 documento activo.</p>
      )}
    </div>
  );

  if (embedded) return body;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Documento PDF descargable
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Elige el tipo (CV, catálogo, menú o portafolio) y súbelo. Los visitantes lo verán en tu microsite. Máx. 10MB.
        </p>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
};

export default CvUploader;
