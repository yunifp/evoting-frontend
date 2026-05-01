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

  // PENYEMPURNAAN: Override header menjadi multipart/form-data khusus untuk upload file
  const addKandidat = async (data: FormData) => {
    await api.post(`/client/pemilu/${pemiluId}/kandidat`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    fetchDetail();
  };

  // TAMBAHAN FITUR: Fungsi update kandidat beserta override header
  const updateKandidat = async (kandidatId: number, data: FormData) => {
    await api.put(`/client/kandidat/${kandidatId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    fetchDetail();
  };

  const deleteKandidat = async (id: number) => {
    await api.delete(`/client/kandidat/${id}`);
    fetchDetail();
  };

  const addDpt = async (data: any) => {
    const res = await api.post(`/client/pemilu/${pemiluId}/dpt`, data);
    fetchDpts();
    return res;
  };

  const publishPemilu = async () => {
    try {
      await api.patch(`/client/pemilu/${pemiluId}/publish`);
      fetchDetail();
      alert("Acara berhasil diaktifkan!");
    } catch (error: any) {
      alert(error.response?.data?.error || "Gagal mengaktifkan acara");
    }
  };

  const closePemilu = async () => {
    try {
      await api.patch(`/client/pemilu/${pemiluId}/close`);
      fetchDetail();
      alert("Acara berhasil ditutup!");
    } catch (error: any) {
      alert(error.response?.data?.error || "Gagal menutup acara");
    }
  };

  return { 
    pemilu, 
    dpts, 
    isLoading, 
    fetchDetail, 
    fetchDpts, 
    addKandidat, 
    updateKandidat, 
    deleteKandidat, 
    addDpt, 
    publishPemilu, 
    closePemilu 
  };
};