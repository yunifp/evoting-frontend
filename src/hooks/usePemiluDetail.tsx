/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import api from '@/lib/axios';

export const usePemiluDetail = (pemiluId: string) => {
  const [pemilu, setPemilu] = useState<any>(null);
  const [dpts, setDpts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/client/pemilu/${pemiluId}`);
      setPemilu(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [pemiluId]);

  const fetchDpts = useCallback(async () => {
    try {
      const res = await api.get(`/client/pemilu/${pemiluId}/dpt`);
      setDpts(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }, [pemiluId]);

  const addKandidat = async (data: any) => {
    await api.post(`/client/pemilu/${pemiluId}/kandidat`, data);
    fetchDetail();
  };

  const deleteKandidat = async (id: number) => {
    await api.delete(`/client/kandidat/${id}`);
    fetchDetail();
  };

  const addDpt = async (data: any) => {
    await api.post(`/client/pemilu/${pemiluId}/dpt`, data);
    fetchDpts();
  };

  const publishPemilu = async () => {
    try {
      await api.patch(`/client/pemilu/${pemiluId}/publish`);
      fetchDetail(); // Refresh data
      alert("Acara berhasil diaktifkan!");
    } catch (error: any) {
      alert(error.response?.data?.error || "Gagal mengaktifkan acara");
    }
  };

  return { pemilu, dpts, isLoading, fetchDetail, fetchDpts, addKandidat, deleteKandidat, addDpt, publishPemilu };
};