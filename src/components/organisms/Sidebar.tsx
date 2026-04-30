/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DynamicIcon } from '@/components/atoms/DynamicIcon';
import Logo from '@/assets/logo.png';

interface SidebarProps {
  menus: any[];
  isMobileOpen: boolean;
  isCollapsed: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ menus, isMobileOpen, isCollapsed, onCloseMobile }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 bg-white text-gray-800
        h-screen
        transform transition-all duration-300 ease-in-out flex flex-col border-r border-gray-100 shadow-sm
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-20' : 'md:w-72 w-72'}
      `}>
        {/* Logo */}
        <div className={`flex items-center h-20 px-6 border-b border-gray-100 shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {isCollapsed ? (
            <img src={Logo} alt="Logo" className="w-12 h-12 object-contain" />
          ) : (
            <img src={Logo} alt="Logo" className="h-14 w-auto object-contain" />
          )}
          <Button variant="ghost" size="icon" className="md:hidden text-gray-400 hover:text-[#12b3d6] hover:bg-cyan-50" onClick={onCloseMobile}>
            <X size={20} />
          </Button>
        </div>

        {/* Nav — satu-satunya area yang scroll */}
        <nav className="flex-1 py-6 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar px-3">
          {!isCollapsed && (
            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 whitespace-nowrap">
              Menu Utama
            </p>
          )}

          {menus.map((menu) => {
            const active = isActive(menu.path);
            return (
              <Link
                key={menu.id}
                to={menu.path}
                title={isCollapsed ? menu.name : undefined}
                className={`
                  flex items-center rounded-xl transition-all group relative
                  ${isCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3'}
                  ${active
                    ? 'bg-[#12b3d6] text-white shadow-md shadow-cyan-200/50 font-bold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-[#12b3d6] font-medium'}
                `}
                onClick={() => window.innerWidth < 768 && onCloseMobile()}
              >
                <div className="flex items-center gap-3">
                  <DynamicIcon
                    name={menu.icon}
                    size={20}
                    className={`shrink-0 transition-colors ${active ? 'text-white' : 'text-gray-400 group-hover:text-[#12b3d6]'}`}
                  />
                  {!isCollapsed && (
                    <span className="whitespace-nowrap">{menu.name}</span>
                  )}
                </div>
                {!isCollapsed && active && <ChevronRight size={16} className="shrink-0 text-white" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer versi — tidak ikut scroll */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          {isCollapsed ? (
            <div className="flex justify-center text-xs text-gray-400 font-bold">v1</div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500">Versi Aplikasi</p>
              <p className="text-sm font-bold text-gray-900">v1.0.0-beta</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};