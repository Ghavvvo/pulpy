import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Crown,
  Check,
  MessageCircle,
  Copy,
  Sparkles,
  Calendar,
  CreditCard
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  PLANS,
  BillingCycle,
  generatePaymentReference,
  getWhatsAppUrl
} from "@/lib/plans";
import { cn } from "@/lib/utils";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const { user, requestUpgrade } = useAuth();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [step, setStep] = useState<'select' | 'payment'>('select');
  const [paymentReference, setPaymentReference] = useState<string>('');

  const plan = PLANS.premium;
  const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.annual;
  const savings = billingCycle === 'annual'
    ? (plan.price.monthly * 12) - plan.price.annual
    : 0;

  const handleSelectPlan = () => {
    const reference = generatePaymentReference();
    setPaymentReference(reference);

    // Registrar la solicitud de upgrade en el contexto
    if (requestUpgrade) {
      requestUpgrade(reference, billingCycle);
    }

    setStep('payment');
  };

  const handleCopyReference = () => {
    navigator.clipboard.writeText(paymentReference);
    toast({
      title: "Referencia copiada",
      description: "La referencia ha sido copiada al portapapeles",
      variant: "success",
    });
  };

  const handleWhatsAppPayment = () => {
    const url = getWhatsAppUrl(
      paymentReference,
      plan.name,
      billingCycle,
      price,
      user?.name || 'Usuario'
    );
    window.open(url, '_blank');

    toast({
      title: "¡Casi listo!",
      description: "Te estamos redirigiendo a WhatsApp. Envía el mensaje para completar tu solicitud.",
      variant: "success",
    });
  };

  const handleClose = () => {
    setStep('select');
    setPaymentReference('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            {step === 'select' ? 'Upgrade a Premium' : 'Completa tu pago'}
          </DialogTitle>
          <DialogDescription>
            {step === 'select'
              ? 'Desbloquea todas las funcionalidades de Pulpy'
              : 'Sigue las instrucciones para activar tu plan Premium'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'select' ? (
          <div className="space-y-6">
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
                  billingCycle === 'monthly'
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                Mensual
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={cn(
                  "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all relative",
                  billingCycle === 'annual'
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sparkles className="h-4 w-4 inline mr-2" />
                Anual
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-xs">
                  -20%
                </Badge>
              </button>
            </div>

            {/* Plan Card */}
            <Card className="border-2 border-primary">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      {plan.name}
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">
                      {price.toLocaleString('es-CU')}
                      <span className="text-sm font-normal text-muted-foreground"> CUP</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {billingCycle === 'monthly' ? '/mes' : '/año'}
                    </div>
                  </div>
                </div>
                {savings > 0 && (
                  <Badge variant="secondary" className="w-fit mt-2 bg-green-100 text-green-700">
                    Ahorras {savings.toLocaleString('es-CU')} CUP al año
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Button onClick={handleSelectPlan} className="w-full" size="lg">
              <CreditCard className="h-4 w-4 mr-2" />
              Continuar con el pago
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Payment Reference */}
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Tu referencia de pago
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-2xl font-mono font-bold bg-muted px-4 py-2 rounded-lg">
                      {paymentReference}
                    </code>
                    <Button variant="outline" size="icon" onClick={handleCopyReference}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <strong>Monto a pagar:</strong>{' '}
                    <span className="text-foreground font-semibold">
                      {price.toLocaleString('es-CU')} CUP
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Instructions */}
            <div className="space-y-3">
              <h4 className="font-medium">Instrucciones:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Haz clic en el botón "Pagar vía WhatsApp"</li>
                <li>Se abrirá WhatsApp con un mensaje prellenado</li>
                <li>Envía el mensaje a nuestro equipo</li>
                <li>Realiza la transferencia al número que te indicaremos</li>
                <li>Tu cuenta será activada en menos de 24 horas</li>
              </ol>
            </div>

            {/* WhatsApp Button */}
            <Button
              onClick={handleWhatsAppPayment}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Pagar vía WhatsApp
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              ¿Tienes dudas? Contáctanos por WhatsApp y te ayudamos.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

