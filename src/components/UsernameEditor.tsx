import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, Loader2, X, AtSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  isUsernameAvailable,
  normalizeUsername,
  validateUsernameFormat,
} from "@/lib/username";
import { toast } from "@/hooks/use-toast";

type Status =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "invalid"; reason: string }
  | { kind: "taken" }
  | { kind: "available" }
  | { kind: "current" };

const UsernameEditor = ({ embedded = false }: { embedded?: boolean } = {}) => {
  const { user, updateProfile } = useAuth();
  const [value, setValue] = useState(user?.username ?? "");
  const [status, setStatus] = useState<Status>({ kind: "current" });
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const normalized = useMemo(() => normalizeUsername(value), [value]);
  const isCurrent = normalized === (user?.username ?? "");

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    if (isCurrent) {
      setStatus({ kind: "current" });
      return;
    }

    const validation = validateUsernameFormat(value);
    if (validation.ok !== true) {
      setStatus({ kind: "invalid", reason: validation.reason });
      return;
    }

    setStatus({ kind: "checking" });
    debounceRef.current = window.setTimeout(async () => {
      const available = await isUsernameAvailable(validation.value, user?.id);
      setStatus(available ? { kind: "available" } : { kind: "taken" });
    }, 400);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleSave = async () => {
    if (status.kind !== "available") return;
    setSaving(true);
    try {
      await updateProfile({ username: normalized });
      toast({
        title: "Nombre de usuario actualizado",
        description: `Tu nuevo enlace es /${normalized}`,
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "No se pudo cambiar el nombre de usuario",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Nombre de usuario</CardTitle>
        <p className="text-sm text-muted-foreground">
          Define tu enlace público: <span className="font-medium text-foreground">pulpy.app/{normalized || "tu-usuario"}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="username">Usuario</Label>
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="username"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="tu-usuario"
              className="pl-9 pr-10"
              autoComplete="off"
              spellCheck={false}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {status.kind === "checking" && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              {status.kind === "available" && <Check className="w-4 h-4 text-green-600" />}
              {status.kind === "taken" && <X className="w-4 h-4 text-destructive" />}
              {status.kind === "invalid" && <X className="w-4 h-4 text-destructive" />}
            </div>
          </div>
          <p className="text-xs min-h-4">
            {status.kind === "current" && (
              <span className="text-muted-foreground">Este es tu nombre actual.</span>
            )}
            {status.kind === "checking" && (
              <span className="text-muted-foreground">Comprobando disponibilidad…</span>
            )}
            {status.kind === "available" && (
              <span className="text-green-600">¡Disponible!</span>
            )}
            {status.kind === "taken" && (
              <span className="text-destructive">Este usuario ya está en uso.</span>
            )}
            {status.kind === "invalid" && (
              <span className="text-destructive">{status.reason}</span>
            )}
          </p>
        </div>

        <Button
          className="w-full rounded-full"
          onClick={handleSave}
          disabled={status.kind !== "available" || saving}
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Guardar nombre de usuario
        </Button>
      </CardContent>
    </Card>
  );
};

export default UsernameEditor;
