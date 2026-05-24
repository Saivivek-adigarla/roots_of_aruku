import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import { secureStorage } from '../utils/security';

interface Props {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const { user, isAdmin } = useAuthStore();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      if (!user) {
        setSessionValid(false);
        setIsValidating(false);
        return;
      }

      // Validate session timestamp
      const sessionTimestamp = secureStorage.get<number>('session_timestamp');
      const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

      if (sessionTimestamp) {
        const now = Date.now();
        if (now - sessionTimestamp > SESSION_TIMEOUT) {
          secureStorage.clear();
          setSessionValid(false);
          setIsValidating(false);
          return;
        }
      }

      // Update session timestamp on valid access
      secureStorage.set('session_timestamp', Date.now());
      setSessionValid(true);
      setIsValidating(false);
    };

    validateSession();
  }, [user, location]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-maroon-700 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user || !sessionValid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" state={{ unauthorized: true }} replace />;
  }

  return <>{children}</>;
}
