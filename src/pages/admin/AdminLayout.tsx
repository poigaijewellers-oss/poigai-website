import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutGrid, LogOut, Settings, Tag } from "lucide-react";
import { useAdminAuth } from "../../hooks/useAdminAuth";

export default function AdminLayout() {
  const { signOut } = useAdminAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <img src="/poigai-logo-mark.png" alt="POIGAI" />
        <span>Admin panel</span>
        <button onClick={handleSignOut}>
          <LogOut size={15} /> Sign out
        </button>
      </header>
      <nav className="admin-tabs">
        <NavLink to="/admin/products" className={({ isActive }) => (isActive ? "is-active" : "")}>
          <LayoutGrid size={15} /> Products
        </NavLink>
        <NavLink to="/admin/categories" className={({ isActive }) => (isActive ? "is-active" : "")}>
          <Tag size={15} /> Categories
        </NavLink>
        <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? "is-active" : "")}>
          <Settings size={15} /> Site settings
        </NavLink>
      </nav>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
