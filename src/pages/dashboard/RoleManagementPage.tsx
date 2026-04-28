/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from 'react';
import { useRBAC } from '@/hooks/useRBAC';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Plus, Pencil, Trash2, X, KeyRound, CheckSquare, Search, MoreVertical, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
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

export default function RoleManagementPage() {
  const { 
    roles, roleMeta, fetchRoles, saveRole, deleteRole, 
    permissions, fetchAllPermissions, assignPermissionsToRole, isLoading 
  } = useRBAC();
  
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', description: '' });

  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [checkedPermissions, setCheckedPermissions] = useState<number[]>([]);

  // State modal konfirmasi delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canCreate = checkPermission("Manajemen Role", "create");
  const canUpdate = checkPermission("Manajemen Role", "update");
  const canDelete = checkPermission("Manajemen Role", "delete");
  const canAssign = checkPermission("Manajemen Role", "assign_permission");
  const showActionsColumn = canUpdate || canDelete || canAssign;

  const PROTECTED_ROLES = ['Superadmin', 'Admin', 'Client', 'Voter'];

  useEffect(() => {
    fetchRoles(currentPage, activeSearch);
  }, [currentPage, activeSearch, fetchRoles]);

  useEffect(() => {
    fetchAllPermissions();
  }, [fetchAllPermissions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
    setCurrentPage(1);
  };

  const groupedPermissions = useMemo(() => {
    return permissions.reduce((acc: any, perm: any) => {
      const menuName = perm.menu?.name || 'Lainnya';
      if (!acc[menuName]) acc[menuName] = [];
      acc[menuName].push(perm);
      return acc;
    }, {});
  }, [permissions]);

  const handleOpenRoleModal = (role?: any) => {
    if (role) setFormData({ id: role.id.toString(), name: role.name, description: role.description });
    else setFormData({ id: '', name: '', description: '' });
    setIsRoleModalOpen(true);
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveRole({ name: formData.name, description: formData.description }, formData.id, currentPage, activeSearch);
    if (success) setIsRoleModalOpen(false);
  };

  const handleOpenAccessModal = (role: any) => {
    setSelectedRole(role);
    const currentPermIds = role.permissions ? role.permissions.map((p: any) => p.id) : [];
    setCheckedPermissions(currentPermIds);
    setIsAccessModalOpen(true);
  };

  const togglePermission = (permId: number) => {
    setCheckedPermissions(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const handleSaveAccess = async () => {
    if (!selectedRole) return;
    const success = await assignPermissionsToRole(selectedRole.id, checkedPermissions, currentPage, activeSearch);
    if (success) setIsAccessModalOpen(false);
  };

  // Buka modal konfirmasi delete
  const handleOpenDeleteModal = (role: any) => {
    setDeleteTarget({ id: role.id.toString(), name: role.name });
    setIsDeleteModalOpen(true);
  };

  // Eksekusi delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteRole(deleteTarget.id, currentPage, activeSearch);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const totalPages = roleMeta.total_pages || 1;
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${
            roleMeta.current_page === i 
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

  const startItem = roleMeta.total_items === 0 ? 0 : (roleMeta.current_page - 1) * roleMeta.limit + 1;
  const endItem = Math.min(roleMeta.current_page * roleMeta.limit, roleMeta.total_items);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manajemen Role</h1>
          <p className="text-gray-500 mt-1">Atur grup pengguna dan definisikan hak akses mereka secara dinamis.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <form onSubmit={handleSearch} className="relative group w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#12b3d6] transition-colors" size={18} />
            <Input 
              placeholder="Cari nama role..." 
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
            <Button onClick={() => handleOpenRoleModal()} className="bg-[#12b3d6] hover:bg-[#0fa0bf] h-11 px-6 rounded-xl w-full sm:w-auto shadow-md shadow-cyan-200/50">
              <Plus size={18} className="mr-2" /> Tambah Role
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
                  <TableHead className="py-4 px-6 font-semibold text-gray-600">Nama Role</TableHead>
                  <TableHead className="font-semibold text-gray-600">Deskripsi</TableHead>
                  <TableHead className="font-semibold text-gray-600">Total Akses</TableHead>
                  {showActionsColumn && (
                    <TableHead className="text-right px-6 font-semibold text-gray-600">Aksi</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={showActionsColumn ? 4 : 3} className="h-32 text-center">
                      <div className="flex justify-center items-center gap-3 text-gray-500">
                        <div className="w-5 h-5 border-2 border-[#12b3d6] border-t-transparent rounded-full animate-spin"></div>
                        Memuat data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={showActionsColumn ? 4 : 3} className="h-32 text-center text-gray-500">Tidak ada role ditemukan.</TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                      <TableCell className="py-4 px-6 font-bold text-gray-900">
                        <div className="flex items-center gap-2">
                          <Shield size={18} className={role.name === 'Superadmin' ? 'text-red-500' : 'text-[#12b3d6]'} />
                          {role.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500">{role.description || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-cyan-50 text-[#12b3d6] hover:bg-cyan-100 border-none font-medium px-2.5 py-0.5 rounded-md">
                          {role.permissions?.length || 0} Perizinan
                        </Badge>
                      </TableCell>
                      {showActionsColumn && (
                        <TableCell className="text-right px-6">
                          <div className="flex justify-end items-center gap-2">
                            {canAssign && (
                              <Button 
                                size="sm" 
                                className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-[#12b3d6] shadow-sm rounded-lg h-8"
                                onClick={() => handleOpenAccessModal(role)}
                                disabled={role.name === 'Superadmin'}
                              >
                                <KeyRound size={14} className="mr-2" /> Kelola Akses
                              </Button>
                            )}

                            {(canUpdate || canDelete) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 h-8 w-8 rounded-lg">
                                    <MoreVertical size={18} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-gray-100 p-1">
                                  {canUpdate && (
                                    <DropdownMenuItem className="cursor-pointer p-2.5 rounded-lg font-medium hover:bg-cyan-50 hover:text-[#12b3d6]" onClick={() => handleOpenRoleModal(role)}>
                                      <Pencil size={16} className="mr-2" /> Edit Info Role
                                    </DropdownMenuItem>
                                  )}
                                  {canDelete && (
                                    <DropdownMenuItem 
                                      className="cursor-pointer p-2.5 rounded-lg font-medium text-red-600 focus:bg-red-50 focus:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed" 
                                      onClick={() => !PROTECTED_ROLES.includes(role.name) && handleOpenDeleteModal(role)}
                                      disabled={PROTECTED_ROLES.includes(role.name)}
                                    >
                                      <Trash2 size={16} className="mr-2" /> Hapus Role
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
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
            Menampilkan <span className="font-bold text-gray-900">{startItem}</span> hingga <span className="font-bold text-gray-900">{endItem}</span> dari <span className="font-bold text-gray-900">{roleMeta.total_items}</span> role
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 px-3 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
              disabled={roleMeta.current_page <= 1 || isLoading} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
              <ChevronLeft size={16} className="mr-1" /> Prev
            </Button>
            <div className="flex items-center gap-1.5 px-2 hidden sm:flex">{renderPaginationButtons()}</div>
            <Button variant="outline" size="sm" className="h-9 px-3 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
              disabled={roleMeta.current_page >= roleMeta.total_pages || isLoading} onClick={() => setCurrentPage(prev => Math.min(prev + 1, roleMeta.total_pages))}>
              Next <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Form Tambah/Edit Role */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="text-[#12b3d6]" size={20} />
                {formData.id ? 'Edit Role' : 'Tambah Role Baru'}
              </h2>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRoleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-gray-700">Nama Role</Label>
                <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-11 rounded-xl" placeholder="Contoh: Auditor Internal" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Deskripsi</Label>
                <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="h-11 rounded-xl" placeholder="Penjelasan singkat tugas role" />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-50">
                <Button type="button" variant="outline" className="h-11 px-6 rounded-xl" onClick={() => setIsRoleModalOpen(false)}>Batal</Button>
                <Button type="submit" className="h-11 px-6 rounded-xl bg-[#12b3d6] hover:bg-[#0fa0bf] shadow-md shadow-cyan-200/50">Simpan Role</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola Akses */}
      {isAccessModalOpen && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <KeyRound className="text-[#12b3d6]"/> Kelola Akses: <span className="text-[#12b3d6]">{selectedRole.name}</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">Centang tindakan yang diizinkan untuk role ini di seluruh sistem.</p>
              </div>
              <button onClick={() => setIsAccessModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-2 border border-gray-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50 space-y-5 custom-scrollbar">
              {Object.keys(groupedPermissions).map((menuName) => (
                <div key={menuName} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">{menuName}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {groupedPermissions[menuName].map((perm: any) => (
                      <label key={perm.id} className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${checkedPermissions.includes(perm.id) ? 'bg-cyan-50/50 border-[#12b3d6]/30' : 'bg-gray-50/50 border-transparent hover:border-gray-200'}`}>
                        <input type="checkbox" className="mt-1 w-4 h-4 text-[#12b3d6] rounded border-gray-300 focus:ring-[#12b3d6]" checked={checkedPermissions.includes(perm.id)} onChange={() => togglePermission(perm.id)} />
                        <div>
                          <p className="text-sm font-bold text-gray-700 capitalize">{perm.action}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-tight">{perm.name}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3">
              <Button variant="outline" className="h-11 px-6 rounded-xl" onClick={() => setIsAccessModalOpen(false)}>Batal</Button>
              <Button onClick={handleSaveAccess} className="h-11 px-6 rounded-xl bg-[#12b3d6] hover:bg-[#0fa0bf] shadow-md shadow-cyan-200/50">
                <CheckSquare size={18} className="mr-2" /> Simpan Hak Akses
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Role */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} />
                Hapus Role
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
                Apakah Anda yakin ingin menghapus role berikut?
              </p>
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                  <Shield size={18} className="text-red-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{deleteTarget.name}</p>
                  <p className="text-xs text-red-500 mt-0.5">Semua pengguna dengan role ini akan kehilangan akses terkait.</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-3xl">
              <Button 
                type="button" variant="outline" className="h-11 px-6 rounded-xl"
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
                    Ya, Hapus Role
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