import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  isRegister?: boolean; 
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle, isRegister = false }) => {
  const navLinks = [
    { name: "Tentang", path: "/tentang" },
    { name: "Layanan", path: "/layanan" },
    { name: "Penyelenggara", path: "/register" },
    { name: "Kontak", path: "/kontak" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 overflow-hidden">
      
      {/* Kolom Branding (Kiri) - Tersembunyi di Mobile */}
      <div className="hidden md:flex md:w-[45%] bg-gray-950 flex-col justify-center items-center p-12 text-white relative">
        {/* Pola/Background dekoratif sederhana */}
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-cyan-900/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center space-y-6">
          <div className="mb-10 flex justify-center">
             <h1 className="text-5xl font-bold text-white tracking-tight">klik-<span className="text-[#12b3d6]">pilih</span></h1>
          </div>
          <h2 className="text-5xl font-bold leading-tight mb-4 tracking-tight">Pilih Pemimpin Masa Depan</h2>
          <p className="text-xl text-gray-300">Modern, Cepat, Tepat, Terpercaya. Platform E-Voting untuk Segala Kebutuhan.</p>
        </div>
      </div>

      <div className="flex-1 bg-white flex flex-col">
        
        <header className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight md:hidden">klik-<span className="text-[#12b3d6]">pilih</span></h1>
              <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
                {navLinks.map((link) => (
                  <Link key={link.name} to={link.path} className="hover:text-[#12b3d6] transition-colors">
                    {link.name}
                  </Link>
                ))}
              </div>
           </div>
          <div className="flex items-center gap-3">
             {isRegister ? (
                <Link to="/login" className="text-sm font-medium text-[#12b3d6] hover:underline">Masuk</Link>
             ) : (
                <Link to="/register" className="text-sm font-medium text-[#12b3d6] hover:underline">Daftar Penyelenggara</Link>
             )}
             <Button variant="outline" size="sm" className="hidden sm:inline-flex border-gray-200">Kontak Kami</Button>
          </div>
        </header>

        <main className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 md:p-20">
          <div className="w-full max-w-lg space-y-10">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-950 mb-2">{title}</h2>
              <p className="text-gray-600">{subtitle}</p>
            </div>
            
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};