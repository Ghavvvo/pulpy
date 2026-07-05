import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import {
  Zap,
  QrCode,
  BarChart3,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Share2,
  Users,
  Link2,
} from "lucide-react";
import Logo from "@/assets/logo.png";
import FlipCardDemo from "@/components/FlipCardDemo";

const Index = () => {
  const features = [
    {
      icon: Smartphone,
      title: "Tu perfil digital",
      description:
        "Una tarjeta de presentación online con tu foto, bio, contacto y estilo propio.",
    },
    {
      icon: Link2,
      title: "Todas tus redes en un lugar",
      description:
        "Instagram, LinkedIn, TikTok, WhatsApp, tu web… todos tus enlaces en un único link.",
    },
    {
      icon: Share2,
      title: "Comparte al instante",
      description:
        "QR descargable o link corto para compartir tu info sin instalar nada.",
    },
    {
      icon: BarChart3,
      title: "Estadísticas reales",
      description:
        "Descubre cuántos visitan tu perfil y qué enlaces reciben más clics.",
    },
  ];

  const steps = [
    { number: "01", title: "Crea tu perfil", description: "Foto, bio y datos de contacto" },
    { number: "02", title: "Añade tus redes", description: "Conecta todos tus enlaces en un solo lugar" },
    { number: "03", title: "Comparte tu QR o link", description: "Sin apps, sin fricción, listo para conectar" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 bg-violet-100/40">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
                <Zap className="w-3.5 h-3.5" />
                Tu presencia digital, en una sola tarjeta
              </div>

              <img className="h-20 mb-6 mx-auto lg:mx-0" src={Logo} alt="Pulpy" />

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Tu perfil digital,
                <span className="text-primary block">todo en un enlace</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                Crea tu tarjeta de presentación digital con tus redes sociales,
                contacto y enlaces. Compártela con un QR o un link y descubre
                quién conecta contigo.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button size="lg" asChild className="text-base px-8">
                  <Link to="/signup">
                    Crear mi tarjeta gratis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base px-8">
                  <a href="#example">Ver ejemplo</a>
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 mt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Gratis para empezar</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Sin tarjeta de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Listo en 2 minutos</span>
                </div>
              </div>
            </div>

            <div id="example" className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute -inset-8 bg-primary/10 blur-3xl rounded-full" aria-hidden="true" />
                <div className="relative">
                  <FlipCardDemo />
                  <p className="mt-6 text-center text-xs text-muted-foreground">
                    Pasa el cursor sobre la tarjeta para ver el QR
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Todo lo que necesitas
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Centraliza tu presencia digital y haz networking sin fricción.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Cómo funciona
            </h2>
            <p className="text-lg text-muted-foreground">
              En solo 3 pasos tendrás tu tarjeta lista
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="text-6xl font-bold text-primary/20 mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <Users className="w-16 h-16 mx-auto mb-6 text-primary-foreground/80" />
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Únete a miles de profesionales
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Empieza a crear conexiones más significativas con tu tarjeta digital Pulpy.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-base px-8">
            <Link to="/signup">
              Crear mi tarjeta gratis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">Pulpy</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Pulpy. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
