/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import api from '@/lib/axios';

export const useUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [meta, setMeta] = useState({ 
    current_page: 1, 
    total_pages: 1, 
    total_items: 0,
    limit: 10
  });

  const fetchUsers = useCallback(async (page = 1, search = '', role = '') => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/users', {
        params: { page, limit: 5, search, role } 
      });
      setUsers(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await api.get('/admin/roles', { params: { limit: 100 } });
      setRoles(response.data.data);
    } catch (err) {
      console.error(err);
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

  const createUser = async (data: any) => {
    await api.post('/admin/users', data);
  };

  const updateUser = async (id: string, data: any) => {
    await api.put(`/admin/users/${id}`, data);
  };

  const deleteUser = async (id: string) => {
    await api.delete(`/admin/users/${id}`);
  };

  return { users, roles, isLoading, meta, fetchUsers, fetchRoles, approveUser, toggleStatus, createUser, updateUser, deleteUser };
};