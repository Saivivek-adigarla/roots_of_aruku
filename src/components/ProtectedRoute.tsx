import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface Props {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const isAdminFn = useAuthStore((s) => s.isAdmin);
  const hydrationComplete = useAuthStore((s) => s.hydrationComplete);
  const location = useLocation();

  // Wait for auth hydration from localStorage
  if (!hydrationComplete) {
    return null; // Don't render anything while hydrating
  }

  // If still initializing with Firebase, show loading
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-maroon-700 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdminFn()) {
    toast.error('Admin access required');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
