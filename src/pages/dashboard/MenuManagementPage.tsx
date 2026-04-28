/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { useRBAC } from '@/hooks/useRBAC';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ListTree, Plus, Pencil, Trash2, X, Search, MoreVertical, ChevronLeft, ChevronRight, LayoutTemplate } from 'lucide-react';
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

export default function MenuManagementPage() {
  const { menus, menuMeta, fetchMenus, saveMenu, deleteMenu, isLoading } = useRBAC();
  
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', path: '', icon: '', sort_order: 0, is_active: true });

  const canCreate = checkPermission("Manajemen Menu", "create");
  const canUpdate = checkPermission("Manajemen Menu", "update");
  const canDelete = checkPermission("Manajemen Menu", "delete");
  const showActionsColumn = canUpdate || canDelete;

  useEffect(() => {
    fetchMenus(currentPage, activeSearch);
  }, [currentPage, activeSearch, fetchMenus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
    setCurrentPage(1);
  };

  const handleOpenModal = (menu?: any) => {
    if (menu) {
      setFormData({ ...menu, id: menu.id.toString() });
    } else {
      setFormData({ id: '', name: '', path: '', icon: '', sort_order: menuMeta.total_items + 1, is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      path: formData.path,
      icon: formData.icon,
      sort_order: Number(formData.sort_order),
      is_active: formData.is_active
    };
    const success = await saveMenu(payload, formData.id, currentPage, activeSearch);
    if (success) setIsModalOpen(false);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const totalPages = menuMeta.total_pages || 1;
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${
            menuMeta.current_page === i 
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

  const startItem = menuMeta.total_items === 0 ? 0 : (menuMeta.current_page - 1) * menuMeta.limit + 1;
  const endItem = Math.min(menuMeta.current_page * menuMeta.limit, menuMeta.total_items);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manajemen Menu</h1>
          <p className="text-gray-500 mt-1">Atur navigasi, ikon, urutan menu, dan visibilitas di sidebar sistem.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <form onSubmit={handleSearch} className="relative group w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#12b3d6] transition-colors" size={18} />
            <Input 
              placeholder="Cari nama menu..." 
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

          {canCreate && (
            <Button onClick={() => handleOpenModal()} className="bg-[#12b3d6] hover:bg-[#0fa0bf] h-11 px-6 rounded-xl w-full sm:w-auto shadow-md shadow-cyan-200/50">
              <Plus size={18} className="mr-2" /> Tambah Menu
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
                  <TableHead className="py-4 px-6 font-semibold text-gray-600 w-24">Urutan</TableHead>
                  <TableHead className="font-semibold text-gray-600">Nama Menu</TableHead>
                  <TableHead className="font-semibold text-gray-600">Path / URL</TableHead>
                  <TableHead className="font-semibold text-gray-600">Ikon (Lucide)</TableHead>
                  <TableHead className="font-semibold text-gray-600">Status Visibilitas</TableHead>
                  {showActionsColumn && (
                    <TableHead className="text-right px-6 font-semibold text-gray-600">Aksi</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={showActionsColumn ? 6 : 5} className="h-32 text-center">
                      <div className="flex justify-center items-center gap-3 text-gray-500">
                        <div className="w-5 h-5 border-2 border-[#12b3d6] border-t-transparent rounded-full animate-spin"></div>
                        Memuat data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : menus.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={showActionsColumn ? 6 : 5} className="h-32 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <ListTree size={32} className="text-gray-300 mb-2" />
                        Tidak ada menu ditemukan.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  menus.map((menu) => (
                    <TableRow key={menu.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                      <TableCell className="py-4 px-6">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-sm">
                          {menu.sort_order}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-gray-900">
                        {menu.name}
                      </TableCell>
                      <TableCell>
                        <code className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200">
                          {menu.path}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-gray-600">
                          <LayoutTemplate size={16} className="text-gray-400"/>
                          <span className="text-sm">{menu.icon || 'default'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {menu.is_active ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-2.5 py-0.5 rounded-md">Aktif di Sidebar</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-200 border-none px-2.5 py-0.5 rounded-md">Sembunyi</Badge>
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
                                <DropdownMenuItem className="cursor-pointer p-2.5 rounded-lg font-medium hover:bg-cyan-50 hover:text-[#12b3d6]" onClick={() => handleOpenModal(menu)}>
                                  <Pencil size={16} className="mr-2" /> Edit Data Menu
                                </DropdownMenuItem>
                              )}
                              {canDelete && (
                                <DropdownMenuItem 
                                  className="cursor-pointer p-2.5 rounded-lg font-medium text-red-600 focus:bg-red-50 focus:text-red-700" 
                                  onClick={() => deleteMenu(menu.id, currentPage, activeSearch)}
                                >
                                  <Trash2 size={16} className="mr-2" /> Hapus Menu
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
            Menampilkan <span className="font-bold text-gray-900">{startItem}</span> hingga <span className="font-bold text-gray-900">{endItem}</span> dari <span className="font-bold text-gray-900">{menuMeta.total_items}</span> menu
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 px-3 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
              disabled={menuMeta.current_page <= 1 || isLoading} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
              <ChevronLeft size={16} className="mr-1" /> Prev
            </Button>
            <div className="flex items-center gap-1.5 px-2 hidden sm:flex">{renderPaginationButtons()}</div>
            <Button variant="outline" size="sm" className="h-9 px-3 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
              disabled={menuMeta.current_page >= menuMeta.total_pages || isLoading} onClick={() => setCurrentPage(prev => Math.min(prev + 1, menuMeta.total_pages))}>
              Next <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ListTree className="text-[#12b3d6]" size={20}/>
                {formData.id ? 'Edit Menu' : 'Tambah Menu Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-gray-700">Nama Menu</Label>
                <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-11 rounded-xl" placeholder="Contoh: Laporan Data" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Path / URL Tujuan</Label>
                <Input required value={formData.path} onChange={(e) => setFormData({...formData, path: e.target.value})} className="h-11 rounded-xl font-mono text-sm" placeholder="Contoh: /dashboard/laporan" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 text-xs">Nama Ikon (Lucide)</Label>
                  <Input value={formData.icon} onChange={(e) => setFormData({...formData, icon: e.target.value})} className="h-11 rounded-xl" placeholder="Contoh: users" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 text-xs">Urutan Tampil (Angka)</Label>
                  <Input type="number" required value={formData.sort_order} onChange={(e) => setFormData({...formData, sort_order: Number(e.target.value)})} className="h-11 rounded-xl" />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <input 
                  type="checkbox" id="is_active" className="w-5 h-5 text-[#12b3d6] rounded border-gray-300 focus:ring-[#12b3d6]"
                  checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                <div className="flex flex-col">
                  <Label htmlFor="is_active" className="cursor-pointer font-bold text-gray-800">Tampilkan di Sidebar</Label>
                  <p className="text-xs text-gray-500">Jika mati, menu tetap bisa diakses lewat URL tapi disembunyikan dari navigasi.</p>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" className="h-11 px-6 rounded-xl" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" className="h-11 px-6 rounded-xl bg-[#12b3d6] hover:bg-[#0fa0bf] shadow-md shadow-cyan-200">Simpan Data</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}