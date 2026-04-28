import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import { ProtectedRoute } from './components/atoms/ProtectedRoute';
import { DashboardLayout } from './components/templates/DashboardLayout';
import UserManagementPage from './pages/dashboard/UserManagement';
import MenuManagementPage from './pages/dashboard/MenuManagementPage';
import RoleManagementPage from './pages/dashboard/RoleManagementPage';
import PermissionManagementPage from './pages/dashboard/PermissionManagementPage';

// Halaman dummy untuk testing
const DashboardHome = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Selamat Datang di Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-500 text-sm">Status Akun</p>
        <p className="text-xl font-bold text-green-500">Aktif & Terverifikasi</p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard/*"
            element={
              <DashboardLayout>
                <Routes>
                  <Route index element={<DashboardHome />} />
                  <Route path="users" element={<UserManagementPage />} />
                  <Route path="layanan" element={<div>Halaman Manajemen Layanan</div>} />
                  <Route path="menus" element={<MenuManagementPage />} />
                  <Route path="roles" element={<RoleManagementPage />} />
                  <Route path="permissions" element={<PermissionManagementPage />} />
                </Routes>
              </DashboardLayout>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;