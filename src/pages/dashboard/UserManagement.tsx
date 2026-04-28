import { useEffect, useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { UserTable } from '@/components/organisms/UserTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, ShieldCheck, Clock, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export default function UserManagementPage() {
  const { users, isLoading, approveUser, toggleStatus, fetchUsers, meta } = useUsers();
  
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUsers(currentPage, activeSearch, roleFilter);
  }, [currentPage, activeSearch, roleFilter, fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
    setCurrentPage(1); 
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1); 
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    // Jangan render jika total_pages 0 atau undefined
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

  // Kalkulasi range data yang ditampilkan
  const startItem = meta.total_items === 0 ? 0 : (meta.current_page - 1) * meta.limit + 1;
  const endItem = Math.min(meta.current_page * meta.limit, meta.total_items);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manajemen Pengguna</h1>
          <p className="text-gray-500 mt-1">Kelola persetujuan penyelenggara pemilu dan kontrol akses akun.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
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

      {/* Ringkasan Statistik */}
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

      {/* Area Tabel & Pagination */}
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
            onToggle={(id, currentStatus) => toggleStatus(id, currentStatus, currentPage, activeSearch, roleFilter)}
          />
        )}
        
        {/* Navigasi Pagination - SEKARANG SELALU TAMPIL */}
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
    </div>
  );
}