/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePemiluDetail } from '@/hooks/usePemiluDetail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Vote, Users, Plus, Trash2, ArrowLeft, UserPlus, Info, Calendar, X, Image as ImageIcon, Clock, ScanFace } from 'lucide-react';

export default function ClientPemiluDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { pemilu, dpts, isLoading, fetchDetail, fetchDpts, addKandidat, deleteKandidat, addDpt, publishPemilu, closePemilu } = usePemiluDetail(id!);

    const [isKandidatModalOpen, setIsKandidatModalOpen] = useState(false);
    const [isDptModalOpen, setIsDptModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [kandidatForm, setKandidatForm] = useState({ no_urut: '', name: '', visi: '', misi: '', photo_url: '' });
    const [dptForm, setDptForm] = useState({ nik: '', nama: '', no_hp: '', face_template: '' });

    useEffect(() => {
        if (id) {
            fetchDetail();
            fetchDpts();
        }
    }, [id, fetchDetail, fetchDpts]);

    const handleAddKandidat = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addKandidat({
                no_urut: Number(kandidatForm.no_urut),
                name: kandidatForm.name,
                visi: kandidatForm.visi,
                misi: kandidatForm.misi,
                photo_url: kandidatForm.photo_url
            });
            setIsKandidatModalOpen(false);
            setKandidatForm({ no_urut: '', name: '', visi: '', misi: '', photo_url: '' });
            fetchDetail();
        } catch (error: any) {
            alert(error.response?.data?.error || "Gagal menambahkan kandidat");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteKandidat = async (kandidatId: number) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus kandidat ini? Seluruh perolehan suaranya akan hilang!")) {
            try {
                await deleteKandidat(kandidatId);
                fetchDetail();
            } catch (error: any) {
                alert("Gagal menghapus kandidat");
            }
        }
    };

    const handleAddDpt = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await addDpt({
                nik: dptForm.nik,
                nama: dptForm.nama,
                no_hp: dptForm.no_hp,
                face_template: dptForm.face_template
            });
            setIsDptModalOpen(false);
            setDptForm({ nik: '', nama: '', no_hp: '', face_template: '' });
            fetchDpts();

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
                            {/* Tambahan Info Paket di Header */}
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
                    <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-soft max-w-3xl">
                        <h3 className="font-extrabold text-gray-900 mb-8 flex items-center gap-3 text-2xl border-b border-gray-100 pb-4">
                            <Clock className="text-[#12b3d6]" size={28} /> Waktu Pelaksanaan Bilik Suara
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex flex-col p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                                <div className="w-1.5 h-full bg-emerald-400 absolute left-0 top-0"></div>
                                <span className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Bilik Dibuka</span>
                                <span className="font-black text-2xl text-gray-900">{new Date(pemilu.start_date).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</span>
                            </div>
                            <div className="flex flex-col p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                                <div className="w-1.5 h-full bg-red-400 absolute left-0 top-0"></div>
                                <span className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Bilik Ditutup</span>
                                <span className="font-black text-2xl text-gray-900">{new Date(pemilu.end_date).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</span>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="kandidat" className="w-full animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-gray-200 pb-4 mb-6">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Kandidat Paslon</h2>
                            <p className="text-gray-500 mt-1 font-medium">Kelola daftar pasangan calon yang akan bertanding di pemilu ini.</p>
                        </div>
                        <Button onClick={() => setIsKandidatModalOpen(true)} className="bg-[#12b3d6] hover:bg-[#0fa0bf] rounded-full h-12 px-8 shadow-lg shadow-cyan-200/50 text-base">
                            <Plus size={20} className="mr-2" /> Daftarkan Paslon
                        </Button>
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
                                            <img src={k.photo_url} alt={k.name} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <ImageIcon size={48} className="text-gray-300" />
                                        )}
                                        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-xl text-sm font-black border border-white/20">
                                            NO. {k.no_urut}
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-black text-2xl text-gray-900 leading-tight mb-4 pr-12">{k.name}</h4>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteKandidat(k.id)} className="absolute top-6 right-6 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full bg-white shadow-sm border border-gray-100">
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>

                                        <div className="space-y-4 flex-1">
                                            <div className="bg-cyan-50/50 p-4 rounded-2xl border border-cyan-100/50">
                                                <p className="text-[11px] font-black text-[#12b3d6] uppercase tracking-widest mb-1">Visi</p>
                                                <p className="text-sm text-gray-700 font-medium leading-relaxed">{k.visi || 'Belum ada visi.'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">Misi</p>
                                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{k.misi || 'Belum ada misi.'}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs font-bold text-gray-400">
                                            <span>Ditambahkan: {new Date(k.created_at).toLocaleDateString('id-ID')}</span>
                                            <span>ID: #{k.id}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="dpt" className="w-full animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-gray-200 pb-4 mb-6">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Daftar Pemilih Tetap (DPT)</h2>
                            <p className="text-gray-500 mt-1 font-medium">Total <span className="font-bold text-gray-900">{dpts.length}</span> pemilih telah terdaftar dan siap memberikan suara.</p>
                        </div>
                        <Button onClick={() => setIsDptModalOpen(true)} className="bg-gray-900 hover:bg-gray-800 rounded-full h-12 px-8 shadow-lg text-white text-base">
                            <UserPlus size={20} className="mr-2" /> Daftarkan Pemilih
                        </Button>
                    </div>

                    {dpts.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <Users size={64} className="mx-auto text-gray-200 mb-6" />
                            <h3 className="text-2xl font-bold text-gray-900">Belum Ada Pemilih</h3>
                            <p className="text-gray-500 font-medium mt-2">Daftarkan pemilih agar mereka bisa login dan melakukan voting.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-x-auto">
                            <Table className="min-w-[800px]">
                                <TableHeader className="bg-gray-50/80">
                                    <TableRow className="border-b border-gray-100 hover:bg-transparent">
                                        <TableHead className="font-extrabold text-gray-900 py-5 px-6">ID Pemilih</TableHead>
                                        <TableHead className="font-extrabold text-gray-900">NIK Identitas</TableHead>
                                        <TableHead className="font-extrabold text-gray-900">Nama Lengkap</TableHead>
                                        <TableHead className="font-extrabold text-gray-900">No. WhatsApp</TableHead>
                                        <TableHead className="font-extrabold text-gray-900">Waktu Didaftarkan</TableHead>
                                        <TableHead className="font-extrabold text-gray-900">Status Voting</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dpts.map((d) => (
                                        <TableRow key={d.id} className="hover:bg-gray-50/50 border-b border-gray-50 transition-colors group">
                                            <TableCell className="px-6 py-4 flex items-center gap-2">
                                                <Badge variant="outline" className="font-mono text-xs text-gray-400 bg-white group-hover:border-gray-300">
                                                    {d.id.substring(0, 8)}...
                                                </Badge>
                                                {d.face_template && (
                                                    <span title="Data Wajah Tersimpan">
                                                        <ScanFace size={16} className="text-blue-500" />
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-gray-600 font-medium tracking-wider">{d.nik}</TableCell>
                                            <TableCell className="font-black text-gray-900 text-base">{d.nama}</TableCell>
                                            <TableCell className="text-gray-600 font-medium">{d.no_hp}</TableCell>
                                            <TableCell className="text-sm text-gray-500 font-medium">
                                                {new Date(d.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </TableCell>
                                            <TableCell>
                                                {d.status_voted ?
                                                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-3 py-1">Sudah Memilih</Badge> :
                                                    <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-bold px-3 py-1">Belum Memilih</Badge>
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Modal Tambah Kandidat (Tidak Diubah) */}
            {isKandidatModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                <div className="bg-[#12b3d6]/10 p-2 rounded-xl text-[#12b3d6]"><Vote size={24} /></div>
                                Daftarkan Pasangan Calon
                            </h2>
                            <button onClick={() => setIsKandidatModalOpen(false)} className="text-gray-400 hover:text-gray-900 bg-white rounded-full p-2.5 border border-gray-200 shadow-sm transition-all"><X size={20} /></button>
                        </div>

                        <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <form id="kandidat-form" onSubmit={handleAddKandidat} className="space-y-6">

                                <div className="grid grid-cols-4 gap-6">
                                    <div className="space-y-2 col-span-1">
                                        <Label className="text-gray-700 font-bold text-sm uppercase tracking-wide">No Urut <span className="text-red-500">*</span></Label>
                                        <Input required type="number" min="1" value={kandidatForm.no_urut} onChange={(e) => setKandidatForm({ ...kandidatForm, no_urut: e.target.value })} className="h-14 rounded-2xl text-center text-xl font-black bg-gray-50" placeholder="1" />
                                    </div>
                                    <div className="space-y-2 col-span-3">
                                        <Label className="text-gray-700 font-bold text-sm uppercase tracking-wide">Nama Lengkap Paslon <span className="text-red-500">*</span></Label>
                                        <Input required value={kandidatForm.name} onChange={(e) => setKandidatForm({ ...kandidatForm, name: e.target.value })} className="h-14 rounded-2xl font-bold bg-gray-50" placeholder="Contoh: Budi & Andi" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold text-sm uppercase tracking-wide flex items-center gap-2">URL Foto Paslon <ImageIcon size={16} className="text-gray-400" /></Label>
                                    <Input type="url" value={kandidatForm.photo_url} onChange={(e) => setKandidatForm({ ...kandidatForm, photo_url: e.target.value })} className="h-14 rounded-2xl bg-gray-50" placeholder="https://contoh.com/foto-paslon.jpg" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold text-sm uppercase tracking-wide">Visi</Label>
                                    <textarea
                                        value={kandidatForm.visi}
                                        onChange={(e) => setKandidatForm({ ...kandidatForm, visi: e.target.value })}
                                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-base font-medium focus:ring-4 focus:ring-[#12b3d6]/10 focus:border-[#12b3d6] transition-all min-h-[100px]"
                                        placeholder="Tuliskan visi kandidat di sini..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold text-sm uppercase tracking-wide">Misi</Label>
                                    <textarea
                                        value={kandidatForm.misi}
                                        onChange={(e) => setKandidatForm({ ...kandidatForm, misi: e.target.value })}
                                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-base font-medium focus:ring-4 focus:ring-[#12b3d6]/10 focus:border-[#12b3d6] transition-all min-h-[140px]"
                                        placeholder="1. Misi pertama&#10;2. Misi kedua..."
                                    />
                                </div>

                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50">
                            <Button type="button" variant="outline" className="h-14 px-8 rounded-2xl font-bold text-gray-600 bg-white" onClick={() => setIsKandidatModalOpen(false)}>Batal</Button>
                            <Button type="submit" form="kandidat-form" disabled={isSubmitting} className="h-14 px-10 rounded-2xl bg-[#12b3d6] hover:bg-[#0fa0bf] shadow-xl shadow-cyan-200/60 font-black text-white text-base transition-all transform hover:-translate-y-1">
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Kandidat'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tambah DPT - DIPERBARUI */}
            {isDptModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                <div className="bg-gray-900 p-2 rounded-xl text-white"><UserPlus size={24} /></div>
                                Daftarkan Pemilih Baru
                            </h2>
                            <button onClick={() => setIsDptModalOpen(false)} className="text-gray-400 hover:text-gray-900 bg-white rounded-full p-2.5 border border-gray-200 shadow-sm transition-all"><X size={20} /></button>
                        </div>

                        <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <form id="dpt-form" onSubmit={handleAddDpt} className="space-y-6">

                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold text-sm uppercase tracking-wide">NIK / Identitas <span className="text-red-500">*</span></Label>
                                    <Input
                                        required
                                        minLength={16}
                                        maxLength={16}
                                        type="text"
                                        value={dptForm.nik}
                                        onChange={(e) => setDptForm({ ...dptForm, nik: e.target.value.replace(/\D/g, '') })}
                                        className="h-14 rounded-2xl font-mono text-lg font-black tracking-widest bg-gray-50"
                                        placeholder="16 DIGIT NIK"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold text-sm uppercase tracking-wide">Nama Lengkap <span className="text-red-500">*</span></Label>
                                    <Input required value={dptForm.nama} onChange={(e) => setDptForm({ ...dptForm, nama: e.target.value })} className="h-14 rounded-2xl font-bold bg-gray-50 text-lg" placeholder="Sesuai Kartu Identitas" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold text-sm uppercase tracking-wide">Nomor WhatsApp <span className="text-red-500">*</span></Label>
                                    <Input required type="text" value={dptForm.no_hp} maxLength={15} onChange={(e) => setDptForm({ ...dptForm, no_hp: e.target.value.replace(/\D/g, '') })} className="h-14 rounded-2xl font-bold bg-gray-50 text-lg" placeholder="08123456789" />
                                </div>

                                {/* LOGIKA KONDISIONAL BERDASARKAN PAKET LAYANAN */}
                                {pemilu?.transaction?.layanan?.is_face_recognition && (
                                    <div className="space-y-2 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                                        <Label className="text-gray-700 font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                                            <ScanFace size={16} className="text-blue-500"/> Data Wajah (Biometrik)
                                        </Label>
                                        <Input 
                                            type="text" 
                                            value={dptForm.face_template} 
                                            onChange={(e) => setDptForm({ ...dptForm, face_template: e.target.value })} 
                                            className="h-14 rounded-xl bg-white border-blue-200 text-sm font-mono placeholder:font-sans focus-visible:ring-blue-500" 
                                            placeholder="Masukkan Face Template (Base64/Array)..." 
                                        />
                                        <p className="text-xs text-blue-600/80 font-medium mt-1.5 flex items-center gap-1">
                                            <Info size={12} /> Fitur Face Recognition aktif untuk paket layanan acara ini.
                                        </p>
                                    </div>
                                )}

                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50">
                            <Button type="button" variant="outline" className="h-14 px-8 rounded-2xl font-bold text-gray-600 bg-white" onClick={() => setIsDptModalOpen(false)}>Batal</Button>
                            <Button type="submit" form="dpt-form" disabled={isSubmitting} className="h-14 px-10 rounded-2xl bg-gray-900 hover:bg-gray-800 shadow-xl shadow-gray-200 font-black text-white text-base transition-all transform hover:-translate-y-1">
                                {isSubmitting ? 'Menyimpan...' : 'Simpan DPT'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}