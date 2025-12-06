import { Navigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  const { username } = useParams();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirigir al perfil público pasando la ruta completa que se intentaba acceder
    return <Navigate to={`/${username}`} state={{ showLoginPrompt: true, intendedDestination: location.pathname }} replace />;
  }

  // Verificar que el usuario autenticado es el dueño del perfil
  if (user && user.username !== username) {
    return <Navigate to={`/${user.username}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

