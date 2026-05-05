/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/immutability */
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useVote } from "../hooks/useVote";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, ScanFace, CheckCircle2, ShieldAlert, Loader2, Info, AlertTriangle } from 'lucide-react';

export default function VotePage() {
  const { user_uuid } = useParams<{ user_uuid: string }>();
  const { data, loading, error, isSubmitting, getVoterAuth, verifyFace, submitVote } = useVote();
  
  const [selectedKandidat, setSelectedKandidat] = useState<number | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isFaceVerified, setIsFaceVerified] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const assetBaseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

  useEffect(() => {
    if (user_uuid) {
      getVoterAuth(user_uuid);
    }
  }, [user_uuid, getVoterAuth]);

  useEffect(() => {
    if (data && data.require_face_verification && !isFaceVerified && !isSuccess) {
      startCamera();
    }
    return () => stopCamera();
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

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);

    stopCamera();
    
    try {
      await verifyFace(user_uuid, base64Image);
      setIsFaceVerified(true);
    } catch (err: any) {
      setVerifyError(err.message || "Verifikasi biometrik gagal. Silakan coba lagi.");
    }
  };

  const handleVoteClick = () => {
    if (selectedKandidat === null) return;
    setIsConfirmOpen(true);
  };

  const confirmVote = async () => {
    try {
      const kandidatId = selectedKandidat === 0 ? null : selectedKandidat;
      await submitVote(user_uuid!, kandidatId);
      setIsConfirmOpen(false);
      setIsSuccess(true);
    } catch (err: any) {
      setIsConfirmOpen(false);
    }
  };

  const getSelectedName = () => {
    if (selectedKandidat === 0) return "Abstain (Tidak Memilih)";
    const kandidat = data?.kandidat.find(k => k.id === selectedKandidat);
    return kandidat ? `${kandidat.no_urut}. ${kandidat.name}` : "";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative flex items-center justify-center">
            <div className="absolute w-24 h-24 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute w-24 h-24 border-4 border-[#12b3d6] rounded-full border-t-transparent animate-spin"></div>
            <ShieldAlert className="w-8 h-8 text-[#12b3d6]" />
        </div>
        <div className="mt-8 text-xl font-bold text-slate-700 tracking-wide animate-pulse">Menyiapkan Sesi Aman...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-lg w-full border-0 shadow-2xl rounded-[2rem] overflow-hidden">
          <div className="bg-red-500 h-3 w-full"></div>
          <CardContent className="p-10 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-3">Akses Ditolak</h2>
            <p className="text-slate-600 leading-relaxed">{error || "Tautan yang Anda gunakan tidak valid atau kadaluarsa."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-lg w-full border-0 shadow-2xl rounded-[2rem] overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="bg-emerald-500 h-3 w-full"></div>
          <CardContent className="p-10 text-center">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-3">Terima Kasih!</h2>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">Suara Anda telah dienkripsi dan berhasil dicatat ke dalam sistem dengan aman.</p>
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 space-y-4 text-left">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Pilihan Anda</p>
                <p className="text-xl font-black text-emerald-900">{getSelectedName()}</p>
              </div>
              <div className="pt-4 border-t border-emerald-200/50">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Status Pemilihan</p>
                <p className="text-lg font-black text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={20} /> Selesai
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (data.require_face_verification && !isFaceVerified) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in duration-700">
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 border border-slate-700 mb-2">
                <ScanFace className="w-10 h-10 text-[#12b3d6]" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-wide">Biometrik Wajah</h1>
            <p className="text-slate-400 text-sm leading-relaxed px-4">Sistem enterprise membutuhkan verifikasi wajah secara real-time untuk memastikan integritas suara Anda.</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-700/50 shadow-2xl">
             {isSubmitting ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-6">
                   <div className="relative">
                       <Loader2 className="w-16 h-16 text-[#12b3d6] animate-spin" />
                       <div className="absolute inset-0 border-4 border-[#12b3d6]/30 rounded-full animate-ping"></div>
                   </div>
                   <p className="font-bold text-[#12b3d6] tracking-widest text-sm uppercase">Memvalidasi Wajah...</p>
                </div>
             ) : (
                <>
                  <div className="relative w-56 h-56 md:w-64 md:h-64 mx-auto rounded-full overflow-hidden border-[6px] border-slate-700 shadow-2xl bg-slate-900">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                      <canvas ref={canvasRef} className="hidden" />
                      
                      {isCameraActive && (
                          <div className="absolute inset-0 pointer-events-none">
                              <div className="w-full h-1 bg-[#12b3d6]/50 shadow-[0_0_15px_#12b3d6] animate-[scan_2s_ease-in-out_infinite]"></div>
                          </div>
                      )}

                      {!isCameraActive && !verifyError && (
                          <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                              <Camera size={48} strokeWidth={1.5} />
                          </div>
                      )}
                  </div>
                  
                  {verifyError && (
                      <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-left">
                          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                          <p className="text-red-400 text-sm font-medium leading-relaxed">{verifyError}</p>
                      </div>
                  )}

                  <div className="mt-8">
                      {!isCameraActive ? (
                          <Button onClick={startCamera} className="w-full h-14 rounded-2xl font-bold bg-white text-slate-900 hover:bg-slate-200 transition-colors">
                              Nyalakan Kamera
                          </Button>
                      ) : (
                          <Button onClick={handleVerifyFace} className="w-full h-14 rounded-2xl font-black bg-[#12b3d6] hover:bg-[#0ea0bf] text-white tracking-widest uppercase shadow-[0_0_20px_rgba(18,179,214,0.3)] transition-all hover:scale-[1.02]">
                              Validasi Sekarang
                          </Button>
                      )}
                  </div>
                </>
             )}
          </div>
        </div>
        <style>{`
          @keyframes scan {
            0% { transform: translateY(0); }
            50% { transform: translateY(256px); }
            100% { transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-32">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm/50 backdrop-blur-xl bg-white/80">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="bg-[#12b3d6] p-2 rounded-xl text-white">
                      <ShieldAlert size={20} />
                  </div>
                  <div>
                      <h2 className="font-black text-sm uppercase tracking-wider text-slate-900 leading-none">E-Voting</h2>
                      <p className="text-xs text-slate-500 font-medium">Enterprise System</p>
                  </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold px-3 py-1 shadow-sm">
                  <CheckCircle2 size={14} className="mr-1.5"/> Sesi Aman
              </Badge>
          </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-10 md:pt-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">{data.acara.title}</h1>
          <p className="text-slate-500 text-lg md:text-xl">Selamat datang, <span className="font-bold text-slate-800">{data.pemilih.nama}</span>. Silakan tentukan hak suara Anda dengan memilih salah satu kandidat di bawah ini.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {data.kandidat.map((k) => (
            <Card 
              key={k.id}
              onClick={() => setSelectedKandidat(k.id)}
              className={`group cursor-pointer transition-all duration-300 border-2 rounded-[2rem] overflow-hidden ${
                selectedKandidat === k.id 
                  ? "border-[#12b3d6] bg-cyan-50/30 shadow-[0_20px_40px_-15px_rgba(18,179,214,0.2)] transform -translate-y-2" 
                  : "border-slate-200/60 bg-white hover:border-[#12b3d6]/40 hover:shadow-xl hover:-translate-y-1"
              }`}
            >
              <CardContent className="p-0 flex flex-col h-full relative">
                {selectedKandidat === k.id && (
                    <div className="absolute top-5 right-5 z-20 bg-[#12b3d6] rounded-full p-1.5 text-white shadow-lg animate-in zoom-in duration-200">
                        <CheckCircle2 size={24} strokeWidth={3} />
                    </div>
                )}
                
                <div className="h-64 relative overflow-hidden bg-slate-100">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent z-10 mix-blend-multiply"></div>
                  {k.photo_url ? (
                    <img src={`${assetBaseUrl}${k.photo_url}`} alt={k.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Camera size={64} strokeWidth={1} /></div>
                  )}
                  <div className="absolute bottom-6 left-6 z-20">
                      <Badge className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border-none text-xs font-black tracking-widest px-3 py-1.5 rounded-lg mb-3">
                          KANDIDAT {k.no_urut}
                      </Badge>
                      <h3 className="text-2xl font-black text-white leading-tight drop-shadow-md">{k.name}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card 
            onClick={() => setSelectedKandidat(0)}
            className={`group cursor-pointer transition-all duration-300 border-2 rounded-[2rem] flex items-center justify-center min-h-[256px] ${
              selectedKandidat === 0 
                ? "border-slate-800 bg-slate-800 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] transform -translate-y-2" 
                : "border-slate-200/60 bg-white hover:border-slate-400 hover:shadow-xl hover:-translate-y-1"
            }`}
          >
            <CardContent className="p-8 text-center space-y-4 relative w-full h-full flex flex-col items-center justify-center">
               {selectedKandidat === 0 && (
                    <div className="absolute top-5 right-5 z-20 bg-white rounded-full p-1.5 text-slate-800 shadow-lg animate-in zoom-in duration-200">
                        <CheckCircle2 size={24} strokeWidth={3} />
                    </div>
               )}
               <div className={`p-4 rounded-full transition-colors duration-300 ${selectedKandidat === 0 ? 'bg-slate-700' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                   <ShieldAlert className={`w-10 h-10 ${selectedKandidat === 0 ? 'text-white' : 'text-slate-500'}`} />
               </div>
               <div>
                   <h3 className={`text-xl font-black transition-colors ${selectedKandidat === 0 ? 'text-white' : 'text-slate-700'}`}>Abstain</h3>
                   <p className={`text-sm font-medium mt-1 ${selectedKandidat === 0 ? 'text-slate-300' : 'text-slate-500'}`}>Tidak memilih kandidat manapun</p>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className={`fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white/80 backdrop-blur-xl border-t border-slate-200/60 transition-transform duration-500 z-40 ${selectedKandidat !== null ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="hidden sm:block">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Pilihan Saat Ini</p>
                  <p className="text-xl font-black text-slate-900">{getSelectedName()}</p>
              </div>
              <Button 
                onClick={handleVoteClick}
                className="w-full sm:w-auto h-14 px-12 text-lg font-black bg-[#12b3d6] hover:bg-[#0ea0bf] text-white shadow-[0_10px_20px_-10px_rgba(18,179,214,0.5)] rounded-2xl tracking-widest uppercase transition-all hover:scale-105"
              >
                Kunci Pilihan
              </Button>
          </div>
      </div>

      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                <Info className="w-10 h-10 text-[#12b3d6]" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Konfirmasi Pilihan</h3>
                <p className="text-slate-600 mb-6">Apakah Anda yakin dengan pilihan ini? Hak suara hanya dapat digunakan satu kali dan tidak dapat diubah.</p>
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Kandidat Pilihan</p>
                    <p className="text-xl font-black text-[#12b3d6]">{getSelectedName()}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 h-12 rounded-xl font-bold text-slate-600 hover:bg-slate-100 border-slate-200"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button 
                className="flex-1 h-12 rounded-xl font-black bg-slate-900 hover:bg-slate-800 text-white shadow-lg"
                onClick={confirmVote}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    "Yakin & Kirim"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}