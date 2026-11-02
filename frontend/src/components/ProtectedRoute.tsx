import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, LogIn, UserPlus } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
  message?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  message = "Please sign in or register to report a grievance." 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-civic-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-civic-navy-900 tracking-tight">
              Authentication Required
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {message}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
              className="w-full py-3 bg-gradient-to-r from-civic-navy-900 to-civic-blue-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Continue</span>
            </Link>

            <Link
              to={`/register?redirect=${encodeURIComponent(location.pathname + location.search)}`}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4 text-slate-500" />
              <span>Register as New User</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (requiredRole && requiredRole.length > 0) {
    const hasRole = requiredRole.includes(user.role);
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
