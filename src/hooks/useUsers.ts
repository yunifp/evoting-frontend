/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import api from '@/lib/axios';

export const useUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [meta, setMeta] = useState({ 
    current_page: 1, 
    total_pages: 1, 
    total_items: 0,
    limit: 10 // Pastikan ada default limit
  });

  const fetchUsers = useCallback(async (page = 1, search = '', role = '') => {
    setIsLoading(true);
    try {
      // Panggil API dengan parameter (limit kita set 5 dulu agar pagination cepat terlihat saat testing)
      const response = await api.get('/admin/users', {
        params: { page, limit: 5, search, role } 
      });
      setUsers(response.data.data);
      // Simpan seluruh meta data dari backend
      setMeta(response.data.meta);
    } catch (err) {
      console.error("Gagal mengambil data user", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveUser = async (id: string, currentPage: number, currentSearch: string, currentRole: string) => {
    try {
      await api.patch(`/admin/users/${id}/approve`);
      fetchUsers(currentPage, currentSearch, currentRole);
    } catch (err) {
      alert("Gagal menyetujui user");
    }
  };

  const toggleStatus = async (id: string, isActive: boolean, currentPage: number, currentSearch: string, currentRole: string) => {
    try {
      await api.patch(`/admin/users/${id}/toggle-status`, { is_active: isActive });
      fetchUsers(currentPage, currentSearch, currentRole);
    } catch (err) {
      alert("Gagal mengubah status");
    }
  };

  return { users, isLoading, meta, fetchUsers, approveUser, toggleStatus };
};