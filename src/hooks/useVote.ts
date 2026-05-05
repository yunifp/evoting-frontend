/* eslint-disable preserve-caught-error */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import axios from 'axios';

export interface Kandidat {
  id: number;
  no_urut: number;
  name: string;
  photo_url: string;
}

export interface VoterData {
  pemilih: {
    nama: string;
    user_uuid: string;
  };
  acara: {
    title: string;
  };
  kandidat: Kandidat[];
  require_face_verification: boolean;
}

export const useVote = () => {
  const [data, setData] = useState<VoterData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const getVoterAuth = useCallback(async (uuid: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${baseUrl}/voter/auth/${uuid}`);
      setData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Tautan tidak valid atau Anda sudah memilih.');
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  const verifyFace = async (uuid: string, imageBase64: string) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${baseUrl}/voter/verify-face`, {
        user_uuid: uuid,
        face_image: imageBase64,
      });
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Verifikasi biometrik gagal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitVote = async (uuid: string, kandidatId: number | null) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${baseUrl}/voter/submit`, {
        user_uuid: uuid,
        kandidat_id: kandidatId,
      });
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Gagal mengirim suara');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    data, 
    loading, 
    error, 
    isSubmitting, 
    getVoterAuth, 
    verifyFace,
    submitVote 
  };
};