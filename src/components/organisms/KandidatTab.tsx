/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { Vote, Plus, Trash2, Edit2, Image as ImageIcon, BarChart3, Users, PieChart as PieChartIcon } from 'lucide-react';

interface Props {
    pemilu: any;
    results?: any;
    onOpenModal: () => void;
    onEdit: (kandidat: any) => void; 
    onDelete: (id: number) => void;
}

export function KandidatTab({ pemilu, results, onOpenModal, onEdit, onDelete }: Props) {
    const getImageUrl = (path: string) => {
        if (!path) return '';
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
        return `${baseUrl}${path}`;
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-gray-200 pb-4 mb-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Kandidat Paslon</h2>
                    <p className="text-gray-500 mt-1 font-medium">Kelola daftar pasangan calon yang akan bertanding di pemilu ini.</p>
                </div>
                {pemilu.status !== 'selesai' && (
                    <Button onClick={onOpenModal} className="bg-[#12b3d6] hover:bg-[#0fa0bf] rounded-full h-12 px-8 shadow-lg shadow-cyan-200/50 text-base">
                        <Plus size={20} className="mr-2" /> Daftarkan Paslon
                    </Button>
                )}
            </div>

            {pemilu.kandidats?.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <Vote size={64} className="mx-auto text-gray-200 mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900">Belum Ada Kandidat</h3>
                    <p className="text-gray-500 font-medium mt-2">Silakan daftarkan pasangan calon pertama Anda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {pemilu.kandidats?.map((k: any) => (
                        <div key={k.id} className="bg-white border-2 border-gray-100 rounded-[2rem] p-6 flex flex-col sm:flex-row gap-6 relative group overflow-hidden shadow-soft hover:shadow-xl hover:border-[#12b3d6]/50 transition-all duration-300">
                            <div className="w-full sm:w-40 h-48 sm:h-auto bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden border-2 border-white shadow-inner relative">
                                {k.photo_url ? (
                                    <img 
                                        src={getImageUrl(k.photo_url)} 
                                        alt={k.name} 
                                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500" 
                                    />
                                ) : (
                                    <ImageIcon size={48} className="text-gray-300" />
                                )}
                                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-xl text-sm font-black border border-white/20">NO. {k.no_urut}</div>
                            </div>
                            <div className="flex-1 flex flex-col">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-black text-2xl text-gray-900 leading-tight mb-4 pr-20">{k.name}</h4>
                                    
                                    {pemilu.status !== 'selesai' && (
                                        <div className="absolute top-6 right-6 flex gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => onEdit(k)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full bg-white shadow-sm border border-gray-100">
                                                <Edit2 size={18} />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => onDelete(k.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full bg-white shadow-sm border border-gray-100">
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4 flex-1 mt-2">
                                    <div className="bg-cyan-50/50 p-4 rounded-2xl border border-cyan-100/50">
                                        <p className="text-[11px] font-black text-[#12b3d6] uppercase tracking-widest mb-1">Visi</p>
                                        <p className="text-sm text-gray-700 font-medium leading-relaxed">{k.visi || 'Belum ada visi.'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">Misi</p>
                                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{k.misi || 'Belum ada misi.'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {results && (
                <div className="mt-16 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">Hasil Perolehan Suara</h3>
                        <p className="text-gray-500 mt-1 font-medium">Analisis real-time dan rekapitulasi data pemilihan.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                                <Users size={28} />
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Suara Masuk</p>
                            <h4 className="text-5xl font-black text-gray-900">{results.total_suara_masuk}</h4>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                                <Vote size={28} />
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Suara Sah</p>
                            <h4 className="text-5xl font-black text-emerald-500">{results.suara_sah}</h4>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
                                <PieChartIcon size={28} />
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Suara Abstain</p>
                            <h4 className="text-5xl font-black text-amber-500">{results.suara_abstain}</h4>
                            <p className="text-sm font-bold text-amber-600/70 mt-2 bg-amber-50 px-3 py-1 rounded-full">{results.persentase_abstain.toFixed(1)}% dari total</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                            <h4 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                <BarChart3 className="text-[#12b3d6]" size={24} /> Grafik Perolehan Kandidat
                            </h4>
                            <div className="space-y-8">
                                {results.kandidat_results.map((k: any) => (
                                    <div key={k.kandidat_id} className="relative">
                                        <div className="flex justify-between items-end mb-3">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-black flex items-center justify-center text-sm border border-slate-200">
                                                    {k.no_urut}
                                                </div>
                                                <span className="font-bold text-gray-800 text-base">{k.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-black text-[#12b3d6] text-2xl leading-none">{k.persentase.toFixed(1)}%</span>
                                                <div className="text-xs font-bold text-gray-400 mt-1">{k.total_votes} Suara</div>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden shadow-inner">
                                            <div 
                                                className="bg-gradient-to-r from-[#12b3d6] to-cyan-300 h-full rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${k.persentase}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
                            <h4 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                <Users className="text-[#12b3d6]" size={24} /> Tabel Rekapitulasi Akhir
                            </h4>
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b-2 border-gray-100 text-gray-400">
                                            <th className="pb-4 font-black uppercase tracking-widest w-16">No</th>
                                            <th className="pb-4 font-black uppercase tracking-widest">Kandidat</th>
                                            <th className="pb-4 font-black uppercase tracking-widest text-right">Suara</th>
                                            <th className="pb-4 font-black uppercase tracking-widest text-right w-24">Hasil</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {results.kandidat_results.map((k: any) => (
                                            <tr key={k.kandidat_id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-5 font-black text-gray-900 text-lg">{k.no_urut}</td>
                                                <td className="py-5 font-bold text-gray-700 text-base">{k.name}</td>
                                                <td className="py-5 font-black text-[#12b3d6] text-right text-lg">{k.total_votes}</td>
                                                <td className="py-5 font-black text-gray-400 text-right">{k.persentase.toFixed(1)}%</td>
                                            </tr>
                                        ))}
                                        <tr className="bg-amber-50/30">
                                            <td colSpan={2} className="py-5 font-bold text-amber-700 pl-4 rounded-l-2xl">Suara Abstain</td>
                                            <td className="py-5 font-black text-amber-600 text-right text-lg">{results.suara_abstain}</td>
                                            <td className="py-5 font-black text-amber-600/70 text-right rounded-r-2xl">{results.persentase_abstain.toFixed(1)}%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}