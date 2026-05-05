/* eslint-disable no-empty */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMasterData } from '@/hooks/useMasterData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, X, Fingerprint, MapPin, Info, ScanFace, Camera, CheckCircle2, Loader2, Edit3 } from 'lucide-react';
import { Badge } from '../ui/badge';
import * as faceapi from 'face-api.js';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    isSubmitting: boolean;
    pemilu: any;
    editData?: any;
}

const initialDptForm = {
    nik: '', nkk: '', nama: '', nama_penduduk: '', 
    tempat_lahir: '', jenis_kelamin: '', alamat: '', 
    rt: '', rw: '', kode_pro: '', nama_pro: '', 
    kode_kab: '', nama_kab: '', kode_kec: '', nama_kec: '', 
    kode_kel: '', nama_desa: '', status_kawin: '', 
    status_disabilitas: '', no_hp: '', face_images: [] as string[]
};

const REQUIRED_POSES = [
    { id: 'depan', label: 'Hadap Lurus Ke Depan' },
    { id: 'kanan', label: 'Tengok Arah Tangan Kanan' },
    { id: 'kiri', label: 'Tengok Arah Tangan Kiri' }
];

export function DptModal({ isOpen, onClose, onSubmit, isSubmitting, pemilu, editData }: Props) {
    const [form, setForm] = useState(initialDptForm);
    const { provinsi, kabupaten, kecamatan, kelurahan, statusKawin, getProvinsi, getKabupaten, getKecamatan, getKelurahan, getStatusKawin, clearWilayah } = useMasterData();

    const isFaceRecEnabled = pemilu?.transaction?.layanan?.is_face_recognition;
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [poseIndex, setPoseIndex] = useState(0);
    const [holdProgress, setHoldProgress] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const requestRef = useRef<number>(0);

    useEffect(() => {
        if (isOpen) {
            getProvinsi();
            getStatusKawin();
            if (editData) {
                setForm({
                    ...initialDptForm,
                    ...editData,
                    face_images: [] 
                });
                if (editData.kode_pro) getKabupaten(editData.kode_pro);
                if (editData.kode_kab) getKecamatan(editData.kode_kab);
                if (editData.kode_kec) getKelurahan(editData.kode_kec);
            } else {
                setForm(initialDptForm);
            }
        }
    }, [isOpen, editData, getProvinsi, getStatusKawin]);

    useEffect(() => {
        if (isOpen && isFaceRecEnabled) {
            const loadModels = async () => {
                const MODEL_URL = '/models'; 
                try {
                    await Promise.all([
                        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
                    ]);
                    setIsModelsLoaded(true);
                } catch (error) {
                }
            };
            loadModels();
        }
    }, [isOpen, isFaceRecEnabled]);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
        setIsScanning(false);
    }, []);

    useEffect(() => {
        if (!isOpen) stopCamera();
    }, [isOpen, stopCamera]);

    const captureCurrentFrame = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64Image = canvas.toDataURL('image/jpeg', 0.8);
            
            setForm(prev => {
                const newImages = [...prev.face_images, base64Image];
                if (newImages.length === 3) {
                    stopCamera(); 
                }
                return { ...prev, face_images: newImages };
            });

            setPoseIndex(prev => prev + 1);
        }
    }, [stopCamera]);

    const detectLivenessLoop = useCallback(async () => {
        if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
            requestRef.current = requestAnimationFrame(detectLivenessLoop);
            return;
        }

        const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();

        if (detection) {
            const landmarks = detection.landmarks;
            const nose = landmarks.getNose()[3]; 
            const jawLeft = landmarks.getJawOutline()[0]; 
            const jawRight = landmarks.getJawOutline()[16]; 

            const yaw = (nose.x - jawLeft.x) / (jawRight.x - jawLeft.x);

            let detectedPose = '';
            
            if (yaw < 0.45) detectedPose = 'kanan'; 
            else if (yaw > 0.55) detectedPose = 'kiri';
            else detectedPose = 'depan';

            setPoseIndex((currentIndex) => {
                const targetPose = REQUIRED_POSES[currentIndex]?.id;
                
                if (detectedPose === targetPose) {
                    setHoldProgress((prev) => {
                        const nextProgress = prev + 15;
                        if (nextProgress >= 100) {
                            captureCurrentFrame();
                            return 0; 
                        }
                        return nextProgress;
                    });
                } else {
                    setHoldProgress((prev) => (prev > 0 ? prev - 5 : 0)); 
                }
                return currentIndex;
            });
        } else {
            setHoldProgress((prev) => (prev > 0 ? prev - 10 : 0));
        }

        requestRef.current = requestAnimationFrame(detectLivenessLoop);
    }, [captureCurrentFrame]);

    const startCamera = async () => {
        setIsScanning(true);
        setPoseIndex(0);
        setHoldProgress(0);
        setForm(prev => ({ ...prev, face_images: [] }));

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            streamRef.current = stream;
            
            detectLivenessLoop();
        } catch (err) {
            setIsScanning(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isFaceRecEnabled && !editData && form.face_images.length < 3) {
            return;
        }

        await onSubmit(form);
        if (!editData) {
            setForm(initialDptForm);
        }
        setPoseIndex(0);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white shrink-0">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-3">
                        <div className="bg-gray-900 p-2 rounded-xl text-white">
                            {editData ? <Edit3 size={20} /> : <UserPlus size={20} />}
                        </div>
                        {editData ? 'Edit Data Pemilih' : 'Registrasi Pemilih Lengkap (DPT)'}
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
                                
                                {isFaceRecEnabled && (
                                    <div className="md:col-span-2 mt-4 border-2 border-dashed border-blue-200 bg-blue-50/50 p-6 rounded-2xl flex flex-col items-center">
                                        <div className="w-full flex items-center justify-between mb-4">
                                            <div>
                                                <h4 className="font-black text-blue-900 flex items-center gap-2"><ScanFace size={20}/> Pas Foto Wajah (Biometrik Liveness)</h4>
                                                <p className="text-xs text-blue-600 font-medium">{editData ? "Kosongkan jika tidak ingin mengubah biometrik wajah." : "Sistem merekam 3 sisi wajah untuk mencegah pemalsuan menggunakan foto/topeng."}</p>
                                            </div>
                                            {form.face_images.length === 3 && <Badge className="bg-green-100 text-green-700 border-none"><CheckCircle2 size={14} className="mr-1"/> Liveness Lengkap</Badge>}
                                        </div>

                                        {form.face_images.length === 3 ? (
                                            <div className="flex flex-col items-center gap-3 my-4 w-full">
                                                <div className="flex justify-center gap-4 mb-4">
                                                    {form.face_images.map((img, i) => (
                                                        <div key={i} className="w-20 h-20 rounded-full overflow-hidden border-4 border-green-500 shadow-md">
                                                            <img src={img} alt={`Pose ${i+1}`} className="w-full h-full object-cover scale-x-[-1]" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button type="button" variant="outline" onClick={() => setForm({...form, face_images: []})} className="text-sm border-gray-300">Ambil Ulang Liveness</Button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4 w-full">
                                                {!isModelsLoaded ? (
                                                    <div className="py-10 flex flex-col items-center text-blue-500">
                                                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                                        <span className="font-bold text-sm">Menyiapkan Liveness Engine...</span>
                                                    </div>
                                                ) : isScanning ? (
                                                    <div className="relative flex flex-col items-center">
                                                        <div className="mb-4 text-center">
                                                            <Badge className="bg-blue-600 text-white font-bold text-sm uppercase px-4 py-1 animate-pulse">
                                                                {REQUIRED_POSES[poseIndex]?.label}
                                                            </Badge>
                                                        </div>

                                                        <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-blue-600 overflow-hidden shadow-xl bg-black">
                                                            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                                                            <canvas ref={canvasRef} className="hidden" />
                                                            
                                                            <div 
                                                                className="absolute bottom-0 left-0 right-0 bg-green-500/70 transition-all duration-100"
                                                                style={{ height: `${holdProgress}%` }}
                                                            ></div>
                                                        </div>
                                                        
                                                        <div className="flex gap-3 mt-4">
                                                            {REQUIRED_POSES.map((_, i) => (
                                                                <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i < poseIndex ? 'bg-green-500 w-8' : i === poseIndex ? 'bg-blue-600 w-4 animate-pulse' : 'bg-blue-200 w-2'}`}></div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-48 h-48 md:w-64 md:h-64 bg-white rounded-full flex items-center justify-center text-gray-300 border-4 border-dashed border-gray-300 shadow-inner">
                                                        <Camera size={48} />
                                                    </div>
                                                )}

                                                <div className="flex gap-3 mt-4">
                                                    {isScanning ? (
                                                        <Button type="button" variant="outline" onClick={stopCamera} className="rounded-full px-8 font-bold bg-white text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">Batal Scan</Button>
                                                    ) : (
                                                        <Button type="button" onClick={startCamera} className="bg-slate-800 hover:bg-slate-700 rounded-full px-8 font-bold text-white shadow-lg">Mulai Liveness Scan</Button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-2 text-center max-w-sm">Arahkan wajah sesuai instruksi. Tahan posisi kepala Anda saat layar menghijau.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50 shrink-0 rounded-b-[2rem]">
                    <Button type="button" variant="outline" className="h-14 px-8 rounded-2xl font-bold text-gray-600 bg-white" onClick={onClose}>Batal</Button>
                    <Button type="submit" form="dpt-form" disabled={isSubmitting || (isFaceRecEnabled && !editData && form.face_images.length < 3)} className="h-14 px-10 rounded-2xl bg-gray-900 hover:bg-gray-800 shadow-xl shadow-gray-200 font-black text-white text-base transition-all transform hover:-translate-y-1">
                        {isSubmitting ? 'Menyimpan...' : 'Simpan DPT Lengkap'}
                    </Button>
                </div>
            </div>
        </div>
    );
}