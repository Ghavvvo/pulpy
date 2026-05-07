import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import {
  LogOut,
  Crown,
  Home,
  Edit3,
  Share2,
  BarChart3,
  Shield,
  ExternalLink,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isPremium, isAdmin, logout } = useAuth();
  const isLanding = location.pathname === "/";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const onDashboard = !!user && location.pathname === `/${user.username}/dashboard`;
  const onStatistics = !!user && location.pathname.includes("/statistics");
  const currentTab = searchParams.get("tab") || "home";

  const initials = (user?.name || user?.username || "U")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navItems = user
    ? [
        { id: "home", label: "Inicio", icon: Home, to: `/${user.username}/dashboard?tab=home`, active: onDashboard && currentTab === "home" },
        { id: "card", label: "Mi Tarjeta", icon: Edit3, to: `/${user.username}/dashboard?tab=card`, active: onDashboard && currentTab === "card" },
        { id: "share", label: "QR & Compartir", icon: Share2, to: `/${user.username}/dashboard?tab=share`, active: onDashboard && currentTab === "share" },
        { id: "stats", label: "Estadísticas", icon: BarChart3, to: `/${user.username}/statistics`, active: onStatistics },
      ]
    : [];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link
          to={isAuthenticated && user ? `/${user.username}/dashboard` : "/"}
          className="flex items-center gap-2 flex-shrink-0"
        >
          <span className="font-bold text-xl text-foreground">Pulpy</span>
        </Link>

        {isAuthenticated && user && !isLanding && (
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.to}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors",
                  item.active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2 flex-shrink-0">
          <ThemeToggle />

          {isLanding ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Iniciar sesión</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Comenzar gratis</Link>
              </Button>
            </>
          ) : isAuthenticated && user ? (
            <>
              {!isPremium && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hidden sm:inline-flex text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                >
                  <Link to="/pricing">
                    <Crown className="h-4 w-4 mr-1.5" />
                    Premium
                  </Link>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="flex items-center gap-3 py-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">{user.name || user.username}</span>
                      <span className="text-xs text-muted-foreground truncate">@{user.username}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/${user.username}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver mi perfil público
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/${user.username}/dashboard?tab=card`}>
                      <UserIcon className="h-4 w-4 mr-2" />
                      Editar mi tarjeta
                    </Link>
                  </DropdownMenuItem>
                  {!isPremium && (
                    <DropdownMenuItem asChild>
                      <Link to="/pricing">
                        <Crown className="h-4 w-4 mr-2 text-amber-600" />
                        Mejorar a Premium
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : null}
        </div>
      </div>

      {/* Mobile sub-nav */}
      {isAuthenticated && user && !isLanding && (
        <nav className="md:hidden flex items-center gap-1 px-3 pb-2 overflow-x-auto border-t border-border/50 pt-2">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors",
                item.active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
