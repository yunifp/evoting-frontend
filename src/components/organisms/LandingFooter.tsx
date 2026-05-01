import { Vote } from 'lucide-react';

export function LandingFooter() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#12b3d6] p-1.5 rounded-lg text-white">
                            <Vote size={20} />
                        </div>
                        <span className="text-xl font-black text-gray-900 tracking-tight">Beresin<span className="text-[#12b3d6]">Voting</span></span>
                    </div>
                    
                    <p className="text-gray-500 font-medium text-sm text-center md:text-left">
                        © {new Date().getFullYear()} CV Dignity Mitra Pratama. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}