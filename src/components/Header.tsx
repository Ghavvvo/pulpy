import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, LogOut } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const isLanding = location.pathname === "/";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={isAuthenticated && user ? `/${user.username}` : "/"} className="flex items-center gap-2">
          <img src={logo} alt="Pulpy Logo" className="h-8" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {isAuthenticated && user && !isLanding && (
            <>
              <Link 
                to={`/${user.username}/dashboard`}
                className={`transition-colors ${location.pathname.includes('/dashboard') ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Dashboard
              </Link>
              <Link 
                to={`/${user.username}/statistics`}
                className={`transition-colors ${location.pathname.includes('/statistics') ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
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
          ) : isAuthenticated ? (
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;
