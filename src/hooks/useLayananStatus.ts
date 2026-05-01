/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import api from '@/lib/axios';

export const useLayananStatus = () => {
  const [data, setData] = useState<{ tersedia: any[]; digunakan: any[]; selesai: any[] }>({
    tersedia: [],
    digunakan: [],
    selesai: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/client/layanan/status');
      setData(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, fetchStatus };
};