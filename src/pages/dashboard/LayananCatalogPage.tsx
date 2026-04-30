/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useLayanan } from '@/hooks/useLayanan';
import { useTransactions } from '@/hooks/useTransactions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Package, ShoppingCart, X, CreditCard, ScanFace } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

export default function LayananCatalogPage() {
  const { layanans, fetchClientLayanans, isLoading: isLoadingLayanan } = useLayanan();
  const { createTransaction } = useTransactions();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLayanan, setSelectedLayanan] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClientLayanans(1, '', '', '');
  }, [fetchClientLayanans]);

  const activeLayanans = layanans.filter(l => l.is_active);

  const handleOpenModal = (layanan: any) => {
    setSelectedLayanan(layanan);
    setPaymentMethod('');
    setIsModalOpen(true);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLayanan || !paymentMethod) return;

    setIsSubmitting(true);
    try {
      await createTransaction({
        layanan_id: selectedLayanan.id,
        payment_method: paymentMethod
      });
      setIsModalOpen(false);
      navigate('/dashboard/transactions');
    } catch (error) {
      alert("Gagal memproses pesanan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">Pilih Paket E-Voting Anda</h1>
        <p className="text-gray-500 mt-3 text-lg">Platform transparan dan aman untuk segala skala pemilihan. Pilih paket yang paling sesuai dengan kebutuhan instansi Anda.</p>
      </div>

      {isLoadingLayanan ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-4 border-[#12b3d6] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Memuat katalog paket...</p>
        </div>
      ) : activeLayanans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm text-center px-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Package size={32} className="text-gray-300" />
          </div>
          <p className="text-gray-900 font-bold text-lg">Belum ada paket tersedia</p>
          <p className="text-gray-500 text-sm mt-1">Admin belum menambahkan paket layanan yang aktif.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
          {activeLayanans.map((layanan) => {
            const isFree = layanan.price === 0;
            const featuresList = layanan.features ? layanan.features.split(',').map((f: string) => f.trim()) : [];

            return (
              <div key={layanan.id} className="relative flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                {isFree && (
                  <div className="absolute top-0 right-0 bg-[#12b3d6] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 uppercase tracking-wider">
                    Uji Coba
                  </div>
                )}
                
                <div className="p-6 sm:p-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{layanan.name}</h3>
                  
                  <div className="my-4 flex items-baseline text-gray-900">
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                      {isFree ? 'Gratis' : formatRupiah(layanan.price)}
                    </span>
                    {!isFree && <span className="ml-1 text-sm font-medium text-gray-500">/ event</span>}
                  </div>

                  <Badge variant="secondary" className="w-fit bg-cyan-50 text-[#12b3d6] border-none mb-6 font-semibold px-3 py-1">
                    Maks. {layanan.limit_dpt.toLocaleString('id-ID')} Pemilih
                  </Badge>

                  <ul className="space-y-3 flex-1 mb-8">
                    {/* Tampilkan Biometrik Paling Atas jika Aktif */}
                    {layanan.is_face_recognition && (
                        <li className="flex items-start bg-blue-50/50 p-2 rounded-lg -ml-2">
                            <ScanFace className="h-5 w-5 text-blue-600 shrink-0 mr-3" />
                            <span className="text-sm text-blue-700 font-bold leading-tight pt-0.5">Sistem Verifikasi Wajah (Biometrik)</span>
                        </li>
                    )}
                    {featuresList.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mr-3" />
                        <span className="text-sm text-gray-600 leading-tight pt-0.5">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handleOpenModal(layanan)}
                    className={`w-full h-12 rounded-xl font-bold text-sm transition-all ${
                      isFree 
                        ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                        : 'bg-[#12b3d6] hover:bg-[#0fa0bf] shadow-lg shadow-cyan-200/50 text-white'
                    }`}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {isFree ? 'Mulai Sekarang' : 'Beli Paket'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && selectedLayanan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="text-[#12b3d6]" size={20}/>
                Checkout Pesanan
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-2 border border-gray-100 shadow-sm"><X size={16} /></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-cyan-50/50 border border-cyan-100 rounded-2xl p-4">
                <p className="text-sm text-gray-500 mb-1">Paket Terpilih</p>
                <p className="font-bold text-gray-900">{selectedLayanan.name}</p>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <p className="text-xs text-gray-500">Total Tagihan</p>
                    <p className="text-xl font-extrabold text-[#12b3d6]">{formatRupiah(selectedLayanan.price)}</p>
                  </div>
                  <Badge className="bg-white text-gray-600 border-gray-200">
                    {selectedLayanan.limit_dpt} DPT
                  </Badge>
                </div>
              </div>

              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-gray-700 font-semibold">Metode Pembayaran</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'Bank Transfer' ? 'border-[#12b3d6] bg-cyan-50/30' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input type="radio" name="payment" value="Bank Transfer" className="hidden" onChange={(e) => setPaymentMethod(e.target.value)} />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-gray-900">Transfer Bank</span>
                        <span className="text-xs text-gray-500 mt-0.5">BCA, Mandiri, BNI</span>
                      </div>
                    </label>
                    <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'QRIS' ? 'border-[#12b3d6] bg-cyan-50/30' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input type="radio" name="payment" value="QRIS" className="hidden" onChange={(e) => setPaymentMethod(e.target.value)} />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-gray-900">QRIS</span>
                        <span className="text-xs text-gray-500 mt-0.5">Scan otomatis</span>
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <Button type="button" variant="outline" className="h-11 px-6 rounded-xl" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button 
                type="submit" 
                form="checkout-form" 
                disabled={!paymentMethod || isSubmitting}
                className="h-11 px-6 rounded-xl bg-[#12b3d6] hover:bg-[#0fa0bf] shadow-md shadow-cyan-200/50 disabled:opacity-50"
              >
                {isSubmitting ? 'Memproses...' : 'Buat Pesanan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}