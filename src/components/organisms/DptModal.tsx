/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useMasterData } from '@/hooks/useMasterData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, X, Fingerprint, MapPin, Info, ScanFace } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    isSubmitting: boolean;
    pemilu: any;
}

const initialDptForm = {
    nik: '', nkk: '', nama: '', nama_penduduk: '', 
    tempat_lahir: '', jenis_kelamin: '', alamat: '', 
    rt: '', rw: '', kode_pro: '', nama_pro: '', 
    kode_kab: '', nama_kab: '', kode_kec: '', nama_kec: '', 
    kode_kel: '', nama_desa: '', status_kawin: '', 
    status_disabilitas: '', no_hp: '', face_template: ''
};

export function DptModal({ isOpen, onClose, onSubmit, isSubmitting, pemilu }: Props) {
    const [form, setForm] = useState(initialDptForm);
    const { provinsi, kabupaten, kecamatan, kelurahan, statusKawin, getProvinsi, getKabupaten, getKecamatan, getKelurahan, getStatusKawin, clearWilayah } = useMasterData();

    useEffect(() => {
        if (isOpen) {
            getProvinsi();
            getStatusKawin();
        }
    }, [isOpen, getProvinsi, getStatusKawin]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(form);
        setForm(initialDptForm);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white shrink-0">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-3">
                        <div className="bg-gray-900 p-2 rounded-xl text-white"><UserPlus size={20} /></div>
                        Registrasi Pemilih Lengkap (DPT)
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 bg-white rounded-full p-2.5 border border-gray-200 shadow-sm transition-all"><X size={20} /></button>
                </div>

                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
                    <form id="dpt-form" onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                                <Fingerprint className="text-[#12b3d6]" size={20} /> Data Identitas Utama
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold text-xs uppercase tracking-wide">NIK <span className="text-red-500">*</span></Label>
                                    <Input required minLength={16} maxLength={16} value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value.replace(/\D/g, '') })} className="h-12 rounded-xl font-mono text-sm tracking-widest bg-gray-50" placeholder="16 Digit NIK" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold text-xs uppercase tracking-wide">No. KK (NKK)</Label>
                                    <Input maxLength={16} value={form.nkk} onChange={(e) => setForm({ ...form, nkk: e.target.value.replace(/\D/g, '') })} className="h-12 rounded-xl font-mono text-sm tracking-widest bg-gray-50" placeholder="16 Digit NKK" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold text-xs uppercase tracking-wide">Nama Lengkap Sesuai KTP <span className="text-red-500">*</span></Label>
                                    <Input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="h-12 rounded-xl font-bold bg-gray-50" placeholder="Mochammad Fulan" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold text-xs uppercase tracking-wide">Nama Penduduk (Alias/Panggilan)</Label>
                                    <Input value={form.nama_penduduk} onChange={(e) => setForm({ ...form, nama_penduduk: e.target.value })} className="h-12 rounded-xl bg-gray-50" placeholder="Fulan" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold text-xs uppercase tracking-wide">Tempat Lahir</Label>
                                    <Input value={form.tempat_lahir} onChange={(e) => setForm({ ...form, tempat_lahir: e.target.value })} className="h-12 rounded-xl bg-gray-50" placeholder="Jakarta" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold text-xs uppercase tracking-wide">Jenis Kelamin</Label>
                                    <select value={form.jenis_kelamin} onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })} className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-3 outline-none text-sm font-medium">
                                        <option value="">Pilih...</option>
                                        <option value="Laki-Laki">Laki-Laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-gray-700 font-bold text-xs uppercase tracking-wide">Nomor WhatsApp (Aktif) <span className="text-red-500">*</span></Label>
                                    <Input required maxLength={15} value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value.replace(/\D/g, '') })} className="h-12 rounded-xl font-bold bg-gray-50" placeholder="08123456789" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                                <MapPin className="text-[#12b3d6]" size={20} /> Domisili & Wilayah Administratif
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                                <div className="space-y-2 md:col-span-4">
                                    <Label className="text-gray-700 font-bold text-xs uppercase tracking-wide">Jalan / Alamat Lengkap</Label>
                                    <Input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} className="h-12 rounded-xl bg-gray-50" placeholder="Jl. Merdeka No. 10" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-gray-700 font-bold text-xs uppercase tracking-wide">RT</Label>
                                    <Input maxLength={5} value={form.rt} onChange={(e) => setForm({ ...form, rt: e.target.value })} className="h-12 rounded-xl bg-gray-50" placeholder="001" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-gray-700 font-bold text-xs uppercase tracking-wide">RW</Label>
                                    <Input maxLength={5} value={form.rw} onChange={(e) => setForm({ ...form, rw: e.target.value })} className="h-12 rounded-xl bg-gray-50" placeholder="002" />
                                </div>
                                
                                <div className="space-y-2 md:col-span-1">
                                    <Label className="text-gray-700 font-bold text-xs uppercase tracking-wide">Provinsi</Label>
                                    <select
                                        value={form.kode_pro}
                                        onChange={(e) => {
                                            const selected = provinsi.find((p: any) => p.id === e.target.value);
                                            setForm({
                                                ...form, kode_pro: selected?.id || '', nama_pro: selected?.name || '',
                                                kode_kab: '', nama_kab: '', kode_kec: '', nama_kec: '', kode_kel: '', nama_desa: ''
                                            });
                                            clearWilayah('kabupaten');
                                            if (selected) getKabupaten(selected.id);
                                        }}
                                        className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-3 outline-none text-sm font-medium"
                                    >
                                        <option value="">Pilih Provinsi</option>
                                        {provinsi.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2 md:col-span-1">
                                    <Label className="text-gray-700 font-bold text-xs uppercase tracking-wide">Kab/Kota</Label>
                                    <select
                                        disabled={!form.kode_pro}
                                        value={form.kode_kab}
                                        onChange={(e) => {
                                            const selected = kabupaten.find((p: any) => p.id === e.target.value);
                                            setForm({
                                                ...form, kode_kab: selected?.id || '', nama_kab: selected?.name || '',
                                                kode_kec: '', nama_kec: '', kode_kel: '', nama_desa: ''
                                            });
                                            clearWilayah('kecamatan');
                                            if (selected) getKecamatan(selected.id);
                                        }}
                                        className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-3 outline-none text-sm font-medium disabled:opacity-50"
                                    >
                                        <option value="">Pilih Kab/Kota</option>
                                        {kabupaten.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2 md:col-span-1">
                                    <Label className="text-gray-700 font-bold text-xs uppercase tracking-wide">Kecamatan</Label>
                                    <select
                                        disabled={!form.kode_kab}
                                        value={form.kode_kec}
                                        onChange={(e) => {
                                            const selected = kecamatan.find((p: any) => p.id === e.target.value);
                                            setForm({
                                                ...form, kode_kec: selected?.id || '', nama_kec: selected?.name || '',
                                                kode_kel: '', nama_desa: ''
                                            });
                                            clearWilayah('kelurahan');
                                            if (selected) getKelurahan(selected.id);
                                        }}
                                        className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-3 outline-none text-sm font-medium disabled:opacity-50"
                                    >
                                        <option value="">Pilih Kecamatan</option>
                                        {kecamatan.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2 md:col-span-1">
                                    <Label className="text-gray-700 font-bold text-xs uppercase tracking-wide">Kel/Desa</Label>
                                    <select
                                        disabled={!form.kode_kec}
                                        value={form.kode_kel}
                                        onChange={(e) => {
                                            const selected = kelurahan.find((p: any) => p.id === e.target.value);
                                            setForm({...form, kode_kel: selected?.id || '', nama_desa: selected?.name || ''});
                                        }}
                                        className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-3 outline-none text-sm font-medium disabled:opacity-50"
                                    >
                                        <option value="">Pilih Desa</option>
                                        {kelurahan.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                                <Info className="text-[#12b3d6]" size={20} /> Data Status & Sistem
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold text-xs uppercase tracking-wide">Status Perkawinan</Label>
                                    <select 
                                        value={form.status_kawin} 
                                        onChange={(e) => setForm({ ...form, status_kawin: e.target.value })} 
                                        className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-3 outline-none text-sm font-medium"
                                    >
                                        <option value="">Pilih...</option>
                                        {statusKawin.map((s: any) => <option key={s.id} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold text-xs uppercase tracking-wide">Status Disabilitas</Label>
                                    <Input value={form.status_disabilitas} onChange={(e) => setForm({ ...form, status_disabilitas: e.target.value })} className="h-12 rounded-xl bg-gray-50" placeholder="Normal / Jenis Disabilitas" />
                                </div>
                                
                                {pemilu?.transaction?.layanan?.is_face_recognition && (
                                    <div className="space-y-2 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl md:col-span-2">
                                        <Label className="text-gray-700 font-bold text-xs uppercase tracking-wide flex items-center gap-2">
                                            <ScanFace size={16} className="text-blue-500"/> Face Template (Biometrik Wajah)
                                        </Label>
                                        <Input 
                                            type="text" 
                                            value={form.face_template} 
                                            onChange={(e) => setForm({ ...form, face_template: e.target.value })} 
                                            className="h-12 rounded-xl bg-white border-blue-200 text-sm font-mono placeholder:font-sans focus-visible:ring-blue-500" 
                                            placeholder="Array Descriptor / Hash Base64..." 
                                        />
                                        <p className="text-xs text-blue-600/80 font-medium mt-1.5 flex items-center gap-1">
                                            <Info size={12} /> Diperlukan karena Face Recognition aktif untuk acara ini.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50 shrink-0 rounded-b-[2rem]">
                    <Button type="button" variant="outline" className="h-14 px-8 rounded-2xl font-bold text-gray-600 bg-white" onClick={onClose}>Batal</Button>
                    <Button type="submit" form="dpt-form" disabled={isSubmitting} className="h-14 px-10 rounded-2xl bg-gray-900 hover:bg-gray-800 shadow-xl shadow-gray-200 font-black text-white text-base transition-all transform hover:-translate-y-1">
                        {isSubmitting ? 'Menyimpan...' : 'Simpan DPT Lengkap'}
                    </Button>
                </div>
            </div>
        </div>
    );
}