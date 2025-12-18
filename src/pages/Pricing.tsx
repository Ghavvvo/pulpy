import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  X, 
  Crown, 
  Sparkles, 
  Calendar,
  Zap,
  Shield,
  HeadphonesIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { UpgradeModal } from "@/components/UpgradeModal";
import { PLANS, BillingCycle } from "@/lib/plans";

const Pricing = () => {
  const { isAuthenticated, isPremium } = useAuth();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const freePlan = PLANS.free;
  const premiumPlan = PLANS.premium;
  
  const premiumPrice = billingCycle === 'monthly' 
    ? premiumPlan.price.monthly 
    : premiumPlan.price.annual;
  
  const savings = billingCycle === 'annual' 
    ? (premiumPlan.price.monthly * 12) - premiumPlan.price.annual 
    : 0;

  const handleUpgrade = () => {
    if (!isAuthenticated) {
      // Redirigir a signup si no está autenticado
      window.location.href = '/signup';
      return;
    }
    setUpgradeOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            <Sparkles className="h-3 w-3 mr-1" />
            Precios simples
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Elige el plan perfecto para ti
          </h1>
          <p className="text-lg text-muted-foreground">
            Empieza gratis y actualiza cuando necesites más funcionalidades.
            Sin sorpresas, sin cargos ocultos.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="flex items-center gap-4 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "py-2 px-6 rounded-md text-sm font-medium transition-all",
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
                "py-2 px-6 rounded-md text-sm font-medium transition-all relative",
                billingCycle === 'annual'
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="h-4 w-4 inline mr-2" />
              Anual
              <Badge className="absolute -top-3 -right-3 bg-green-500 text-xs">
                Ahorra 20%
              </Badge>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Zap className="h-6 w-6 text-primary" />
                {freePlan.name}
              </CardTitle>
              <CardDescription>{freePlan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">Gratis</span>
                <span className="text-muted-foreground ml-2">para siempre</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {freePlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                {freePlan.limitations?.map((limitation, index) => (
                  <div key={index} className="flex items-center gap-2 text-muted-foreground">
                    <X className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                    <span className="text-sm">{limitation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              {isAuthenticated ? (
                <Button variant="outline" className="w-full" disabled>
                  Plan actual
                </Button>
              ) : (
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/signup">Empezar gratis</Link>
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className="relative border-2 border-primary shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1">
                <Crown className="h-3 w-3 mr-1" />
                Más popular
              </Badge>
            </div>
            <CardHeader className="pt-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Crown className="h-6 w-6 text-yellow-500" />
                {premiumPlan.name}
              </CardTitle>
              <CardDescription>{premiumPlan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {premiumPrice.toLocaleString('es-CU')}
                </span>
                <span className="text-muted-foreground ml-2">
                  CUP/{billingCycle === 'monthly' ? 'mes' : 'año'}
                </span>
              </div>
              {savings > 0 && (
                <Badge variant="secondary" className="w-fit mt-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  Ahorras {savings.toLocaleString('es-CU')} CUP al año
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {premiumPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              {isPremium ? (
                <Button className="w-full" disabled>
                  <Crown className="h-4 w-4 mr-2" />
                  Ya eres Premium
                </Button>
              ) : (
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                  onClick={handleUpgrade}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upgrade a Premium
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Features Comparison */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            ¿Por qué elegir Premium?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-lg bg-muted/50">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Sin límites</h3>
              <p className="text-sm text-muted-foreground">
                Añade todos los enlaces y redes sociales que necesites sin restricciones.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-muted/50">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Estadísticas completas</h3>
              <p className="text-sm text-muted-foreground">
                Conoce quién visita tu perfil y qué enlaces son más populares.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-muted/50">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeadphonesIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Soporte prioritario</h3>
              <p className="text-sm text-muted-foreground">
                Respuestas rápidas y ayuda personalizada cuando la necesites.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ or CTA */}
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">¿Tienes dudas?</h2>
          <p className="text-muted-foreground mb-6">
            Contáctanos por WhatsApp y te ayudamos a elegir el mejor plan para ti.
          </p>
          <Button variant="outline" size="lg" asChild>
            <a href="https://wa.me/+5352123456" target="_blank" rel="noopener noreferrer">
              Contactar soporte
            </a>
          </Button>
        </div>
      </main>

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
};

export default Pricing;

