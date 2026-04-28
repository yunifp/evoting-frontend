import { AuthLayout } from '@/components/templates/AuthLayout';
import { RegisterForm } from '@/components/organisms/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout 
      title="Daftar Penyelenggara" 
      subtitle="Buat akun penyelenggara klik-pilih untuk mulai mengelola pemilihan umum digital yang modern."
      isRegister={true} 
    >
      <RegisterForm />
    </AuthLayout>
  );
}