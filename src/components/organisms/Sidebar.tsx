/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronDown, X } from 'lucide-react';
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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const isActive = (path: string) => {
    if (!path || path === '#') return false;
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const newExpanded: Record<string, boolean> = { ...expanded };
    menus.forEach(menu => {
      if (menu.sub_menus?.some((sub: any) => isActive(sub.path))) {
        newExpanded[menu.id] = true;
      }
    });
    setExpanded(newExpanded);
  }, [location.pathname, menus]);

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
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

        <nav className="flex-1 py-6 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar px-3">
          {!isCollapsed && (
            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 whitespace-nowrap">
              Menu Utama
            </p>
          )}

          {menus.map((menu) => {
            const hasSubMenus = menu.sub_menus && menu.sub_menus.length > 0;
            const isParentActive = isActive(menu.path) || (hasSubMenus && menu.sub_menus.some((sub: any) => isActive(sub.path)));
            const isExpanded = expanded[menu.id];

            return (
              <div key={menu.id} className="space-y-1">
                {hasSubMenus ? (
                  <button
                    title={isCollapsed ? menu.name : undefined}
                    className={`
                      w-full flex items-center rounded-xl transition-all group relative
                      ${isCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3'}
                      ${isParentActive
                        ? 'bg-cyan-50 text-[#12b3d6] font-bold'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-[#12b3d6] font-medium'}
                    `}
                    onClick={(e) => toggleMenu(menu.id, e)}
                  >
                    <div className="flex items-center gap-3">
                      <DynamicIcon
                        name={menu.icon}
                        size={20}
                        className={`shrink-0 transition-colors ${isParentActive ? 'text-[#12b3d6]' : 'text-gray-400 group-hover:text-[#12b3d6]'}`}
                      />
                      {!isCollapsed && (
                        <span className="whitespace-nowrap">{menu.name}</span>
                      )}
                    </div>
                    {!isCollapsed && (
                      isExpanded ? <ChevronDown size={16} className="shrink-0" /> : <ChevronRight size={16} className="shrink-0" />
                    )}
                  </button>
                ) : (
                  <Link
                    to={menu.path || '#'}
                    title={isCollapsed ? menu.name : undefined}
                    className={`
                      flex items-center rounded-xl transition-all group relative
                      ${isCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3'}
                      ${isActive(menu.path)
                        ? 'bg-[#12b3d6] text-white shadow-md shadow-cyan-200/50 font-bold'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-[#12b3d6] font-medium'}
                    `}
                    onClick={() => window.innerWidth < 768 && onCloseMobile()}
                  >
                    <div className="flex items-center gap-3">
                      <DynamicIcon
                        name={menu.icon}
                        size={20}
                        className={`shrink-0 transition-colors ${isActive(menu.path) ? 'text-white' : 'text-gray-400 group-hover:text-[#12b3d6]'}`}
                      />
                      {!isCollapsed && (
                        <span className="whitespace-nowrap">{menu.name}</span>
                      )}
                    </div>
                  </Link>
                )}

                {hasSubMenus && isExpanded && !isCollapsed && (
                  <div className="pl-10 pr-2 space-y-1 mt-1">
                    {menu.sub_menus.map((sub: any) => {
                      const isSubActive = isActive(sub.path);
                      return (
                        <Link
                          key={sub.id}
                          to={sub.path || '#'}
                          className={`
                            flex items-center gap-3 rounded-lg px-3 py-2 transition-all
                            ${isSubActive
                              ? 'text-[#12b3d6] font-bold bg-cyan-50'
                              : 'text-gray-500 hover:text-[#12b3d6] hover:bg-gray-50 font-medium'}
                          `}
                          onClick={() => window.innerWidth < 768 && onCloseMobile()}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-[#12b3d6]' : 'bg-gray-300'}`} />
                          <span className="text-sm">{sub.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

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