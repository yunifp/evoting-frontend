import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Vote } from 'lucide-react';

export function LandingNavbar() {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                    <div className="bg-[#12b3d6] p-2 rounded-xl text-white">
                        <Vote size={24} />
                    </div>
                    <span className="text-2xl font-black text-gray-900 tracking-tight">Beresin<span className="text-[#12b3d6]">Voting</span></span>
                </div>

                <div className="hidden md:flex items-center gap-8 font-medium text-gray-600">
                    <a href="#fitur" className="hover:text-[#12b3d6] transition-colors">Fitur</a>
                    <a href="#keunggulan" className="hover:text-[#12b3d6] transition-colors">Keunggulan</a>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/login')} className="font-bold text-gray-600 hover:text-[#12b3d6]">Masuk</Button>
                    <Button onClick={() => navigate('/register')} className="bg-[#12b3d6] hover:bg-[#0fa0bf] text-white rounded-full px-6 shadow-lg shadow-cyan-200/50 font-bold">
                        Daftar Sekarang
                    </Button>
                </div>

                <button className="md:hidden text-gray-900" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl p-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
                    <a href="#fitur" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-600">Fitur</a>
                    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-100">
                        <Button variant="outline" onClick={() => navigate('/login')} className="w-full justify-center h-12 rounded-xl font-bold">Masuk</Button>
                        <Button onClick={() => navigate('/register')} className="w-full justify-center h-12 rounded-xl bg-[#12b3d6] hover:bg-[#0fa0bf] text-white font-bold">Daftar Sekarang</Button>
                    </div>
                </div>
            )}
        </nav>
    );
}