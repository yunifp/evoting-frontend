/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import api from '@/lib/axios';

export const useRBAC = () => {
  const [isLoading, setIsLoading] = useState(false);

  // ==========================================
  // --- MENU MANAGEMENT ---
  // ==========================================
  const [menus, setMenus] = useState<any[]>([]);
  const [menuMeta, setMenuMeta] = useState({ current_page: 1, total_pages: 1, total_items: 0, limit: 10 });

  const fetchMenus = useCallback(async (page = 1, search = '', limit = 10) => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/menus', {
        params: { page, limit, search }
      });
      setMenus(response.data.data);
      setMenuMeta(response.data.meta);
    } catch (err) {
      console.error("Gagal mengambil menu", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveMenu = async (data: any, id?: string, currentPage = 1, currentSearch = '') => {
    try {
      if (id) await api.put(`/admin/menus/${id}`, data);
      else await api.post('/admin/menus', data);
      fetchMenus(currentPage, currentSearch);
      return true;
    } catch (err) {
      alert("Gagal menyimpan menu");
      return false;
    }
  };

  const deleteMenu = async (id: string, currentPage = 1, currentSearch = '') => {
    if(!window.confirm("Yakin menghapus menu ini? Semua hak akses role terkait menu ini akan ikut terhapus.")) return;
    try {
      await api.delete(`/admin/menus/${id}`);
      fetchMenus(currentPage, currentSearch);
    } catch (err) {
      alert("Gagal menghapus menu");
    }
  };

  // ==========================================
  // --- PERMISSION MANAGEMENT ---
  // ==========================================
  const [permissionsPaginated, setPermissionsPaginated] = useState<any[]>([]);
  const [permissionMeta, setPermissionMeta] = useState({ current_page: 1, total_pages: 1, total_items: 0, limit: 10 });
  const [allPermissions, setAllPermissions] = useState<any[]>([]); // Untuk kebutuhan Assign Role

  const fetchPermissions = useCallback(async (page = 1, search = '', menuId = '') => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/permissions', {
        params: { page, limit: 10, search, menu_id: menuId }
      });
      setPermissionsPaginated(response.data.data);
      setPermissionMeta(response.data.meta);
    } catch (err) {
      console.error("Gagal mengambil permission", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllPermissions = useCallback(async () => {
    try {
      const response = await api.get('/admin/permissions?limit=500');
      setAllPermissions(response.data.data);
    } catch (err) {
      console.error("Gagal mengambil semua hak akses", err);
    }
  }, []);

  const savePermission = async (data: any, id?: string, currentPage = 1, currentSearch = '', currentMenuFilter = '') => {
    try {
      if (id) await api.put(`/admin/permissions/${id}`, data);
      else await api.post('/admin/permissions', data);
      fetchPermissions(currentPage, currentSearch, currentMenuFilter);
      return true;
    } catch (err) {
      alert("Gagal menyimpan hak akses");
      return false;
    }
  };

  const deletePermission = async (id: string, currentPage = 1, currentSearch = '', currentMenuFilter = '') => {
    if(!window.confirm("Yakin menghapus hak akses ini? Fitur pada role yang menggunakan hak akses ini akan hilang.")) return;
    try {
      await api.delete(`/admin/permissions/${id}`);
      fetchPermissions(currentPage, currentSearch, currentMenuFilter);
    } catch (err) {
      alert("Gagal menghapus hak akses");
    }
  };

  // ==========================================
  // --- ROLE MANAGEMENT ---
  // ==========================================
  const [roles, setRoles] = useState<any[]>([]);
  const [roleMeta, setRoleMeta] = useState({ current_page: 1, total_pages: 1, total_items: 0, limit: 10 });

  const fetchRoles = useCallback(async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/roles', {
        params: { page, limit: 10, search }
      });
      setRoles(response.data.data);
      setRoleMeta(response.data.meta);
    } catch (err) {
      console.error("Gagal mengambil role", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveRole = async (data: any, id?: string, currentPage = 1, currentSearch = '') => {
    try {
      if (id) await api.put(`/admin/roles/${id}`, data);
      else await api.post('/admin/roles', data);
      fetchRoles(currentPage, currentSearch);
      return true;
    } catch (err) {
      alert("Gagal menyimpan role");
      return false;
    }
  };

  const deleteRole = async (id: string, currentPage = 1, currentSearch = '') => {
    if(!window.confirm("Yakin menghapus role ini?")) return;
    try {
      await api.delete(`/admin/roles/${id}`);
      fetchRoles(currentPage, currentSearch);
    } catch (err) {
      alert("Gagal menghapus role. Role inti sistem tidak dapat dihapus.");
    }
  };

  const assignPermissionsToRole = async (roleId: string, permissionIds: number[], currentPage = 1, currentSearch = '') => {
    try {
      await api.post(`/admin/roles/${roleId}/permissions`, { permission_ids: permissionIds });
      fetchRoles(currentPage, currentSearch);
      return true;
    } catch (err) {
      alert("Gagal menetapkan hak akses");
      return false;
    }
  };

  return {
    isLoading,
    menus, menuMeta, fetchMenus, saveMenu, deleteMenu,
    permissions: allPermissions, fetchAllPermissions, // Masih dipakai RoleManagementPage
    permissionsPaginated, permissionMeta, fetchPermissions, savePermission, deletePermission,
    roles, roleMeta, fetchRoles, saveRole, deleteRole, assignPermissionsToRole
  };
};