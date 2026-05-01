import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, KeyRound, Check, CheckCircle2 } from "lucide-react";
import Logo from "@/assets/logo.png";
import { supabase } from "@/lib/supabase";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase parses the recovery hash automatically and emits PASSWORD_RECOVERY.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setValidSession(true);
      }
    });

    // Also check current session in case the event fires before mount.
    supabase.auth.getSession().then(({ data: { session } }) => {
      const hash = window.location.hash;
      if (session || hash.includes("type=recovery")) {
        setValidSession(true);
      } else {
        setValidSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const passwordRequirements = {
    minLength: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasLetter: /[a-zA-Z]/.test(password),
  };
  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast({ title: "Contraseña inválida", description: "Debe cumplir con todos los requisitos", variant: "destructive" });
      return;
    }
    if (!passwordsMatch) {
      toast({ title: "Error", description: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setDone(true);
      toast({ title: "¡Contraseña actualizada!", description: "Ya puedes iniciar sesión con tu nueva contraseña" });

      // Sign out so the user logs in fresh with new credentials.
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/login");
      }, 1800);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo actualizar la contraseña",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="Pulpy Logo" className="h-10" />
          </Link>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1">
            <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              {done ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <KeyRound className="w-6 h-6 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              {done ? "Contraseña actualizada" : "Nueva contraseña"}
            </CardTitle>
            <CardDescription className="text-center">
              {done
                ? "Te estamos redirigiendo al login..."
                : "Crea una nueva contraseña segura para tu cuenta"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {validSession === null && (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {validSession === false && (
              <div className="text-center space-y-4 py-2">
                <p className="text-sm text-muted-foreground">
                  El enlace es inválido o ha expirado. Solicita uno nuevo para continuar.
                </p>
                <Button asChild className="w-full">
                  <Link to="/forgot-password">Solicitar nuevo enlace</Link>
                </Button>
              </div>
            )}

            {validSession && !done && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {password && (
                    <div className="space-y-1 mt-2">
                      {[
                        { ok: passwordRequirements.minLength, label: "Mínimo 8 caracteres" },
                        { ok: passwordRequirements.hasNumber, label: "Al menos un número" },
                        { ok: passwordRequirements.hasLetter, label: "Al menos una letra" },
                      ].map((r) => (
                        <div key={r.label} className="flex items-center gap-2 text-xs">
                          <Check className={`w-3 h-3 ${r.ok ? "text-green-500" : "text-muted-foreground"}`} />
                          <span className={r.ok ? "text-green-500" : "text-muted-foreground"}>{r.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmar contraseña</Label>
                  <Input
                    id="confirm"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-destructive">Las contraseñas no coinciden</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || !isPasswordValid || !passwordsMatch}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    "Actualizar contraseña"
                  )}
                </Button>
              </form>
            )}
          </CardContent>

          {!done && validSession && (
            <CardFooter>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground mx-auto">
                Cancelar
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
