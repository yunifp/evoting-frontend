/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import api from '@/lib/axios';

export const usePemilu = () => {
  const [pemilus, setPemilus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getMyPemilus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/client/pemilu');
      setPemilus(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // FUNGSI BARU
  const getAvailablePackages = useCallback(async () => {
    try {
      const response = await api.get('/client/pemilu/available-packages');
      return response.data.data;
    } catch (err) {
      console.error(err);
      return [];
    }
  }, []);

  const createPemilu = async (data: any) => {
    const response = await api.post('/client/pemilu', data);
    return response.data;
  };

  const updatePemilu = async (id: string | number, data: any) => {
    const response = await api.put(`/client/pemilu/${id}`, data);
    return response.data;
  };

  const deletePemilu = async (id: string | number) => {
    const response = await api.delete(`/client/pemilu/${id}`);
    return response.data;
  };

  return { pemilus, isLoading, getMyPemilus, getAvailablePackages, createPemilu, updatePemilu, deletePemilu };
};