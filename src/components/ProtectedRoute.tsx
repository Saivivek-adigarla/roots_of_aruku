import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface Props {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const user = useAuthStore((s) => s.user);
  const isAdminFn = useAuthStore((s) => s.isAdmin);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdminFn()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
