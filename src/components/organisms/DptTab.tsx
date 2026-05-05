/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserPlus, ScanFace, MapPin, Pencil, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { DptModal } from './DptModal';

interface Props {
    dpts: any[];
    pemilu: any;
    onOpenModal: () => void;
    onUpdateDpt: (id: string, data: any) => Promise<void>;
    onDeleteDpt: (id: string) => Promise<void>;
}

export function DptTab({ dpts, pemilu, onOpenModal, onUpdateDpt, onDeleteDpt }: Props) {
    const [editData, setEditData] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEditClick = (dpt: any) => {
        setEditData(dpt);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await onDeleteDpt(deleteId);
            setDeleteId(null);
        } catch (error) {
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await onUpdateDpt(editData.id, data);
            setIsEditModalOpen(false);
            setEditData(null);
        } catch (error) {
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-gray-200 pb-4 mb-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Daftar Pemilih Tetap (DPT)</h2>
                    <p className="text-gray-500 mt-1 font-medium">Total <span className="font-bold text-gray-900">{dpts.length}</span> pemilih telah terdaftar dan siap memberikan suara.</p>
                </div>
                {pemilu.status !== 'selesai' && (
                    <Button onClick={onOpenModal} className="bg-gray-900 hover:bg-gray-800 rounded-full h-12 px-8 shadow-lg text-white text-base transition-transform hover:scale-105">
                        <UserPlus size={20} className="mr-2" /> Daftarkan Pemilih Lengkap
                    </Button>
                )}
            </div>

            {dpts.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm animate-in fade-in zoom-in-95 duration-500">
                    <Users size={64} className="mx-auto text-gray-200 mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900">Belum Ada Pemilih</h3>
                    <p className="text-gray-500 font-medium mt-2">Daftarkan pemilih agar mereka bisa login dan melakukan voting.</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-x-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Table className="min-w-[1100px]">
                        <TableHeader className="bg-gray-50/80">
                            <TableRow className="border-b border-gray-100 hover:bg-transparent">
                                <TableHead className="font-extrabold text-gray-900 py-5 px-6">Identitas (NIK/NKK)</TableHead>
                                <TableHead className="font-extrabold text-gray-900">Data Diri & Kontak</TableHead>
                                <TableHead className="font-extrabold text-gray-900">Domisili Lengkap</TableHead>
                                <TableHead className="font-extrabold text-gray-900">Info Tambahan</TableHead>
                                <TableHead className="font-extrabold text-gray-900">Status</TableHead>
                                <TableHead className="font-extrabold text-gray-900 text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dpts.map((d) => (
                                <TableRow key={d.id} className="hover:bg-slate-50 border-b border-gray-50 transition-colors group">
                                    <TableCell className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-mono text-sm text-gray-900 font-bold tracking-wider">{d.nik}</span>
                                            {d.nkk && <span className="font-mono text-xs text-gray-400 tracking-wider">KK: {d.nkk}</span>}
                                            {d.face_template && (
                                                <Badge variant="outline" className="w-fit mt-1 border-[#12b3d6]/30 text-[#12b3d6] bg-[#12b3d6]/10">
                                                    <ScanFace size={12} className="mr-1" /> Biometrik
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-sm">
                                            <span className="font-black text-gray-900 text-base">{d.nama} {d.nama_penduduk && <span className="text-gray-400 font-normal">({d.nama_penduduk})</span>}</span>
                                            <span className="text-gray-500">{d.jenis_kelamin || '-'}</span>
                                            <span className="text-[#12b3d6] font-medium">{d.no_hp}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-xs text-gray-600">
                                            <span className="font-semibold text-gray-800 flex items-start gap-1">
                                                <MapPin size={14} className="shrink-0 mt-0.5 text-gray-400"/>
                                                {d.alamat || '-'} {d.rt && d.rw ? `RT ${d.rt}/RW ${d.rw}` : ''}
                                            </span>
                                            {d.nama_desa && d.nama_kec && <span>Kel/Desa {d.nama_desa}, Kec. {d.nama_kec}</span>}
                                            {d.nama_kab && d.nama_pro && <span>{d.nama_kab}, {d.nama_pro}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-xs text-gray-600">
                                            <span><span className="font-medium text-gray-800">Lahir:</span> {d.tempat_lahir || '-'}</span>
                                            <span><span className="font-medium text-gray-800">Status:</span> {d.status_kawin || '-'}</span>
                                            {d.status_disabilitas && <span><span className="font-medium text-red-500">Disabilitas:</span> {d.status_disabilitas}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {d.status_voted ?
                                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-3 py-1">Sudah Memilih</Badge> :
                                            <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-bold px-3 py-1">Belum Memilih</Badge>
                                        }
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                className="h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-[#12b3d6] hover:bg-[#12b3d6]/10 hover:border-[#12b3d6]/30 transition-all"
                                                onClick={() => handleEditClick(d)}
                                            >
                                                <Pencil size={16} />
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                className="h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"
                                                onClick={() => handleDeleteClick(d.id)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <DptModal 
                isOpen={isEditModalOpen} 
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditData(null);
                }} 
                onSubmit={handleEditSubmit} 
                isSubmitting={isSubmitting} 
                pemilu={pemilu}
                editData={editData}
            />

            {deleteId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                                <AlertTriangle className="w-10 h-10 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">Hapus DPT?</h3>
                                <p className="text-slate-600 leading-relaxed">Data pemilih ini akan dihapus secara permanen dari sistem dan tidak dapat dikembalikan.</p>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <Button 
                                variant="outline" 
                                className="flex-1 h-12 rounded-xl font-bold text-slate-600 hover:bg-slate-100 border-slate-200"
                                onClick={() => setDeleteId(null)}
                                disabled={isDeleting}
                            >
                                Batal
                            </Button>
                            <Button 
                                className="flex-1 h-12 rounded-xl font-black bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200"
                                onClick={confirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ya, Hapus"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}