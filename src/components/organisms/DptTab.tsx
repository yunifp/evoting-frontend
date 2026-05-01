/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserPlus, ScanFace, MapPin } from 'lucide-react';

interface Props {
    dpts: any[];
    pemilu: any;
    onOpenModal: () => void;
}

export function DptTab({ dpts, pemilu, onOpenModal }: Props) {
    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-gray-200 pb-4 mb-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Daftar Pemilih Tetap (DPT)</h2>
                    <p className="text-gray-500 mt-1 font-medium">Total <span className="font-bold text-gray-900">{dpts.length}</span> pemilih telah terdaftar dan siap memberikan suara.</p>
                </div>
                {pemilu.status !== 'selesai' && (
                    <Button onClick={onOpenModal} className="bg-gray-900 hover:bg-gray-800 rounded-full h-12 px-8 shadow-lg text-white text-base">
                        <UserPlus size={20} className="mr-2" /> Daftarkan Pemilih Lengkap
                    </Button>
                )}
            </div>

            {dpts.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <Users size={64} className="mx-auto text-gray-200 mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900">Belum Ada Pemilih</h3>
                    <p className="text-gray-500 font-medium mt-2">Daftarkan pemilih agar mereka bisa login dan melakukan voting.</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-x-auto">
                    <Table className="min-w-[1000px]">
                        <TableHeader className="bg-gray-50/80">
                            <TableRow className="border-b border-gray-100 hover:bg-transparent">
                                <TableHead className="font-extrabold text-gray-900 py-5 px-6">Identitas (NIK/NKK)</TableHead>
                                <TableHead className="font-extrabold text-gray-900">Data Diri & Kontak</TableHead>
                                <TableHead className="font-extrabold text-gray-900">Domisili Lengkap</TableHead>
                                <TableHead className="font-extrabold text-gray-900">Info Tambahan</TableHead>
                                <TableHead className="font-extrabold text-gray-900">Status Voting</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dpts.map((d) => (
                                <TableRow key={d.id} className="hover:bg-gray-50/50 border-b border-gray-50 transition-colors group">
                                    <TableCell className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-mono text-sm text-gray-900 font-bold tracking-wider">{d.nik}</span>
                                            {d.nkk && <span className="font-mono text-xs text-gray-400 tracking-wider">KK: {d.nkk}</span>}
                                            {d.face_template && (
                                                <Badge variant="outline" className="w-fit mt-1 border-blue-200 text-blue-600 bg-blue-50/50">
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
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </>
    );
}