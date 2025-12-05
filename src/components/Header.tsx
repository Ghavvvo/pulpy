import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import logo from "@/assets/logo.png";

const Header = () => {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-bold text-xl text-foreground">Pulpy</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {isLanding ? (
            <>

            </>
          ) : (
            <>
              <Link 
                to="/dashboard" 
                className={`transition-colors ${location.pathname === '/dashboard' ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/statistics" 
                className={`transition-colors ${location.pathname === '/statistics' ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Estadísticas
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isLanding ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Iniciar sesión</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Comenzar gratis</Link>
              </Button>
            </>
          ) : (
            <Button variant="outline" asChild>
              <Link to="/">Cerrar sesión</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
