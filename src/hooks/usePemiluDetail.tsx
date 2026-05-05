/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import api from '@/lib/axios';

export const usePemiluDetail = (pemiluId: string) => {
  const [pemilu, setPemilu] = useState<any>(null);
  const [dpts, setDpts] = useState<any[]>([]);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/client/pemilu/${pemiluId}`);
      setPemilu(res.data.data);
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  }, [pemiluId]);

  const fetchDpts = useCallback(async () => {
    try {
      const res = await api.get(`/client/pemilu/${pemiluId}/dpt`);
      setDpts(res.data.data);
    } catch (err) {
    }
  }, [pemiluId]);

  const fetchResults = useCallback(async () => {
    try {
      const res = await api.get(`/client/pemilu/${pemiluId}/results`);
      setResults(res.data.data);
    } catch (err) {
    }
  }, [pemiluId]);

  const addKandidat = async (data: FormData) => {
    await api.post(`/client/pemilu/${pemiluId}/kandidat`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    fetchDetail();
  };

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

  const updateDpt = async (dptId: string, data: any) => {
    const res = await api.put(`/client/dpt/${dptId}`, data);
    fetchDpts();
    return res;
  };

  const deleteDpt = async (dptId: string) => {
    await api.delete(`/client/dpt/${dptId}`);
    fetchDpts();
  };

  const publishPemilu = async () => {
    try {
      await api.patch(`/client/pemilu/${pemiluId}/publish`);
      fetchDetail();
    } catch (error: any) {
    }
  };

  const closePemilu = async () => {
    try {
      await api.patch(`/client/pemilu/${pemiluId}/close`);
      fetchDetail();
    } catch (error: any) {
    }
  };

  const broadcastWA = async () => {
    try {
      await api.post(`/client/pemilu/${pemiluId}/broadcast-invitation`);
    } catch (error: any) {
    }
  };

  return { 
    pemilu, 
    dpts, 
    results,
    isLoading, 
    fetchDetail, 
    fetchDpts, 
    fetchResults,
    addKandidat, 
    updateKandidat, 
    deleteKandidat, 
    addDpt,
    updateDpt,
    deleteDpt,
    publishPemilu, 
    closePemilu,
    broadcastWA 
  };
};