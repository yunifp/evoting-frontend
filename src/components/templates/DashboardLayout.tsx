/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { Sidebar } from '@/components/organisms/Sidebar';
import { Header } from '@/components/organisms/Header';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menus, setMenus] = useState<any[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await api.get('/menus/me');
        const activeAndSortedMenus = response.data.data
          .filter((menu: any) => menu.is_active === true)
          .sort((a: any, b: any) => a.sort_order - b.sort_order);
        setMenus(activeAndSortedMenus);
      } catch (err) {
        console.error("Gagal mengambil menu", err);
        navigate('/login');
      }
    };
    fetchMenus();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(true);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      <Sidebar
        menus={menus}
        isMobileOpen={isMobileOpen}
        isCollapsed={isCollapsed}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-[#fcfcfc] overflow-hidden transition-all duration-300">
        <Header
          onToggleSidebar={handleToggleSidebar}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};