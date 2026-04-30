/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useLayanan } from '@/hooks/useLayanan';
import { useTransactions } from '@/hooks/useTransactions';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package, ShoppingCart, X, CreditCard, ScanFace } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatRupiah = (number: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);

type PaymentMethod = 'Bank Transfer' | 'QRIS' | '';

export default function LayananCatalogPage() {
  const { layanans, fetchClientLayanans, isLoading } = useLayanan();
  const { createTransaction } = useTransactions();
  const navigate = useNavigate();

  const [selectedLayanan, setSelectedLayanan] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClientLayanans(1, '', '', '');
  }, [fetchClientLayanans]);

  const activeLayanans = layanans.filter((l) => l.is_active);

  const openModal = (layanan: any) => {
    setSelectedLayanan(layanan);
    setPaymentMethod('');
  };

  const closeModal = () => setSelectedLayanan(null);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLayanan || !paymentMethod) return;
    setIsSubmitting(true);
    try {
      await createTransaction({ layanan_id: selectedLayanan.id, payment_method: paymentMethod });
      closeModal();
      navigate('/dashboard/transactions');
    } catch {
      alert('Gagal memproses pesanan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Pilih Paket E-Voting
          </h1>
          <p className="text-gray-500 mt-2 text-base md:text-lg max-w-xl">
            Platform transparan dan aman untuk segala skala pemilihan. Sesuaikan dengan kebutuhan instansi Anda.
          </p>
        </div>
      </div>

      {/* States */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-gray-100 shadow-soft">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#12b3d6] rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Memuat katalog paket...</p>
        </div>
      ) : activeLayanans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-gray-100 shadow-soft text-center px-6">
          <div className="w-24 h-24 bg-cyan-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-cyan-100">
            <Package size={48} className="text-[#12b3d6]" />
          </div>
          <h3 className="font-extrabold text-gray-900 text-2xl mb-2">Belum Ada Paket Tersedia</h3>
          <p className="text-gray-500 text-base max-w-md">
            Admin belum menambahkan paket layanan yang aktif. Silakan cek kembali nanti.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeLayanans.map((layanan) => {
            const isFree = layanan.price === 0;
            const features = layanan.features
              ? layanan.features.split(',').map((f: string) => f.trim())
              : [];
            return (
              <PlanCard
                key={layanan.id}
                layanan={layanan}
                isFree={isFree}
                features={features}
                onSelect={() => openModal(layanan)}
              />
            );
          })}
        </div>
      )}

      {/* Checkout modal */}
      {selectedLayanan && (
        <CheckoutModal
          layanan={selectedLayanan}
          paymentMethod={paymentMethod}
          isSubmitting={isSubmitting}
          onPaymentChange={setPaymentMethod}
          onClose={closeModal}
          onSubmit={handleCheckout}
        />
      )}
    </div>
  );
}

/* ─── Plan card ──────────────────────────────────────────── */

function PlanCard({
  layanan,
  isFree,
  features,
  onSelect,
}: {
  layanan: any;
  isFree: boolean;
  features: string[];
  onSelect: () => void;
}) {
  return (
    <div className="group bg-white border-2 border-gray-100 hover:border-[#12b3d6]/30 rounded-3xl p-6 flex flex-col justify-between shadow-soft hover:shadow-xl transition-all duration-300">

      {/* Badge row */}
      <div className="flex items-center justify-between mb-4 min-h-[28px]">
        {isFree ? (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-100">
            Uji coba
          </span>
        ) : (
          <span />
        )}
      </div>

      {/* Name + price */}
      <div className="mb-4">
        <p className="text-base font-extrabold text-gray-900 mb-3">{layanan.name}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-gray-900">
            {isFree ? 'Gratis' : formatRupiah(layanan.price)}
          </span>
          {!isFree && <span className="text-xs text-gray-400 font-medium">/ event</span>}
        </div>
      </div>

      {/* DPT chip */}
      <span className="w-fit text-[11px] font-bold px-2.5 py-1 rounded-lg bg-gray-50 text-gray-500 border border-gray-100 mb-4">
        Maks. {layanan.limit_dpt.toLocaleString('id-ID')} pemilih
      </span>

      <hr className="border-gray-100 mb-4" />

      {/* Features */}
      <ul className="flex flex-col gap-2.5 flex-1 mb-6">
        {layanan.is_face_recognition && (
          <li className="flex items-start gap-2.5 bg-cyan-50 rounded-xl px-3 py-2">
            <ScanFace size={14} className="text-cyan-600 shrink-0 mt-0.5" />
            <span className="text-xs font-bold text-cyan-700 leading-tight">
              Verifikasi wajah biometrik
            </span>
          </li>
        )}
        {features.map((feat, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-xs text-gray-500 leading-tight">{feat}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        onClick={onSelect}
        className={`w-full rounded-xl text-xs font-bold h-11 transition-all hover:-translate-y-0.5 ${
          isFree
            ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-md'
            : 'bg-[#12b3d6] hover:bg-[#0fa0bf] text-white shadow-lg shadow-cyan-200/50'
        }`}
      >
        <ShoppingCart size={14} className="mr-2" />
        {isFree ? 'Mulai sekarang' : 'Beli paket'}
      </Button>
    </div>
  );
}

/* ─── Checkout modal ─────────────────────────────────────── */

const PAYMENT_OPTIONS = [
  { value: 'Bank Transfer', label: 'Transfer bank', sub: 'BCA, Mandiri, BNI' },
  { value: 'QRIS',          label: 'QRIS',          sub: 'Scan otomatis' },
] as const;

function CheckoutModal({
  layanan,
  paymentMethod,
  isSubmitting,
  onPaymentChange,
  onClose,
  onSubmit,
}: {
  layanan: any;
  paymentMethod: PaymentMethod;
  isSubmitting: boolean;
  onPaymentChange: (v: PaymentMethod) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
          <span className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <CreditCard size={20} className="text-[#12b3d6]" />
            Checkout Pesanan
          </span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-2.5 border border-gray-200 shadow-sm transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form id="checkout-form" onSubmit={onSubmit}>
          <div className="p-8 space-y-5">

            {/* Summary */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Paket terpilih</p>
              <p className="text-base font-extrabold text-gray-900">{layanan.name}</p>
              <div className="flex items-end justify-between mt-4">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total tagihan</p>
                  <p className="text-2xl font-extrabold text-[#12b3d6]">{formatRupiah(layanan.price)}</p>
                </div>
                <span className="text-xs font-bold text-gray-500 bg-white border border-gray-100 rounded-xl px-3 py-1.5">
                  {layanan.limit_dpt.toLocaleString('id-ID')} DPT
                </span>
              </div>
            </div>

            {/* Payment method */}
            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-700">Metode pembayaran</p>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_OPTIONS.map(({ value, label, sub }) => (
                  <label
                    key={value}
                    className={`flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === value
                        ? 'border-[#12b3d6] bg-cyan-50/50'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={value}
                      className="hidden"
                      onChange={() => onPaymentChange(value)}
                    />
                    <span className="text-sm font-bold text-gray-900">{label}</span>
                    <span className="text-xs text-gray-400 mt-0.5">{sub}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
            <Button
              type="button"
              variant="outline"
              className="h-12 px-6 rounded-xl font-medium"
              onClick={onClose}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!paymentMethod || isSubmitting}
              className="h-12 px-8 rounded-xl bg-[#12b3d6] hover:bg-[#0fa0bf] shadow-md shadow-cyan-200/50 font-bold disabled:opacity-50"
            >
              {isSubmitting ? 'Memproses...' : 'Buat Pesanan'}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}