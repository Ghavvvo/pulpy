import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to={`/${user.username}/dashboard`} replace />;
  }
  return <>{children}</>;
};

export default AdminRoute;
