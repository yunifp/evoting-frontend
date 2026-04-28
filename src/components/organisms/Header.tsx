import React from 'react';
import { Menu as MenuIcon, Bell, User, LogOut, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onToggleSidebar: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onLogout }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 transition-all duration-300">
      <div className="flex items-center gap-4">
        {/* Tombol Menu untuk Mobile & Desktop */}
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="text-gray-500 hover:bg-gray-100">
          <MenuIcon size={22} />
        </Button>

        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-full px-4 py-2 w-64 lg:w-96 transition-all focus-within:ring-2 focus-within:ring-[#12b3d6]/20 focus-within:border-[#12b3d6]/30">
          <Search size={18} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Cari fitur atau menu..." 
            className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifikasi */}
        <Button variant="ghost" size="icon" className="relative text-gray-500 hover:bg-gray-50 rounded-full hidden sm:flex">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>

        <div className="hidden sm:block h-8 w-[1px] bg-gray-100 mx-1"></div>

        {/* Profil Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 pl-2 pr-1 py-1 h-auto hover:bg-gray-50 rounded-full outline-none ring-0">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-800 leading-none mb-1">{user.name || 'Admin'}</p>
                <p className="text-xs text-[#12b3d6] leading-none font-medium">Dashboard Area</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#12b3d6] to-cyan-300 flex items-center justify-center text-white shadow-md">
                <User size={20} />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 mt-2 rounded-xl shadow-xl border-gray-100 p-2">
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1.5">
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-50" />
            <DropdownMenuItem className="rounded-lg p-3 focus:bg-cyan-50 focus:text-[#12b3d6] cursor-pointer transition-colors">
              <User className="mr-3 h-4 w-4" />
              <span className="font-medium">Profil Saya</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="rounded-lg p-3 focus:bg-red-50 focus:text-red-600 text-red-500 cursor-pointer transition-colors mt-1"
              onClick={onLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span className="font-medium">Keluar Aplikasi</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};