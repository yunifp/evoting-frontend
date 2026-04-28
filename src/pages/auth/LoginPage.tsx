import { AuthLayout } from '@/components/templates/AuthLayout';
import { LoginForm } from '@/components/organisms/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout 
      title="Selamat Datang Kembali" 
      subtitle="Masukkan email resmi dan password Anda untuk masuk ke dashboard penyelenggara klik-pilih."
    >
      <LoginForm />
    </AuthLayout>
  );
}