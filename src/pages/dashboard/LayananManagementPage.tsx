/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useLayanan } from '@/hooks/useLayanan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Plus, Pencil, Trash2, X, Search, MoreVertical, ChevronLeft, ChevronRight, Filter, AlertTriangle, ScanFace } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const checkPermission = (menuName: string, action: string) => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return false;
  try {
    const user = JSON.parse(userStr);
    if (user.roles?.some((r: any) => r.name === 'Superadmin')) return true;
    for (const role of user.roles || []) {
      for (const perm of role.permissions || []) {
        if (perm.menu?.name === menuName && perm.action === action) {
          return true;
        }
      }
    }
  } catch (e) {
    return false;
  }
  return false;
};

const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

export default function LayananManagementPage() {
  const { layanans, meta, fetchLayanans, createLayanan, updateLayanan, deleteLayanan, isLoading } = useLayanan();
  
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [minDptInput, setMinDptInput] = useState('');
  const [activeMinDpt, setActiveMinDpt] = useState('');
  const [maxDptInput, setMaxDptInput] = useState('');
  const [activeMaxDpt, setActiveMaxDpt] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', limit_dpt: 0, price: 0, features: '', is_face_recognition: false, is_active: true });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canCreate = checkPermission("Manajemen Layanan", "create");
  const canUpdate = checkPermission("Manajemen Layanan", "update");
  const canDelete = checkPermission("Manajemen Layanan", "delete");
  const showActionsColumn = canUpdate || canDelete;

  useEffect(() => {
    fetchLayanans(currentPage, activeSearch, activeMinDpt, activeMaxDpt);
  }, [currentPage, activeSearch, activeMinDpt, activeMaxDpt, fetchLayanans]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
    setActiveMinDpt(minDptInput);
    setActiveMaxDpt(maxDptInput);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchInput('');
    setMinDptInput('');
    setMaxDptInput('');
    setActiveSearch('');
    setActiveMinDpt('');
    setActiveMaxDpt('');
    setCurrentPage(1);
  };

  const handleOpenModal = (layanan?: any) => {
    if (layanan) {
      setFormData({ 
        id: layanan.id.toString(), 
        name: layanan.name, 
        limit_dpt: layanan.limit_dpt, 
        price: layanan.price, 
        features: layanan.features || '', 
        is_face_recognition: layanan.is_face_recognition || false,
        is_active: layanan.is_active 
      });
    } else {
      setFormData({ id: '', name: '', limit_dpt: 0, price: 0, features: '', is_face_recognition: false, is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      limit_dpt: Number(formData.limit_dpt),
      price: Number(formData.price),
      features: formData.features,
      is_face_recognition: formData.is_face_recognition,
      is_active: formData.is_active
    };

    try {
      if (formData.id) {
        await updateLayanan(formData.id, payload);
      } else {
        await createLayanan(payload);
      }
      setIsModalOpen(false);
      fetchLayanans(currentPage, activeSearch, activeMinDpt, activeMaxDpt);
    } catch (error) {
      alert("Gagal menyimpan data layanan");
    }
  };

  const handleOpenDeleteModal = (layanan: any) => {
    setDeleteTarget({ id: layanan.id.toString(), name: layanan.name });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteLayanan(deleteTarget.id);
      fetchLayanans(currentPage, activeSearch, activeMinDpt, activeMaxDpt);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      alert("Gagal menghapus layanan");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const totalPages = meta.total_pages || 1;
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${
            meta.current_page === i 
              ? 'bg-[#12b3d6] text-white shadow-md shadow-cyan-200/50' 
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  const startItem = meta.total_items === 0 ? 0 : (meta.current_page - 1) * meta.limit + 1;
  const endItem = Math.min(meta.current_page * meta.limit, meta.total_items);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manajemen Layanan</h1>
          <p className="text-gray-500 mt-1">Atur paket e-voting, harga, dan kapasitas DPT untuk Client.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="relative group w-full sm:w-32">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                type="number"
                placeholder="Min DPT" 
                className="pl-9 pr-3 h-11 w-full rounded-xl border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#12b3d6]/20 focus:border-[#12b3d6] transition-all text-sm"
                value={minDptInput}
                onChange={(e) => setMinDptInput(e.target.value)}
              />
            </div>
            
            <div className="relative group w-full sm:w-32">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                type="number"
                placeholder="Max DPT" 
                className="pl-9 pr-3 h-11 w-full rounded-xl border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#12b3d6]/20 focus:border-[#12b3d6] transition-all text-sm"
                value={maxDptInput}
                onChange={(e) => setMaxDptInput(e.target.value)}
              />
            </div>

            <div className="relative group w-full sm:w-56">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#12b3d6] transition-colors" size={18} />
              <Input 
                placeholder="Cari nama paket..." 
                className="pl-10 pr-10 h-11 w-full rounded-xl border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#12b3d6]/20 focus:border-[#12b3d6] transition-all"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {(searchInput || minDptInput || maxDptInput) && (
                <button 
                  type="button" 
                  onClick={handleReset} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button type="submit" className="hidden">Submit</button>
          </form>

          {canCreate && (
            <Button onClick={() => handleOpenModal()} className="bg-[#12b3d6] hover:bg-[#0fa0bf] h-11 px-6 rounded-xl w-full sm:w-auto shadow-md shadow-cyan-200/50 shrink-0">
              <Plus size={18} className="mr-2" /> Tambah Paket
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader className="bg-gray-50/80">
                <TableRow className="hover:bg-transparent border-b border-gray-100">
                  <TableHead className="py-4 px-6 font-semibold text-gray-600">Nama Paket</TableHead>
                  <TableHead className="font-semibold text-gray-600">Harga</TableHead>
                  <TableHead className="font-semibold text-gray-600">Limit DPT</TableHead>
                  <TableHead className="font-semibold text-gray-600">Status</TableHead>
                  {showActionsColumn && (
                    <TableHead className="text-right px-6 font-semibold text-gray-600">Aksi</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={showActionsColumn ? 5 : 4} className="h-32 text-center">
                      <div className="flex justify-center items-center gap-3 text-gray-500">
                        <div className="w-5 h-5 border-2 border-[#12b3d6] border-t-transparent rounded-full animate-spin"></div>
                        Memuat data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : layanans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={showActionsColumn ? 5 : 4} className="h-32 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Package size={32} className="text-gray-300 mb-2" />
                        Tidak ada paket layanan ditemukan.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  layanans.map((layanan) => (
                    <TableRow key={layanan.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                      <TableCell className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 flex items-center gap-2">
                            {layanan.name}
                            {layanan.is_face_recognition && (
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-2 rounded">Face Recog</Badge>
                            )}
                          </span>
                          <span className="text-xs text-gray-500 truncate max-w-[200px] mt-1">{layanan.features || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-[#12b3d6]">{formatRupiah(layanan.price)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-700 font-bold">
                          {layanan.limit_dpt.toLocaleString('id-ID')} Pemilih
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {layanan.is_active ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-2.5 py-0.5 rounded-md">Tersedia</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-200 border-none px-2.5 py-0.5 rounded-md">Nonaktif</Badge>
                        )}
                      </TableCell>
                      {showActionsColumn && (
                        <TableCell className="text-right px-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 h-8 w-8 rounded-lg">
                                <MoreVertical size={18} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-gray-100 p-1">
                              {canUpdate && (
                                <DropdownMenuItem className="cursor-pointer p-2.5 rounded-lg font-medium hover:bg-cyan-50 hover:text-[#12b3d6]" onClick={() => handleOpenModal(layanan)}>
                                  <Pencil size={16} className="mr-2" /> Edit Paket
                                </DropdownMenuItem>
                              )}
                              {canDelete && (
                                <DropdownMenuItem 
                                  className="cursor-pointer p-2.5 rounded-lg font-medium text-red-600 focus:bg-red-50 focus:text-red-700" 
                                  onClick={() => handleOpenDeleteModal(layanan)}
                                >
                                  <Trash2 size={16} className="mr-2" /> Hapus Paket
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm gap-4">
          <div className="text-sm text-gray-500 text-center sm:text-left">
            Menampilkan <span className="font-bold text-gray-900">{startItem}</span> hingga <span className="font-bold text-gray-900">{endItem}</span> dari <span className="font-bold text-gray-900">{meta.total_items}</span> paket
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 px-3 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
              disabled={meta.current_page <= 1 || isLoading} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
              <ChevronLeft size={16} className="mr-1" /> Prev
            </Button>
            <div className="flex items-center gap-1.5 px-2 hidden sm:flex">{renderPaginationButtons()}</div>
            <Button variant="outline" size="sm" className="h-9 px-3 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
              disabled={meta.current_page >= meta.total_pages || isLoading} onClick={() => setCurrentPage(prev => Math.min(prev + 1, meta.total_pages))}>
              Next <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="text-[#12b3d6]" size={20}/>
                {formData.id ? 'Edit Paket Layanan' : 'Tambah Paket Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="layanan-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-gray-700">Nama Paket</Label>
                  <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-11 rounded-xl" placeholder="Contoh: Paket RT/RW" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Limit DPT (Orang)</Label>
                    <Input type="number" min="1" required value={formData.limit_dpt || ''} onChange={(e) => setFormData({...formData, limit_dpt: Number(e.target.value)})} className="h-11 rounded-xl" placeholder="Contoh: 500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Harga (Rp)</Label>
                    <Input type="number" min="0" required value={formData.price || ''} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="h-11 rounded-xl" placeholder="Contoh: 150000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Fitur (Deskripsi)</Label>
                  <Input value={formData.features} onChange={(e) => setFormData({...formData, features: e.target.value})} className="h-11 rounded-xl" placeholder="Contoh: Support 24/7, Ekspor Excel" />
                </div>

                {/* Penambahan Grid untuk Toggle Fitur Ekstra */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div className="flex items-start gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                        <input 
                            type="checkbox" id="is_face_recognition" className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            checked={formData.is_face_recognition} onChange={(e) => setFormData({...formData, is_face_recognition: e.target.checked})}
                        />
                        <div className="flex flex-col">
                            <Label htmlFor="is_face_recognition" className="cursor-pointer font-bold text-gray-800 flex items-center gap-1">
                                <ScanFace size={16} className="text-blue-600"/> Face Recog
                            </Label>
                            <p className="text-xs text-gray-500 mt-1">Aktifkan verifikasi wajah & biometrik pemilih.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <input 
                            type="checkbox" id="is_active" className="mt-1 w-5 h-5 text-[#12b3d6] rounded border-gray-300 focus:ring-[#12b3d6]"
                            checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        />
                        <div className="flex flex-col">
                            <Label htmlFor="is_active" className="cursor-pointer font-bold text-gray-800">Status Aktif</Label>
                            <p className="text-xs text-gray-500 mt-1">Munculkan di katalog Client.</p>
                        </div>
                    </div>
                </div>

              </form>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-3xl">
              <Button type="button" variant="outline" className="h-11 px-6 rounded-xl" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button type="submit" form="layanan-form" className="h-11 px-6 rounded-xl bg-[#12b3d6] hover:bg-[#0fa0bf] shadow-md shadow-cyan-200/50">Simpan Paket</Button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} />
                Hapus Paket Layanan
              </h2>
              <button 
                onClick={() => { setIsDeleteModalOpen(false); setDeleteTarget(null); }} 
                className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                Apakah Anda yakin ingin menghapus paket layanan berikut?
              </p>
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                  <Package size={18} className="text-red-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{deleteTarget.name}</p>
                  <p className="text-xs text-red-500 mt-0.5">Data yang dihapus tidak dapat dikembalikan.</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-3xl">
              <Button 
                type="button" 
                variant="outline" 
                className="h-11 px-6 rounded-xl" 
                onClick={() => { setIsDeleteModalOpen(false); setDeleteTarget(null); }}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button 
                type="button"
                className="h-11 px-6 rounded-xl bg-red-500 hover:bg-red-600 shadow-md shadow-red-200/50 text-white"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Menghapus...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Trash2 size={16} />
                    Ya, Hapus Paket
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}