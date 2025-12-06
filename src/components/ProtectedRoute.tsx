import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  const { username } = useParams();

  if (!isAuthenticated) {
    // Redirigir al login pasando la ruta actual como parámetro
    return <Navigate to={`/${username}`} state={{ showLoginPrompt: true }} replace />;
  }

  // Verificar que el usuario autenticado es el dueño del perfil
  if (user && user.username !== username) {
    return <Navigate to={`/${user.username}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

