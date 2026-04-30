/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePemilu } from '@/hooks/usePemilu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from "@/components/ui/badge";
import { Vote, Plus, Calendar, Clock, X, ArrowRight, Settings2, MoreVertical, Pencil, Trash2, AlertTriangle, Package } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(dateString));
};

const formatForInput = (dateStr: string) => {
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function ClientPemiluPage() {
  const navigate = useNavigate();
  const { pemilus, getMyPemilus, getAvailablePackages, createPemilu, updatePemilu, deletePemilu, isLoading } = usePemilu();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPemilu, setSelectedPemilu] = useState<any>(null);

  // STATE BARU: Menyimpan daftar paket tersedia
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);

  // TAMBAHAN: transactionId pada formData
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    transactionId: ''
  });

  useEffect(() => {
    getMyPemilus();
  }, [getMyPemilus]);

  const handleOpenCreateModal = async () => {
    setIsEditMode(false);
    setSelectedPemilu(null);
    setFormData({ title: '', startDate: '', endDate: '', transactionId: '' });

    // Tarik data paket yang tersedia saat modal dibuka
    const pkgs = await getAvailablePackages();
    setAvailablePackages(pkgs);

    // Pilih otomatis paket pertama jika ada
    if (pkgs && pkgs.length > 0) {
      setFormData(prev => ({ ...prev, transactionId: pkgs[0].id }));
    }

    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pemilu: any) => {
    setIsEditMode(true);
    setSelectedPemilu(pemilu);
    setFormData({
      title: pemilu.title,
      startDate: formatForInput(pemilu.start_date),
      endDate: formatForInput(pemilu.end_date),
      transactionId: '' // Saat edit tidak perlu memilih paket lagi
    });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (pemilu: any) => {
    setSelectedPemilu(pemilu);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditMode && selectedPemilu) {
        await updatePemilu(selectedPemilu.id, {
          title: formData.title,
          start_date: formData.startDate.replace('T', ' ') + ':00',
          end_date: formData.endDate.replace('T', ' ') + ':00'
        });
      } else {
        if (!formData.transactionId) {
          throw new Error("Anda harus memilih Paket Layanan.");
        }
        await createPemilu({
          transaction_id: formData.transactionId,
          title: formData.title,
          start_date: formData.startDate.replace('T', ' ') + ':00',
          end_date: formData.endDate.replace('T', ' ') + ':00'
        });
      }

      setIsModalOpen(false);
      setFormData({ title: '', startDate: '', endDate: '', transactionId: '' });
      getMyPemilus();
    } catch (error: any) {
      alert(error.response?.data?.error || "Gagal menyimpan acara Pemilu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedPemilu) return;
    setIsSubmitting(true);
    try {
      await deletePemilu(selectedPemilu.id);
      setIsDeleteModalOpen(false);
      setSelectedPemilu(null);
      getMyPemilus();
    } catch (error: any) {
      alert(error.response?.data?.error || "Gagal menghapus acara.");
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
          onClick={handleOpenCreateModal}
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
          <Button onClick={handleOpenCreateModal} className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-11 px-6">
            Buat Sekarang
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pemilus.map((pemilu: any) => (
            <div key={pemilu.id} className="group bg-white border-2 border-gray-100 hover:border-[#12b3d6]/30 rounded-3xl p-6 flex flex-col justify-between shadow-soft hover:shadow-xl transition-all duration-300">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center shrink-0">
                    <Vote className="text-[#12b3d6] h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    {pemilu.status === 'draft' ? (
                      <Badge className="bg-gray-100 text-gray-600 border-none font-bold">Draft</Badge>
                    ) : pemilu.status === 'active' ? (
                      <Badge className="bg-green-100 text-green-700 border-none font-bold">Aktif Berjalan</Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-700 border-none font-bold">Selesai</Badge>
                    )}

                    {pemilu.status === 'draft' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-900 rounded-xl h-8 w-8 -mr-2">
                            <MoreVertical size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-gray-100 p-1">
                          <DropdownMenuItem onClick={() => handleOpenEditModal(pemilu)} className="cursor-pointer p-2.5 rounded-lg font-medium hover:bg-cyan-50 hover:text-[#12b3d6]">
                            <Pencil size={16} className="mr-2" /> Edit Acara
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDeleteModal(pemilu)} className="cursor-pointer p-2.5 rounded-lg font-medium text-red-600 focus:bg-red-50 focus:text-red-700">
                            <Trash2 size={16} className="mr-2" /> Hapus Acara
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
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
                <Vote className="text-[#12b3d6]" size={24} />
                {isEditMode ? 'Edit Acara Pemilu' : 'Buat Acara Pemilu'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-2.5 border border-gray-200 shadow-sm"><X size={18} /></button>
            </div>

            <div className="p-8">
              <form id="pemilu-form" onSubmit={handleSubmit} className="space-y-5">

                {/* SELECT PAKET: HANYA TAMPIL SAAT CREATE (BUKAN EDIT) */}
                {!isEditMode && (
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-semibold flex items-center gap-2">
                      <Package size={16} className="text-[#12b3d6]" />
                      Pilih Paket Layanan
                    </Label>
                    {availablePackages.length > 0 ? (
                      <select
                        required
                        value={formData.transactionId}
                        onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                        className="w-full h-12 rounded-xl border border-gray-200 bg-white px-3 focus:ring-2 focus:ring-[#12b3d6]/20 focus:border-[#12b3d6] outline-none transition-all font-medium text-gray-700"
                      >
                        <option value="" disabled>Pilih paket yang telah dibayar...</option>
                        {availablePackages.map((pkg: any) => {
                          // Cek JSON di Network Tab. Jika Backend mengirim "layanan", pakai pkg.layanan.
                          // Jika Backend mengirim "Layanan", pakai pkg.Layanan.
                          const infoLayanan = pkg.layanan || pkg.Layanan;

                          return (
                            <option key={pkg.id} value={pkg.id}>
                              {infoLayanan ? (
                                `${infoLayanan.name} - ${infoLayanan.limit_dpt} DPT ${infoLayanan.is_face_recognition ? '(Face Recog)' : ''}`
                              ) : (
                                `Paket Terbeli (${pkg.id.substring(0, 8)}...)`
                              )}
                            </option>
                          );
                        })}
                      </select>
                    ) : (
                      <div className="h-12 w-full rounded-xl bg-red-50 border border-red-100 flex items-center px-3">
                        <span className="text-sm font-bold text-red-600">Tidak ada paket tersedia! Silakan beli paket terlebih dahulu.</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">Nama Acara</Label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="h-12 rounded-xl block"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">Waktu Selesai (Bilik Suara Tutup)</Label>
                  <Input
                    required
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
                disabled={isSubmitting || (!isEditMode && availablePackages.length === 0)}
                className="h-12 px-8 rounded-xl bg-[#12b3d6] hover:bg-[#0fa0bf] shadow-md shadow-cyan-200/50 font-bold disabled:opacity-50"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Acara'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedPemilu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} />
                Hapus Acara Pemilu
              </h2>
              <button
                onClick={() => { setIsDeleteModalOpen(false); setSelectedPemilu(null); }}
                className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                Apakah Anda yakin ingin menghapus acara ini? Paket layanan yang digunakan akan dikembalikan dan bisa dipakai lagi.
              </p>
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                  <Vote size={18} className="text-red-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 line-clamp-1">{selectedPemilu.title}</p>
                  <p className="text-xs text-red-500 mt-0.5">Seluruh data kandidat dan DPT akan terhapus.</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-3xl">
              <Button
                type="button"
                variant="outline"
                className="h-11 px-6 rounded-xl"
                onClick={() => { setIsDeleteModalOpen(false); setSelectedPemilu(null); }}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="button"
                className="h-11 px-6 rounded-xl bg-red-500 hover:bg-red-600 shadow-md shadow-red-200/50 text-white"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus Acara'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}