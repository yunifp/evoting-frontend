/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import api from '@/lib/axios';

export const useLayanan = () => {
  const [layanans, setLayanans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [meta, setMeta] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    limit: 5
  });

  const fetchLayanans = useCallback(async (page = 1, search = '', minDpt = '', maxDpt = '') => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/layanan', {
        params: { page, limit: 5, search, min_dpt: minDpt, max_dpt: maxDpt }
      });
      setLayanans(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchClientLayanans = useCallback(async (page = 1, search = '', minDpt = '', maxDpt = '') => {
    setIsLoading(true);
    try {
      const response = await api.get('/client/layanan', {
        params: { page, limit: 50, search, min_dpt: minDpt, max_dpt: maxDpt }
      });
      setLayanans(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createLayanan = async (data: any) => {
    await api.post('/admin/layanan', data);
  };

  const updateLayanan = async (id: string, data: any) => {
    await api.put(`/admin/layanan/${id}`, data);
  };

  const deleteLayanan = async (id: string) => {
    await api.delete(`/admin/layanan/${id}`);
  };

  return { layanans, isLoading, meta, fetchLayanans, fetchClientLayanans, createLayanan, updateLayanan, deleteLayanan };
};