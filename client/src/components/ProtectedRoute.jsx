import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gh-canvas">
        <div className="flex flex-col items-center gap-2">
          <span className="w-5 h-5 border border-gh-border border-t-gh-accent rounded-full animate-spin" />
          <p className="text-2xs text-gh-muted font-mono">loading…</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
