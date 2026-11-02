import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAdminAuth";

export default function AdminLogin() {
  const { session, signIn, isConfigured } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (session) return <Navigate to="/admin" replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await signIn(email, password);
    if (result.error) setError(result.error);
    setSubmitting(false);
  }

  return (
    <div className="admin-login">
      <form onSubmit={handleSubmit}>
        <img src="/poigai-logo-mark-256.png" alt="POIGAI" />
        <h1>Admin sign in</h1>
        {!isConfigured && (
          <p className="admin-form-warning">
            Supabase isn't connected yet. Add your project keys to <code>.env</code> first — see{" "}
            <code>SUPABASE_SETUP.md</code>.
          </p>
        )}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="username"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error && <p className="admin-form-error">{error}</p>}
        <button type="submit" disabled={submitting || !isConfigured}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
