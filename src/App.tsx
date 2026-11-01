import { Navigate, Route, Routes } from "react-router-dom";
import StorefrontPage from "./pages/StorefrontPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import ProductsManager from "./pages/admin/ProductsManager";
import CategoriesManager from "./pages/admin/CategoriesManager";
import SettingsManager from "./pages/admin/SettingsManager";
import FeedbackManager from "./pages/admin/FeedbackManager";
import ReelsManager from "./pages/admin/ReelsManager";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";
import { useApplyTheme } from "./hooks/useApplyTheme";

export default function App() {
  useApplyTheme();

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
        <Route path="reels" element={<ReelsManager />} />
        <Route path="settings" element={<SettingsManager />} />
        <Route path="feedback" element={<FeedbackManager />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
