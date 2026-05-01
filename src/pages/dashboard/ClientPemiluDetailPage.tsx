/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePemiluDetail } from '@/hooks/usePemiluDetail';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vote, Users, ArrowLeft, Info, Calendar } from 'lucide-react';

import { PemiluInfoTab } from '@/components/organisms/PemiluInfoTab';
import { KandidatTab } from '@/components/organisms/KandidatTab';
import { DptTab } from '@/components/organisms/DptTab';
import { KandidatModal } from '@/components/organisms/KandidatModal';
import { DptModal } from '@/components/organisms/DptModal';

export default function ClientPemiluDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    // Pastikan updateKandidat di-destructure dari hook
    const { pemilu, dpts, isLoading, fetchDetail, fetchDpts, addKandidat, updateKandidat, deleteKandidat, addDpt, publishPemilu, closePemilu } = usePemiluDetail(id!);

    const [isKandidatModalOpen, setIsKandidatModalOpen] = useState(false);
    const [selectedKandidat, setSelectedKandidat] = useState<any>(null); // State penyimpan data kandidat yang mau diedit
    const [isDptModalOpen, setIsDptModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchDetail();
            fetchDpts();
        }
    }, [id, fetchDetail, fetchDpts]);

    // Fungsi buka modal untuk TAMBAH
    const handleOpenAddModal = () => {
        setSelectedKandidat(null);
        setIsKandidatModalOpen(true);
    };

    // Fungsi buka modal untuk EDIT
    const handleOpenEditModal = (kandidat: any) => {
        setSelectedKandidat(kandidat);
        setIsKandidatModalOpen(true);
    };

    // Fungsi tutup modal kandidat dengan animasi smooth reset
    const handleCloseKandidatModal = () => {
        setIsKandidatModalOpen(false);
        setTimeout(() => setSelectedKandidat(null), 300);
    };

    // Fungsi Submit (Digunakan untuk Add dan Edit sekaligus)
    const handleSubmitKandidat = async (data: FormData, kandidatId?: number) => {
        setIsSubmitting(true);
        try {
            if (kandidatId) {
                await updateKandidat(kandidatId, data);
            } else {
                await addKandidat(data);
            }
            handleCloseKandidatModal();
        } catch (error: any) {
            alert(error.response?.data?.error || "Gagal menyimpan kandidat");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteKandidat = async (kandidatId: number) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus kandidat ini? Seluruh perolehan suaranya akan hilang!")) {
            try {
                await deleteKandidat(kandidatId);
            } catch (error: any) {
                alert("Gagal menghapus kandidat");
            }
        }
    };

    const handleAddDpt = async (data: any) => {
        setIsSubmitting(true);
        try {
            const result = await addDpt(data);
            setIsDptModalOpen(false);
            if (result.data?.data?.is_face_recognition_active) {
                alert("DPT beserta Template Wajah (Biometrik) berhasil disimpan!");
            } else {
                alert("DPT berhasil disimpan.");
            }
        } catch (error: any) {
            alert(error.response?.data?.error || "Gagal menambahkan pemilih");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || !pemilu) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#12b3d6] rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium">Memuat data acara secara real-time...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
            {/* Header Acara Pemilu */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#12b3d6]/10 to-transparent rounded-bl-full pointer-events-none"></div>
                <div className="flex items-center gap-5 relative z-10">
                    <Button variant="outline" size="icon" onClick={() => navigate('/dashboard/pemilu')} className="rounded-full border-gray-200 text-gray-500 hover:text-gray-900 w-12 h-12 shrink-0">
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight uppercase">{pemilu.title}</h1>
                        <div className="flex items-center gap-3 mt-2 text-gray-500">
                            <Badge variant="outline" className="font-mono text-xs text-gray-400 border-gray-200">ID: {pemilu.id}</Badge>
                            <span className="flex items-center text-sm font-medium"><Calendar size={14} className="mr-1.5" /> Dibuat: {new Date(pemilu.created_at).toLocaleDateString('id-ID')}</span>
                            {pemilu.transaction?.layanan && (
                                <Badge className="bg-[#12b3d6]/10 text-[#12b3d6] border-none font-bold">
                                    Paket: {pemilu.transaction.layanan.name}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
                <div className="relative z-10 flex shrink-0">
                    {pemilu.status === 'draft' ? (
                        <Button
                            onClick={() => {
                                if (window.confirm("Apakah Anda yakin ingin mengaktifkan acara ini? Setelah aktif, pemilih terdaftar dapat login dan melakukan voting.")) {
                                    publishPemilu();
                                }
                            }}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-6 rounded-2xl font-black shadow-lg shadow-orange-200 uppercase tracking-widest flex items-center gap-2"
                        >
                            🚀 Aktifkan Sekarang
                        </Button>
                    ) : pemilu.status === 'active' ? (
                        <Button
                            onClick={() => {
                                if (window.confirm("Yakin ingin menutup pemilihan ini secara permanen? Pemilih tidak akan bisa memberikan suara lagi dan hasil akan dikunci.")) {
                                    closePemilu();
                                }
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-6 rounded-2xl font-black shadow-lg shadow-red-200 uppercase tracking-widest flex items-center gap-2"
                        >
                            🔒 Tutup Pemilihan
                        </Button>
                    ) : (
                        <Badge className="px-5 py-2.5 rounded-2xl uppercase tracking-widest text-sm font-black shadow-sm bg-blue-50 text-blue-700 border border-blue-200">
                            Status: Selesai
                        </Badge>
                    )}
                </div>
            </div>

            {/* Area Tabs (Navigasi Modul) */}
            <Tabs defaultValue="kandidat" className="w-full flex flex-col gap-6">
                <TabsList className="flex flex-row w-full bg-gray-100 p-1.5 rounded-2xl h-auto shrink-0 overflow-x-auto shadow-inner">
                    <TabsTrigger value="info" className="flex-1 rounded-xl py-3 font-bold text-gray-500 data-[state=active]:bg-white data-[state=active]:text-[#12b3d6] data-[state=active]:shadow-sm transition-all whitespace-nowrap text-base">
                        <Info size={18} className="mr-2 inline" /> Info Acara
                    </TabsTrigger>
                    <TabsTrigger value="kandidat" className="flex-1 rounded-xl py-3 font-bold text-gray-500 data-[state=active]:bg-white data-[state=active]:text-[#12b3d6] data-[state=active]:shadow-sm transition-all whitespace-nowrap text-base">
                        <Vote size={18} className="mr-2 inline" /> Paslon ({pemilu.kandidats?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="dpt" className="flex-1 rounded-xl py-3 font-bold text-gray-500 data-[state=active]:bg-white data-[state=active]:text-[#12b3d6] data-[state=active]:shadow-sm transition-all whitespace-nowrap text-base">
                        <Users size={18} className="mr-2 inline" /> DPT ({dpts.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="w-full animate-in slide-in-from-bottom-4 duration-500">
                    <PemiluInfoTab pemilu={pemilu} />
                </TabsContent>

                <TabsContent value="kandidat" className="w-full animate-in slide-in-from-bottom-4 duration-500">
                    <KandidatTab 
                        pemilu={pemilu} 
                        onOpenModal={handleOpenAddModal} 
                        onEdit={handleOpenEditModal} 
                        onDelete={handleDeleteKandidat} 
                    />
                </TabsContent>

                <TabsContent value="dpt" className="w-full animate-in slide-in-from-bottom-4 duration-500">
                    <DptTab 
                        dpts={dpts} 
                        pemilu={pemilu} 
                        onOpenModal={() => setIsDptModalOpen(true)} 
                    />
                </TabsContent>
            </Tabs>

            {/* Modals */}
            <KandidatModal 
                isOpen={isKandidatModalOpen} 
                onClose={handleCloseKandidatModal} 
                onSubmit={handleSubmitKandidat} 
                isSubmitting={isSubmitting} 
                initialData={selectedKandidat}
            />

            <DptModal 
                isOpen={isDptModalOpen} 
                onClose={() => setIsDptModalOpen(false)} 
                onSubmit={handleAddDpt} 
                isSubmitting={isSubmitting} 
                pemilu={pemilu} 
            />
        </div>
    );
}