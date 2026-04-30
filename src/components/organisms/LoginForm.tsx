import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';

export const LoginForm = () => {
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Resmi Penyelenggara</Label>
        <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              id="email" 
              type="email" 
              placeholder="contoh@email.com" 
              required 
              className="pl-10 h-12"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link to="/forgot-password" className="text-sm font-medium text-[#12b3d6] hover:underline">Lupa password?</Link>
        </div>
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

      <Button type="submit" className="w-full bg-[#12b3d6] hover:bg-[#0fa0bf] h-12 text-base font-semibold" disabled={isLoading}>
        {isLoading ? 'Memproses...' : 'Masuk Sekarang'}
      </Button>

      <div className="text-center text-sm text-gray-600 mt-6 pt-6 border-t border-gray-100">
        Belum memiliki akun? <Link to="/register" className="text-[#12b3d6] hover:underline font-semibold">Daftar sebagai Penyelenggara</Link>
      </div>
    </form>
  );
};