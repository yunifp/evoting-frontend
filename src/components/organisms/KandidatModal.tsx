/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Vote, X, Image as ImageIcon, UploadCloud } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormData, id?: number) => Promise<void>; 
    isSubmitting: boolean;
    initialData?: any | null; 
}

export function KandidatModal({ isOpen, onClose, onSubmit, isSubmitting, initialData }: Props) {
    const [form, setForm] = useState({ no_urut: '', name: '', visi: '', misi: '' });
    const [photo, setPhoto] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mengisi form otomatis jika ada initialData (Mode Edit)
    useEffect(() => {
        if (isOpen && initialData) {
            setForm({
                no_urut: initialData.no_urut?.toString() || '',
                name: initialData.name || '',
                visi: initialData.visi || '',
                misi: initialData.misi || ''
            });

            if (initialData.photo_url) {
                const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
                setPreviewUrl(`${baseUrl}${initialData.photo_url}`);
            }
        } else if (isOpen && !initialData) {
            setForm({ no_urut: '', name: '', visi: '', misi: '' });
            setPhoto(null);
            setPreviewUrl(null);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(file);
            setPreviewUrl(URL.createObjectURL(file)); 
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('no_urut', form.no_urut);
        formData.append('name', form.name);
        formData.append('visi', form.visi);
        formData.append('misi', form.misi);
        
        if (photo) {
            formData.append('photo', photo);
        }

        // Kirim ID ke Halaman Utama jika sedang dalam mode edit
        await onSubmit(formData, initialData?.id);
    };

    const isEditMode = !!initialData;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white shrink-0">
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        <div className="bg-[#12b3d6]/10 p-2 rounded-xl text-[#12b3d6]"><Vote size={24} /></div>
                        {isEditMode ? 'Edit Pasangan Calon' : 'Daftarkan Pasangan Calon'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 bg-white rounded-full p-2.5 border border-gray-200 shadow-sm transition-all"><X size={20} /></button>
                </div>

                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                    <form id="kandidat-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-4 gap-6">
                            <div className="space-y-2 col-span-1">
                                <Label className="text-gray-700 font-bold text-sm uppercase tracking-wide">No Urut <span className="text-red-500">*</span></Label>
                                <Input required type="number" min="1" value={form.no_urut} onChange={(e) => setForm({ ...form, no_urut: e.target.value })} className="h-14 rounded-2xl text-center text-xl font-black bg-gray-50" placeholder="1" />
                            </div>
                            <div className="space-y-2 col-span-3">
                                <Label className="text-gray-700 font-bold text-sm uppercase tracking-wide">Nama Lengkap Paslon <span className="text-red-500">*</span></Label>
                                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-14 rounded-2xl font-bold bg-gray-50" placeholder="Contoh: Budi & Andi" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-700 font-bold text-sm uppercase tracking-wide flex items-center gap-2">Upload Foto Paslon <ImageIcon size={16} className="text-gray-400" /></Label>
                            
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-[#12b3d6] transition-all relative overflow-hidden group"
                            >
                                <Input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                />
                                {previewUrl ? (
                                    <>
                                        <img src={previewUrl} alt="Preview" className="h-full w-full object-contain" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <span className="text-white font-bold flex items-center gap-2"><UploadCloud size={18}/> Ganti Foto</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center text-gray-400">
                                        <UploadCloud size={32} className="mb-2 group-hover:text-[#12b3d6] transition-colors" />
                                        <span className="text-sm font-medium group-hover:text-[#12b3d6]">Klik untuk memilih foto dari laptop</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-700 font-bold text-sm uppercase tracking-wide">Visi</Label>
                            <textarea value={form.visi} onChange={(e) => setForm({ ...form, visi: e.target.value })} className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-base font-medium focus:ring-4 focus:ring-[#12b3d6]/10 focus:border-[#12b3d6] transition-all min-h-[100px]" placeholder="Tuliskan visi kandidat di sini..." />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-bold text-sm uppercase tracking-wide">Misi</Label>
                            <textarea value={form.misi} onChange={(e) => setForm({ ...form, misi: e.target.value })} className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-base font-medium focus:ring-4 focus:ring-[#12b3d6]/10 focus:border-[#12b3d6] transition-all min-h-[140px]" placeholder="1. Misi pertama&#10;2. Misi kedua..." />
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50 shrink-0 rounded-b-[2rem]">
                    <Button type="button" variant="outline" className="h-14 px-8 rounded-2xl font-bold text-gray-600 bg-white" onClick={onClose}>Batal</Button>
                    <Button type="submit" form="kandidat-form" disabled={isSubmitting} className="h-14 px-10 rounded-2xl bg-[#12b3d6] hover:bg-[#0fa0bf] shadow-xl shadow-cyan-200/60 font-black text-white text-base transition-all transform hover:-translate-y-1">
                        {isSubmitting ? 'Menyimpan...' : (isEditMode ? 'Update Kandidat' : 'Simpan Kandidat')}
                    </Button>
                </div>
            </div>
        </div>
    );
}