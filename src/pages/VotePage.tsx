/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useVote } from "../hooks/useVote";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, ScanFace, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';

export default function VotePage() {
  const { user_uuid } = useParams<{ user_uuid: string }>();
  const { data, loading, error, isSubmitting, getVoterAuth, verifyFace, submitVote } = useVote();
  
  const [selectedKandidat, setSelectedKandidat] = useState<number | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // State untuk alur login (Verifikasi Wajah)
  const [isFaceVerified, setIsFaceVerified] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (user_uuid) {
      getVoterAuth(user_uuid);
    }
  }, [user_uuid, getVoterAuth]);

  // Autostart kamera saat membuka halaman jika face verification required
  useEffect(() => {
    if (data && data.require_face_verification && !isFaceVerified && !isSuccess) {
      startCamera();
    }
    return () => stopCamera(); // Cleanup
  }, [data, isFaceVerified, isSuccess]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setIsCameraActive(true);
      setVerifyError(null);
    } catch (err) {
      setVerifyError("Sistem memerlukan akses kamera Anda untuk melanjutkan proses pemilihan.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleVerifyFace = async () => {
    if (!videoRef.current || !canvasRef.current || !user_uuid) return;

    // Menangkap frame video 
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    
    // Konversi gambar ke base64 (format JPEG standar)
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);

    stopCamera();
    
    // Kirim base64 ke backend untuk diverifikasi
    try {
      await verifyFace(user_uuid, base64Image);
      setIsFaceVerified(true);
    } catch (err: any) {
      setVerifyError(err.message || "Verifikasi biometrik gagal. Silakan coba lagi.");
    }
  };

  const handleSubmit = async () => {
    if (selectedKandidat === null) {
      alert("Silakan pilih kandidat terlebih dahulu!");
      return;
    }

    if (!window.confirm("Apakah Anda yakin dengan pilihan ini? Suara tidak dapat diubah setelah dikirim.")) {
      return;
    }

    try {
      const kandidatId = selectedKandidat === 0 ? null : selectedKandidat;
      await submitVote(user_uuid!, kandidatId);
      setIsSuccess(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- RENDER MEMUAT DATA ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-[#12b3d6] animate-spin mb-4" />
        <div className="text-lg font-medium text-slate-600">Menghubungkan ke sistem...</div>
      </div>
    );
  }

  // --- RENDER ERROR / TIDAK VALID ---
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full border-t-4 border-t-red-500 shadow-lg">
          <CardContent className="pt-6 text-center">
            <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Akses Terkunci</h2>
            <p className="text-slate-600">{error || "Tautan yang Anda gunakan tidak valid."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- RENDER SUKSES ---
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full border-t-4 border-t-green-500 shadow-lg">
          <CardContent className="pt-8 pb-6 text-center">
            <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-slate-800 mb-2">Terima Kasih!</h2>
            <p className="text-slate-600 text-lg">Anda telah berpartisipasi. Suara Anda telah berhasil dicatat dengan aman.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- RENDER LOGIN KAMERA (Verifikasi Wajah) ---
  if (data.require_face_verification && !isFaceVerified) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-white space-y-2">
            <ScanFace className="w-12 h-12 text-[#12b3d6] mx-auto" />
            <h1 className="text-2xl font-black uppercase tracking-wider">Keamanan Biometrik</h1>
            <p className="text-slate-400 text-sm">Sistem membutuhkan konfirmasi wajah Anda untuk mencegah pemalsuan identitas.</p>
          </div>

          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 relative overflow-hidden shadow-2xl">
             {isSubmitting ? (
                <div className="h-64 flex flex-col items-center justify-center text-[#12b3d6]">
                   <Loader2 className="w-16 h-16 animate-spin mb-4" />
                   <p className="font-bold animate-pulse text-lg">Menganalisis Pola Wajah...</p>
                </div>
             ) : (
                <>
                  <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto rounded-full overflow-hidden border-4 border-[#12b3d6] shadow-2xl">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                      <canvas ref={canvasRef} className="hidden" />
                      {!isCameraActive && !verifyError && (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-500"><Camera size={40}/></div>
                      )}
                  </div>
                  
                  {verifyError && (
                      <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm font-medium">
                          {verifyError}
                      </div>
                  )}

                  <div className="mt-8">
                      {!isCameraActive ? (
                          <Button onClick={startCamera} className="w-full h-14 rounded-xl font-bold bg-[#12b3d6] hover:bg-[#0fa0bf] text-white">Nyalakan Ulang Kamera</Button>
                      ) : (
                          <Button onClick={handleVerifyFace} className="w-full h-14 rounded-xl font-black bg-[#12b3d6] hover:bg-[#0fa0bf] text-white tracking-widest uppercase">
                              Mulai Verifikasi
                          </Button>
                      )}
                  </div>
                </>
             )}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER SURAT SUARA DIGITAL ---
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:py-12">
      <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-700">
        
        <div className="text-center space-y-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <Badge className="bg-blue-100 text-blue-700 border-none font-bold mb-2 uppercase tracking-widest px-4 py-1">E-Voting Terverifikasi</Badge>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">{data.acara.title}</h1>
          <p className="text-slate-500 mt-2 text-lg">Hai, <span className="font-bold text-slate-800">{data.pemilih.nama}</span>. Tentukan pilihan Anda di bawah ini.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {data.kandidat.map((k) => (
            <Card 
              key={k.id}
              onClick={() => setSelectedKandidat(k.id)}
              className={`cursor-pointer transition-all duration-300 border-2 overflow-hidden ${
                selectedKandidat === k.id 
                  ? "border-[#12b3d6] bg-cyan-50/50 shadow-xl shadow-cyan-100/50 transform scale-[1.02]" 
                  : "border-slate-200 hover:border-[#12b3d6]/50 hover:shadow-md"
              }`}
            >
              <CardContent className="p-0 flex flex-col h-full relative">
                {selectedKandidat === k.id && (
                    <div className="absolute top-4 right-4 z-10 bg-white rounded-full p-1 text-[#12b3d6] shadow-md">
                        <CheckCircle2 size={24} className="fill-current" />
                    </div>
                )}
                <div className="h-48 md:h-64 bg-slate-100 relative overflow-hidden">
                  {k.photo_url ? (
                    <img src={`http://localhost:8080${k.photo_url}`} alt={k.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Camera size={48}/></div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <span className="bg-[#12b3d6] text-white text-xs font-black px-3 py-1 rounded-lg">KANDIDAT {k.no_urut}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-black text-slate-800 leading-tight">{k.name}</h3>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card 
            onClick={() => setSelectedKandidat(0)}
            className={`cursor-pointer transition-all duration-300 border-2 flex items-center justify-center min-h-[200px] ${
              selectedKandidat === 0 
                ? "border-slate-800 bg-slate-100 shadow-xl transform scale-[1.02]" 
                : "border-slate-200 hover:border-slate-400"
            }`}
          >
            <CardContent className="p-6 text-center space-y-3 relative w-full h-full flex flex-col items-center justify-center">
               {selectedKandidat === 0 && (
                    <div className="absolute top-4 right-4 z-10 bg-white rounded-full p-1 text-slate-800 shadow-md">
                        <CheckCircle2 size={24} className="fill-current" />
                    </div>
               )}
               <ShieldAlert className={`w-12 h-12 mx-auto ${selectedKandidat === 0 ? 'text-slate-800' : 'text-slate-400'}`} />
               <h3 className="text-xl font-black text-slate-600">Saya Memilih Abstain</h3>
            </CardContent>
          </Card>
        </div>

        <div className="sticky bottom-4 z-50 pt-6">
          <Button 
            onClick={handleSubmit}
            disabled={selectedKandidat === null || isSubmitting}
            className="w-full py-8 text-xl font-black bg-gray-900 hover:bg-gray-800 text-white shadow-2xl transition-all rounded-2xl border border-gray-700"
          >
            {isSubmitting ? "MENYIMPAN DATA..." : "KUNCI PILIHAN SAYA SEKARANG"}
          </Button>
        </div>

      </div>
    </div>
  );
}