import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Vote } from 'lucide-react';

export function LandingHero() {
    const navigate = useNavigate();

    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            <div className="absolute top-0 right-0 -z-10 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-100/40 via-white to-white"></div>
            
            <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                <div className="flex flex-col items-start space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-[#12b3d6] text-sm font-bold">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#12b3d6]"></span>
                        </span>
                        Sistem E-Voting Terpercaya
                    </div>
                    
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight">
                        Demokrasi Digital <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#12b3d6] to-blue-600">
                            Aman & Praktis.
                        </span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-lg font-medium">
                        Solusi modern untuk pemilihan di organisasi, instansi, maupun sekolah. Dilengkapi dengan keamanan Anti-Fraud dan verifikasi biometrik.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row w-full gap-4 pt-4">
                        <Button onClick={() => navigate('/register')} className="h-14 px-8 rounded-full bg-[#12b3d6] hover:bg-[#0fa0bf] shadow-xl shadow-cyan-200/50 text-white font-black text-base group">
                            Mulai Buat Acara 
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                        </Button>
                        <Button variant="outline" onClick={() => document.getElementById('fitur')?.scrollIntoView({ behavior: 'smooth' })} className="h-14 px-8 rounded-full border-gray-200 text-gray-700 font-bold text-base hover:bg-gray-50">
                            Pelajari Fitur
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-500 pt-4">
                        <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-[#12b3d6]"/> Hasil Real-time</span>
                        <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-[#12b3d6]"/> Face Recognition</span>
                        <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-[#12b3d6]"/> Cloud Based</span>
                    </div>
                </div>

                <div className="relative w-full aspect-square md:aspect-auto md:h-[500px] bg-gradient-to-tr from-cyan-50 to-blue-50 rounded-[3rem] border-8 border-white shadow-2xl animate-in zoom-in-95 duration-700 delay-150 flex flex-col items-center justify-center overflow-hidden">
                     {/* Kamu bisa ganti tag img ini dengan asset mockup dashboard mu */}
                    <div className="text-center p-8">
                         <div className="w-24 h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-6 text-[#12b3d6]">
                             <Vote size={48} />
                         </div>
                         <h3 className="text-2xl font-black text-gray-900">Dashboard Interaktif</h3>
                         <p className="text-gray-500 font-medium mt-2">Kelola kandidat dan DPT dalam satu layar.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}