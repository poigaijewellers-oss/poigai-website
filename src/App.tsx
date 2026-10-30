import { Navigate, Route, Routes } from "react-router-dom";
import StorefrontPage from "./pages/StorefrontPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import ProductsManager from "./pages/admin/ProductsManager";
import CategoriesManager from "./pages/admin/CategoriesManager";
import SettingsManager from "./pages/admin/SettingsManager";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StorefrontPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products" element={<ProductsManager />} />
        <Route path="categories" element={<CategoriesManager />} />
        <Route path="settings" element={<SettingsManager />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
