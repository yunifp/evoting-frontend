/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DynamicIcon } from '@/components/atoms/DynamicIcon'; // Import atom baru kita

interface SidebarProps {
  menus: any[];
  isMobileOpen: boolean;
  isCollapsed: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ menus, isMobileOpen, isCollapsed, onCloseMobile }) => {
  const location = useLocation();

  return (
    <>
      {/* Overlay Mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity" 
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 bg-gray-950 text-white
        transform transition-all duration-300 ease-in-out flex flex-col border-r border-gray-800
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-20' : 'md:w-72 w-72'} 
      `}>
        {/* Logo Section */}
        <div className={`flex items-center h-20 px-6 border-b border-gray-800 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {isCollapsed ? (
             <div className="w-10 h-10 bg-[#12b3d6] rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-cyan-900/50">
                k
             </div>
          ) : (
            <h1 className="text-2xl font-bold tracking-tight whitespace-nowrap overflow-hidden">
              klik-<span className="text-[#12b3d6]">pilih</span>
            </h1>
          )}
          <Button variant="ghost" size="icon" className="md:hidden text-gray-400 hover:text-white" onClick={onCloseMobile}>
            <X size={20} />
          </Button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 py-6 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar px-3">
          {!isCollapsed && (
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 whitespace-nowrap">
              Menu Utama
            </p>
          )}
          
          {menus.map((menu) => {
            const isActive = location.pathname.includes(menu.path); // Lebih fleksibel untuk sub-routing
            return (
              <Link
                key={menu.id}
                to={menu.path}
                title={isCollapsed ? menu.name : undefined}
                className={`
                  flex items-center rounded-xl transition-all group relative
                  ${isCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3'}
                  ${isActive 
                    ? 'bg-[#12b3d6] text-white shadow-lg shadow-cyan-900/20' 
                    : 'text-gray-400 hover:bg-gray-900 hover:text-white'}
                `}
                onClick={() => window.innerWidth < 768 && onCloseMobile()}
              >
                <div className="flex items-center gap-3">
                  {/* Terapkan Dynamic Icon yang membaca dari database */}
                  <DynamicIcon 
                    name={menu.icon} 
                    size={20} 
                    className={`shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#12b3d6]'}`} 
                  />
                  
                  {!isCollapsed && (
                    <span className="font-medium text-sm whitespace-nowrap">{menu.name}</span>
                  )}
                </div>
                {!isCollapsed && isActive && <ChevronRight size={16} className="shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar / Info App */}
        <div className="p-4 border-t border-gray-800">
           {isCollapsed ? (
             <div className="flex justify-center text-xs text-gray-600 font-bold">
               v1
             </div>
           ) : (
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <p className="text-xs text-gray-500">Versi Aplikasi</p>
              <p className="text-sm font-semibold text-gray-300">v1.0.0-beta</p>
            </div>
           )}
        </div>
      </aside>
    </>
  );
};