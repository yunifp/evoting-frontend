/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useRBAC } from '@/hooks/useRBAC';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Plus, Pencil, Trash2, X, Search, Filter, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function PermissionManagementPage() {
  // Ambil fungsi terkait permissions & menus dari hook
  const { 
    permissionsPaginated, permissionMeta, fetchPermissions, savePermission, deletePermission,
    menus, fetchMenus, isLoading 
  } = useRBAC();
  
  // State Pagination & Search & Filter
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [menuFilter, setMenuFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', action: '', menu_id: '' });

  useEffect(() => {
    // Tarik permissions
    fetchPermissions(currentPage, activeSearch, menuFilter);
  }, [currentPage, activeSearch, menuFilter, fetchPermissions]);

  useEffect(() => {
    // Tarik daftar menu untuk Dropdown Filter & Dropdown Modal Form (Limit besar agar semua menu terambil)
    fetchMenus(1, '', 200);
  }, [fetchMenus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
    setCurrentPage(1);
  };

  const handleMenuFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMenuFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleOpenModal = (perm?: any) => {
    if (perm) {
      setFormData({ id: perm.id.toString(), name: perm.name, action: perm.action, menu_id: perm.menu_id.toString() });
    } else {
      setFormData({ id: '', name: '', action: '', menu_id: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.menu_id) {
      alert("Pilih menu terlebih dahulu!");
      return;
    }
    
    const payload = {
      name: formData.name,
      action: formData.action.toLowerCase(), // Pastikan action lowercase (e.g., 'create', 'read')
      menu_id: Number(formData.menu_id)
    };
    
    const success = await savePermission(payload, formData.id, currentPage, activeSearch, menuFilter);
    if (success) setIsModalOpen(false);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const totalPages = permissionMeta.total_pages || 1;
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${
            permissionMeta.current_page === i 
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

  const startItem = permissionMeta.total_items === 0 ? 0 : (permissionMeta.current_page - 1) * permissionMeta.limit + 1;
  const endItem = Math.min(permissionMeta.current_page * permissionMeta.limit, permissionMeta.total_items);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manajemen Hak Akses</h1>
          <p className="text-gray-500 mt-1">Buat spesifikasi tindakan (Create, Read, dsb) untuk setiap menu di sistem.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Filter Dropdown Menu */}
          <div className="relative group w-full sm:w-48">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              className="w-full h-11 pl-10 pr-10 appearance-none bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#12b3d6]/20 focus:border-[#12b3d6] cursor-pointer transition-all"
              value={menuFilter}
              onChange={handleMenuFilterChange}
            >
              <option value="">Semua Menu</option>
              {menus.map((m: any) => (
                <option key={m.id} value={m.id.toString()}>{m.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative group w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#12b3d6] transition-colors" size={18} />
            <Input 
              placeholder="Cari nama akses..." 
              className="pl-10 pr-10 h-11 w-full rounded-xl border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#12b3d6]/20 focus:border-[#12b3d6] transition-all"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(''); setActiveSearch(''); setCurrentPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-1">
                <X size={16} />
              </button>
            )}
          </form>

          <Button onClick={() => handleOpenModal()} className="bg-[#12b3d6] hover:bg-[#0fa0bf] h-11 px-6 rounded-xl w-full sm:w-auto shadow-md shadow-cyan-200/50">
            <Plus size={18} className="mr-2" /> Tambah Akses
          </Button>
        </div>
      </div>

      {/* Area Tabel & Pagination */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader className="bg-gray-50/80">
                <TableRow className="hover:bg-transparent border-b border-gray-100">
                  <TableHead className="py-4 px-6 font-semibold text-gray-600">Nama Hak Akses</TableHead>
                  <TableHead className="font-semibold text-gray-600">Kode Aksi (Action)</TableHead>
                  <TableHead className="font-semibold text-gray-600">Terkait Menu</TableHead>
                  <TableHead className="text-right px-6 font-semibold text-gray-600">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center">
                      <div className="flex justify-center items-center gap-3 text-gray-500">
                        <div className="w-5 h-5 border-2 border-[#12b3d6] border-t-transparent rounded-full animate-spin"></div>
                        Memuat data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : permissionsPaginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-gray-500">
                       <div className="flex flex-col items-center justify-center">
                        <KeyRound size={32} className="text-gray-300 mb-2" />
                        Tidak ada hak akses ditemukan.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  permissionsPaginated.map((perm) => (
                    <TableRow key={perm.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                      <TableCell className="py-4 px-6 font-bold text-gray-900">
                        {perm.name}
                      </TableCell>
                      <TableCell>
                        <code className="px-2 py-1 bg-cyan-50 text-[#12b3d6] rounded text-xs border border-cyan-100 font-bold uppercase tracking-wider">
                          {perm.action}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-600">
                          {perm.menu?.name || 'Menu Terhapus'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 h-8 w-8 rounded-lg">
                              <MoreVertical size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-gray-100 p-1">
                            <DropdownMenuItem className="cursor-pointer p-2.5 rounded-lg font-medium hover:bg-cyan-50 hover:text-[#12b3d6]" onClick={() => handleOpenModal(perm)}>
                              <Pencil size={16} className="mr-2" /> Edit Hak Akses
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer p-2.5 rounded-lg font-medium text-red-600 focus:bg-red-50 focus:text-red-700" 
                              onClick={() => deletePermission(perm.id, currentPage, activeSearch, menuFilter)}
                            >
                              <Trash2 size={16} className="mr-2" /> Hapus Akses
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Navigasi Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm gap-4">
          <div className="text-sm text-gray-500 text-center sm:text-left">
            Menampilkan <span className="font-bold text-gray-900">{startItem}</span> hingga <span className="font-bold text-gray-900">{endItem}</span> dari <span className="font-bold text-gray-900">{permissionMeta.total_items}</span> akses
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 px-3 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
              disabled={permissionMeta.current_page <= 1 || isLoading} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
              <ChevronLeft size={16} className="mr-1" /> Prev
            </Button>
            <div className="flex items-center gap-1.5 px-2 hidden sm:flex">{renderPaginationButtons()}</div>
            <Button variant="outline" size="sm" className="h-9 px-3 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
              disabled={permissionMeta.current_page >= permissionMeta.total_pages || isLoading} onClick={() => setCurrentPage(prev => Math.min(prev + 1, permissionMeta.total_pages))}>
              Next <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Form Permission */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <KeyRound className="text-[#12b3d6]" size={20}/>
                {formData.id ? 'Edit Hak Akses' : 'Tambah Akses Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div className="space-y-2">
                <Label className="text-gray-700">Terkait Menu</Label>
                <div className="relative">
                  <select
                    required
                    className="w-full h-11 px-4 appearance-none bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#12b3d6]/20 focus:border-[#12b3d6] cursor-pointer"
                    value={formData.menu_id}
                    onChange={(e) => setFormData({...formData, menu_id: e.target.value})}
                  >
                    <option value="" disabled>-- Pilih Menu --</option>
                    {menus.map((m: any) => (
                      <option key={m.id} value={m.id.toString()}>{m.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Nama Penjelasan Hak Akses</Label>
                <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-11 rounded-xl" placeholder="Contoh: Ekspor Data ke Excel" />
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-700 flex justify-between">
                  Kode Aksi (Action)
                  <span className="text-xs text-gray-400 font-normal">Wajib Bahasa Inggris & Tanpa Spasi</span>
                </Label>
                <Input required value={formData.action} onChange={(e) => setFormData({...formData, action: e.target.value.replace(/\s+/g, '_')})} className="h-11 rounded-xl font-mono text-sm" placeholder="Contoh: read, create, export_excel" />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-50 mt-2">
                <Button type="button" variant="outline" className="h-11 px-6 rounded-xl" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" className="h-11 px-6 rounded-xl bg-[#12b3d6] hover:bg-[#0fa0bf] shadow-md shadow-cyan-200">Simpan Akses</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}