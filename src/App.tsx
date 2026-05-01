import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import { ProtectedRoute } from './components/atoms/ProtectedRoute';
import { DashboardLayout } from './components/templates/DashboardLayout';
import UserManagementPage from './pages/dashboard/UserManagement';
import LayananManagementPage from './pages/dashboard/LayananManagementPage';
import LayananCatalogPage from './pages/dashboard/LayananCatalogPage';
import MenuManagementPage from './pages/dashboard/MenuManagementPage';
import RoleManagementPage from './pages/dashboard/RoleManagementPage';
import PermissionManagementPage from './pages/dashboard/PermissionManagementPage';
import ClientTransactionPage from './pages/dashboard/ClientTransactionPage';
import ClientPemiluPage from './pages/dashboard/ClientPemiluPage';
import ClientPemiluDetailPage from './pages/dashboard/ClientPemiluDetailPage';
import ClientLayananStatusPage from './pages/dashboard/ClientLayananStatusPage';

// TAMBAHAN: Import komponen Landing Page
import LandingPage from './pages/LandingPage'; 

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
        {/* Rute Landing Page Baru */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Rute Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rute Dashboard Terproteksi */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard/*"
            element={
              <DashboardLayout>
                <Routes>
                  <Route index element={<DashboardHome />} />
                  <Route path="users" element={<UserManagementPage />} />
                  <Route path="layanan" element={<LayananManagementPage />} />
                  <Route path="katalog-layanan" element={<LayananCatalogPage />} />
                  <Route path="menus" element={<MenuManagementPage />} />
                  <Route path="roles" element={<RoleManagementPage />} />
                  <Route path="transactions" element={<ClientTransactionPage />} />
                  <Route path="pemilu" element={<ClientPemiluPage />} />
                  <Route path="pemilu/:id" element={<ClientPemiluDetailPage />} />
                  <Route path="permissions" element={<PermissionManagementPage />} />
                  <Route path="status" element={<ClientLayananStatusPage />} />
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