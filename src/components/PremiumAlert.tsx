import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UpgradeModal } from "./UpgradeModal";

interface PremiumAlertProps {
  feature?: string;
  dismissible?: boolean;
}

export function PremiumAlert({ feature, dismissible = true }: PremiumAlertProps) {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // No mostrar si el usuario ya es premium o si fue descartado
  if (user?.subscription?.plan === 'premium' || dismissed) {
    return null;
  }

  return (
    <>
      <Alert className="relative border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-800">
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 p-1 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
          >
            <X className="h-4 w-4 text-amber-600" />
          </button>
        )}
        <Crown className="h-5 w-5 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-200 pr-6">
          {feature
            ? `"${feature}" es una característica Premium`
            : "¡Desbloquea todo el potencial de Pulpy!"
          }
        </AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          <p className="mb-3">
            {feature
              ? "Actualiza a Premium para acceder a esta y muchas más funcionalidades avanzadas."
              : "Obtén estadísticas avanzadas, personalización completa y enlaces ilimitados con el plan Premium."
            }
          </p>
          <Button
            onClick={() => setUpgradeOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            size="sm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade a Premium
          </Button>
        </AlertDescription>
      </Alert>

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}

