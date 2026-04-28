/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- INI YANG BIKIN BISA PINDAH HALAMAN
import { usePemilu } from '@/hooks/usePemilu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from "@/components/ui/badge";
import { Vote, Plus, Calendar, Clock, X, ArrowRight, Settings2 } from 'lucide-react';

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(dateString));
};

export default function ClientPemiluPage() {
  const navigate = useNavigate(); // <-- INISIALISASI NAVIGASI
  const { pemilus, getMyPemilus, createPemilu, isLoading } = usePemilu();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    getMyPemilus();
  }, [getMyPemilus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createPemilu({
        title: formData.title,
        start_date: formData.startDate.replace('T', ' ') + ':00',
        end_date: formData.endDate.replace('T', ' ') + ':00'
      });
      setIsModalOpen(false);
      setFormData({ title: '', startDate: '', endDate: '' });
      getMyPemilus();
    } catch (error: any) {
      alert(error.response?.data?.error || "Gagal membuat acara Pemilu. Pastikan Anda memiliki paket aktif.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Manajemen Pemilu</h1>
          <p className="text-gray-500 mt-2 text-base md:text-lg max-w-xl">
            Buat dan kelola acara pemilihan Anda. Atur jadwal bilik suara dan pantau status pelaksanaannya di sini.
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#12b3d6] hover:bg-[#0fa0bf] shadow-lg shadow-cyan-200/50 rounded-xl font-bold text-sm h-12 px-6 transition-all hover:-translate-y-1 shrink-0"
        >
          <Plus size={18} className="mr-2" /> Buat Acara Baru
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-gray-100 shadow-soft">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#12b3d6] rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Memuat data acara...</p>
        </div>
      ) : pemilus.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-gray-100 shadow-soft text-center px-6">
          <div className="w-24 h-24 bg-cyan-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-cyan-100">
            <Vote size={48} className="text-[#12b3d6]" />
          </div>
          <h3 className="font-extrabold text-gray-900 text-2xl mb-2">Belum Ada Acara Pemilu</h3>
          <p className="text-gray-500 text-base max-w-md mb-6">Anda belum membuat acara pemilihan. Klik tombol di atas untuk memulai acara pertama Anda.</p>
          <Button onClick={() => setIsModalOpen(true)} className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-11 px-6">
            Buat Sekarang
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pemilus.map((pemilu) => (
            <div key={pemilu.id} className="group bg-white border-2 border-gray-100 hover:border-[#12b3d6]/30 rounded-3xl p-6 flex flex-col justify-between shadow-soft hover:shadow-xl transition-all duration-300">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center shrink-0">
                    <Vote className="text-[#12b3d6] h-6 w-6" />
                  </div>
                  {pemilu.status === 'draft' ? (
                    <Badge className="bg-gray-100 text-gray-600 border-none font-bold">Draft</Badge>
                  ) : pemilu.status === 'active' ? (
                    <Badge className="bg-green-100 text-green-700 border-none font-bold">Aktif Berjalan</Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-700 border-none font-bold">Selesai</Badge>
                  )}
                </div>
                
                <h3 className="font-extrabold text-xl text-gray-900 line-clamp-2 leading-tight mb-4">
                  {pemilu.title}
                </h3>
                
                <div className="space-y-3 mb-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Mulai</span>
                      <span className="text-sm font-medium text-gray-700">{formatDate(pemilu.start_date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Selesai</span>
                      <span className="text-sm font-medium text-gray-700">{formatDate(pemilu.end_date)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DI SINI LETAK PERBAIKANNYA (onClick pindah halaman) */}
              <div className="flex gap-3">
                <Button 
                  onClick={() => navigate(`/dashboard/pemilu/${pemilu.id}`)}
                  variant="outline" 
                  className="flex-1 rounded-xl border-gray-200 text-gray-600 h-11 hover:bg-gray-50"
                >
                  <Settings2 size={16} className="mr-2" /> Kelola
                </Button>
                <Button 
                  onClick={() => navigate(`/dashboard/pemilu/${pemilu.id}`)}
                  className="w-11 h-11 p-0 rounded-xl bg-gray-900 hover:bg-gray-800 text-white shrink-0"
                >
                  <ArrowRight size={18} />
                </Button>
              </div>

            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Vote className="text-[#12b3d6]" size={24}/>
                Buat Acara Pemilu
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-2.5 border border-gray-200 shadow-sm"><X size={18} /></button>
            </div>
            
            <div className="p-8">
              <form id="pemilu-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">Nama Acara</Label>
                  <Input 
                    required 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    className="h-12 rounded-xl" 
                    placeholder="Contoh: Pemilihan Presiden BEM 2026" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">Waktu Mulai (Bilik Suara Buka)</Label>
                  <Input 
                    required 
                    type="datetime-local"
                    value={formData.startDate} 
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                    className="h-12 rounded-xl block" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">Waktu Selesai (Bilik Suara Tutup)</Label>
                  <Input 
                    required 
                    type="datetime-local"
                    value={formData.endDate} 
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
                    className="h-12 rounded-xl block" 
                  />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50">
              <Button type="button" variant="outline" className="h-12 px-6 rounded-xl font-medium" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button 
                type="submit" 
                form="pemilu-form" 
                disabled={isSubmitting}
                className="h-12 px-8 rounded-xl bg-[#12b3d6] hover:bg-[#0fa0bf] shadow-md shadow-cyan-200/50 font-bold"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Acara'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}