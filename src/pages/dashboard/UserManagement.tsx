/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { UserTable } from '@/components/organisms/UserTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Users, ShieldCheck, Clock, Filter, ChevronLeft, ChevronRight, Plus, X, AlertTriangle, UserX, UserCheck } from 'lucide-react';

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

export default function UserManagementPage() {
    const { users, roles, isLoading, meta, fetchUsers, fetchRoles, approveUser, toggleStatus, createUser, updateUser, deleteUser } = useUsers();

    const [searchInput, setSearchInput] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedUserId, setSelectedUserId] = useState<string>('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role_ids: [] as number[]
    });

    // State modal konfirmasi delete
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // State modal konfirmasi toggle status
    const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
    const [toggleTarget, setToggleTarget] = useState<{ id: string; name: string; currentStatus: boolean } | null>(null);
    const [isToggling, setIsToggling] = useState(false);

    const canCreate = checkPermission("Manajemen Pengguna", "create");
    const canUpdate = checkPermission("Manajemen Pengguna", "update");
    const canDelete = checkPermission("Manajemen Pengguna", "delete");
    const canApprove = checkPermission("Manajemen Pengguna", "approve");

    useEffect(() => {
        fetchUsers(currentPage, activeSearch, roleFilter);
        fetchRoles();
    }, [currentPage, activeSearch, roleFilter, fetchUsers, fetchRoles]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setActiveSearch(searchInput);
        setCurrentPage(1);
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRoleFilter(e.target.value);
        setCurrentPage(1);
    };

    const openCreateModal = () => {
        setModalMode('create');
        setFormData({ name: '', email: '', password: '', role_ids: [] });
        setIsModalOpen(true);
    };

    const openEditModal = (user: any) => {
        setModalMode('edit');
        setSelectedUserId(user.id);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role_ids: user.roles.map((r: any) => r.id)
        });
        setIsModalOpen(true);
    };

    const handleRoleSelection = (roleId: number) => {
        setFormData(prev => {
            const currentRoles = prev.role_ids;
            if (currentRoles.includes(roleId)) {
                return { ...prev, role_ids: currentRoles.filter(id => id !== roleId) };
            } else {
                return { ...prev, role_ids: [...currentRoles, roleId] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                await createUser(formData);
            } else {
                const updatePayload = {
                    name: formData.name,
                    email: formData.email,
                    role_ids: formData.role_ids
                };
                await updateUser(selectedUserId, updatePayload);
            }
            setIsModalOpen(false);
            fetchUsers(currentPage, activeSearch, roleFilter);
        } catch (error) {
            alert("Terjadi kesalahan saat menyimpan data");
        }
    };

    // Buka modal konfirmasi delete
    const handleOpenDeleteModal = (user: any) => {
        setDeleteTarget({ id: user.id, name: user.name });
        setIsDeleteModalOpen(true);
    };

    // Eksekusi delete
    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await deleteUser(deleteTarget.id);
            fetchUsers(currentPage, activeSearch, roleFilter);
            setIsDeleteModalOpen(false);
            setDeleteTarget(null);
        } catch (error) {
            alert("Gagal menghapus pengguna");
        } finally {
            setIsDeleting(false);
        }
    };

    // Buka modal konfirmasi toggle status
    const handleOpenToggleModal = (user: any) => {
        setToggleTarget({ id: user.id, name: user.name, currentStatus: user.is_active });
        setIsToggleModalOpen(true);
    };

    // Eksekusi toggle status
    const handleConfirmToggle = async () => {
        if (!toggleTarget) return;
        setIsToggling(true);
        try {
            await toggleStatus(toggleTarget.id, !toggleTarget.currentStatus, currentPage, activeSearch, roleFilter);
            setIsToggleModalOpen(false);
            setToggleTarget(null);
        } catch (error) {
            alert("Gagal mengubah status pengguna");
        } finally {
            setIsToggling(false);
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
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${meta.current_page === i
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
        <div className="space-y-8 animate-in fade-in duration-500 relative">

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manajemen Pengguna</h1>
                    <p className="text-gray-500 mt-1">Kelola persetujuan penyelenggara pemilu dan kontrol akses akun.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    {canCreate && (
                        <Button
                            onClick={openCreateModal}
                            className="bg-[#12b3d6] hover:bg-[#0fa0bf] shadow-md shadow-cyan-200/50 h-11 px-4 rounded-xl"
                        >
                            <Plus size={18} className="mr-2" /> Tambah Pengguna
                        </Button>
                    )}

                    <div className="relative group min-w-[170px]">
                        <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            className="w-full h-11 pl-10 pr-10 appearance-none bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#12b3d6]/20 focus:border-[#12b3d6] cursor-pointer transition-all"
                            value={roleFilter}
                            onChange={handleRoleChange}
                        >
                            <option value="">Semua Role</option>
                            <option value="Superadmin">Superadmin</option>
                            <option value="Admin">Admin</option>
                            <option value="Client">Client</option>
                            <option value="Voter">Voter</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    <form onSubmit={handleSearch} className="relative group w-full sm:w-72">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#12b3d6] transition-colors" size={18} />
                        <Input
                            placeholder="Cari nama atau email..."
                            className="pl-10 pr-10 h-11 w-full rounded-xl border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#12b3d6]/20 focus:border-[#12b3d6] transition-all"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={() => { setSearchInput(''); setActiveSearch(''); setCurrentPage(1); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        )}
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Pengguna</p>
                        <p className="text-2xl font-bold text-gray-900">{meta.total_items}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Aktif</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {users.filter(u => u.is_active).length}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Menunggu Verifikasi</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {users.filter(u => !u.is_approved).length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 border-4 border-[#12b3d6] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-medium">Memuat data pengguna...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm text-center px-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Users size={32} className="text-gray-300" />
                        </div>
                        <p className="text-gray-900 font-bold text-lg">Tidak ada pengguna ditemukan</p>
                        <p className="text-gray-500 text-sm mt-1 max-w-sm">Kami tidak dapat menemukan pengguna yang sesuai dengan kata kunci atau filter pencarian Anda.</p>
                    </div>
                ) : (
                    <UserTable
                        users={users}
                        onApprove={(id) => approveUser(id, currentPage, activeSearch, roleFilter)}
                        onToggle={(id: string, currentStatus: boolean) => {
                            const user = users.find(u => u.id === id);
                            if (user) handleOpenToggleModal(user);
                        }}
                        onEdit={openEditModal}
                        onDelete={(id: string) => {
                            const user = users.find(u => u.id === id);
                            if (user) handleOpenDeleteModal(user);
                        }}
                        canUpdate={canUpdate}
                        canDelete={canDelete}
                        canApprove={canApprove}
                    />
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm gap-4 mt-4">
                    <div className="text-sm text-gray-500 text-center sm:text-left">
                        Menampilkan <span className="font-bold text-gray-900">{startItem}</span> hingga <span className="font-bold text-gray-900">{endItem}</span> dari <span className="font-bold text-gray-900">{meta.total_items}</span> pengguna
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-3 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
                            disabled={meta.current_page <= 1 || isLoading}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        >
                            <ChevronLeft size={16} className="mr-1" /> Prev
                        </Button>

                        <div className="flex items-center gap-1.5 px-2 hidden sm:flex">
                            {renderPaginationButtons()}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-3 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
                            disabled={meta.current_page >= meta.total_pages || isLoading}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, meta.total_pages))}
                        >
                            Next <ChevronRight size={16} className="ml-1" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modal Form Tambah/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">
                                {modalMode === 'create' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form id="user-form" onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Lengkap</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Masukkan nama lengkap"
                                        required
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Alamat Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="nama@email.com"
                                        required
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                {modalMode === 'create' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Minimal 6 karakter"
                                            required={modalMode === 'create'}
                                            className="h-11 rounded-xl"
                                            minLength={6}
                                        />
                                    </div>
                                )}
                                <div className="space-y-3">
                                    <Label>Role Pengguna</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {roles.map(role => (
                                            <div
                                                key={role.id}
                                                onClick={() => handleRoleSelection(role.id)}
                                                className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${formData.role_ids.includes(role.id)
                                                        ? 'border-[#12b3d6] bg-cyan-50/50 text-[#12b3d6]'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                    }`}
                                            >
                                                <div className={`w-4 h-4 rounded pl-0.5 pt-0.5 border flex items-center justify-center mr-3 ${formData.role_ids.includes(role.id) ? 'bg-[#12b3d6] border-[#12b3d6]' : 'border-gray-300'
                                                    }`}>
                                                    {formData.role_ids.includes(role.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                                </div>
                                                <span className="font-medium text-sm">{role.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-3xl">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl px-5">
                                Batal
                            </Button>
                            <Button type="submit" form="user-form" className="bg-[#12b3d6] hover:bg-[#0fa0bf] shadow-md shadow-cyan-200/50 rounded-xl px-6">
                                {modalMode === 'create' ? 'Simpan Data' : 'Perbarui Data'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus */}
            {isDeleteModalOpen && deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <AlertTriangle className="text-red-500" size={20} />
                                Hapus Pengguna
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
                                Apakah Anda yakin ingin menghapus pengguna berikut?
                            </p>
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                                    <Users size={18} className="text-red-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{deleteTarget.name}</p>
                                    <p className="text-xs text-red-500 mt-0.5">Data yang dihapus tidak dapat dikembalikan.</p>
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
                                        <AlertTriangle size={16} />
                                        Ya, Hapus Pengguna
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Toggle Status */}
            {isToggleModalOpen && toggleTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                {toggleTarget.currentStatus ? (
                                    <UserX className="text-amber-500" size={20} />
                                ) : (
                                    <UserCheck className="text-green-500" size={20} />
                                )}
                                {toggleTarget.currentStatus ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                            </h2>
                            <button
                                onClick={() => { setIsToggleModalOpen(false); setToggleTarget(null); }}
                                className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-gray-600">
                                Apakah Anda yakin ingin {toggleTarget.currentStatus ? 'menonaktifkan' : 'mengaktifkan'} akun pengguna berikut?
                            </p>
                            <div className={`border rounded-2xl p-4 flex items-center gap-3 ${toggleTarget.currentStatus
                                    ? 'bg-amber-50 border-amber-100'
                                    : 'bg-green-50 border-green-100'
                                }`}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${toggleTarget.currentStatus ? 'bg-amber-100' : 'bg-green-100'
                                    }`}>
                                    {toggleTarget.currentStatus
                                        ? <UserX size={18} className="text-amber-500" />
                                        : <UserCheck size={18} className="text-green-500" />
                                    }
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{toggleTarget.name}</p>
                                    <p className={`text-xs mt-0.5 ${toggleTarget.currentStatus ? 'text-amber-500' : 'text-green-500'}`}>
                                        {toggleTarget.currentStatus
                                            ? 'Pengguna tidak dapat login setelah dinonaktifkan.'
                                            : 'Pengguna dapat login kembali setelah diaktifkan.'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-3xl">
                            <Button
                                type="button" variant="outline" className="h-11 px-6 rounded-xl"
                                onClick={() => { setIsToggleModalOpen(false); setToggleTarget(null); }}
                                disabled={isToggling}
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                className={`h-11 px-6 rounded-xl text-white shadow-md ${toggleTarget.currentStatus
                                        ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200/50'
                                        : 'bg-green-500 hover:bg-green-600 shadow-green-200/50'
                                    }`}
                                onClick={handleConfirmToggle}
                                disabled={isToggling}
                            >
                                {isToggling ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Memproses...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {toggleTarget.currentStatus
                                            ? <><UserX size={16} /> Ya, Nonaktifkan</>
                                            : <><UserCheck size={16} /> Ya, Aktifkan</>
                                        }
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