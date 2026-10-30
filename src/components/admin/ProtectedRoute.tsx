import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAdminAuth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading, isConfigured } = useAdminAuth();

  if (!isConfigured) {
    return (
      <div className="admin-setup-notice">
        <h2>Connect Supabase first</h2>
        <p>
          Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your <code>.env</code>{" "}
          file, then restart the dev server to unlock the admin panel. See <code>SUPABASE_SETUP.md</code> for the
          full steps.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="admin-loading">Checking your session…</div>;
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
