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

  const createPemilu = async (data: { title: string; start_date: string; end_date: string }) => {
    const response = await api.post('/client/pemilu', data);
    return response.data;
  };

  return { pemilus, isLoading, getMyPemilus, createPemilu };
};