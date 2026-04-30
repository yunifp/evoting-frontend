/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { Building, Mail, Lock } from 'lucide-react'; 

export const RegisterForm = () => {
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Konfirmasi password tidak cocok");
      return;
    }

    if (formData.password.length < 6) {
      setLocalError("Password minimal 6 karakter");
      return;
    }

    const { confirmPassword, ...registerData } = formData;
    register(registerData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {(error || localError) && (
        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error || localError}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="name">Nama Institusi / Penyelenggara</Label>
        <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              id="name" 
              placeholder="Contoh: Panitia Pemilu Desa A" 
              required 
              className="pl-10 h-12"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Resmi Institusi</Label>
        <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              id="email" 
              type="email" 
              placeholder="panitia@domain.com" 
              required 
              className="pl-10 h-12"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
                id="password" 
                type="password" 
                placeholder="Minimal 6 karakter"
                required 
                className="pl-10 h-12"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="Masukkan ulang password"
                required 
                className="pl-10 h-12"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full bg-[#12b3d6] hover:bg-[#0fa0bf] h-12 text-base font-semibold mt-4" disabled={isLoading}>
        {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
      </Button>

      <div className="text-center text-sm text-gray-600 mt-6 pt-6 border-t border-gray-100">
        Sudah memiliki akun? <Link to="/login" className="text-[#12b3d6] hover:underline font-semibold">Masuk di sini</Link>
      </div>
    </form>
  );
};