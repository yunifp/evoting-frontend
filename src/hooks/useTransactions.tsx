/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import api from '@/lib/axios';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createTransaction = async (data: any) => {
    const response = await api.post('/client/transactions', data);
    return response.data;
  };

  const getMyTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/client/transactions/me');
      setTransactions(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAllTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/transactions');
      setTransactions(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveTransaction = async (id: string) => {
    await api.patch(`/admin/transactions/${id}/approve`);
  };

  return { transactions, isLoading, createTransaction, getMyTransactions, getAllTransactions, approveTransaction };
};