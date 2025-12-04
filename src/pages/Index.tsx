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
  Users
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const features = [
    {
      icon: Smartphone,
      title: "Tarjeta Digital",
      description: "Crea tu tarjeta de contacto digital profesional en minutos.",
    },
    {
      icon: QrCode,
      title: "Comparte fácilmente",
      description: "Código QR, enlace directo o NFC. Tú eliges cómo compartir.",
    },
    {
      icon: BarChart3,
      title: "Analíticas",
      description: "Conoce quién visita tu perfil y qué enlaces generan más interés.",
    },
    {
      icon: Share2,
      title: "Redes Sociales",
      description: "Conecta todas tus redes en un solo lugar accesible.",
    },
  ];

  const steps = [
    { number: "01", title: "Crea tu perfil", description: "Añade tu información y redes sociales" },
    { number: "02", title: "Personaliza", description: "Diseña tu tarjeta con tu estilo" },
    { number: "03", title: "Comparte", description: "QR, Link o NFC - tú decides" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        
        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Tu identidad digital profesional</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
              Tu tarjeta de contacto
              <span className="text-primary block">del futuro</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Crea tu tarjeta de presentación digital, compártela con NFC o QR, 
              y descubre quién está interesado en conectar contigo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-base px-8">
                <Link to="/dashboard">
                  Comenzar gratis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8">
                <a href="#features">Ver características</a>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-12 text-sm text-muted-foreground">
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
                <span>Configuración en 2 min</span>
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
              Herramientas profesionales para gestionar tu presencia digital y hacer networking de manera efectiva.
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
            Comienza a crear conexiones más significativas con tu tarjeta digital Pulpy.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-base px-8">
            <Link to="/dashboard">
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
