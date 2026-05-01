/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import api from '@/lib/axios';

export const useMasterData = () => {
  const [provinsi, setProvinsi] = useState<any[]>([]);
  const [kabupaten, setKabupaten] = useState<any[]>([]);
  const [kecamatan, setKecamatan] = useState<any[]>([]);
  const [kelurahan, setKelurahan] = useState<any[]>([]);
  const [statusKawin, setStatusKawin] = useState<any[]>([]);

  const getProvinsi = useCallback(async () => {
    try {
      const res = await api.get('/master/provinsi');
      setProvinsi(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getKabupaten = useCallback(async (kodePro: string) => {
    try {
      const res = await api.get(`/master/kabupaten?kode_pro=${kodePro}`); // Update query params
      setKabupaten(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getKecamatan = useCallback(async (kodeKab: string) => {
    try {
      const res = await api.get(`/master/kecamatan?kode_kab=${kodeKab}`); // Update query params
      setKecamatan(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getKelurahan = useCallback(async (kodeKec: string) => {
    try {
      const res = await api.get(`/master/kelurahan?kode_kec=${kodeKec}`); // Update query params
      setKelurahan(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getStatusKawin = useCallback(async () => {
    try {
      const res = await api.get('/master/status-kawin');
      setStatusKawin(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const clearWilayah = useCallback((level: 'kabupaten' | 'kecamatan' | 'kelurahan') => {
    if (level === 'kabupaten') {
      setKabupaten([]);
      setKecamatan([]);
      setKelurahan([]);
    }
    if (level === 'kecamatan') {
      setKecamatan([]);
      setKelurahan([]);
    }
    if (level === 'kelurahan') {
      setKelurahan([]);
    }
  }, []);

  return {
    provinsi, kabupaten, kecamatan, kelurahan, statusKawin,
    getProvinsi, getKabupaten, getKecamatan, getKelurahan, getStatusKawin, clearWilayah
  };
};