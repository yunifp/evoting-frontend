/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Receipt, Clock, CheckCircle2, XCircle, CreditCard, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '@/lib/axios';

declare global {
  interface Window {
    snap: any;
  }
}

const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short"
  }).format(new Date(dateString));
};

export default function ClientTransactionPage() {
  const { transactions, getMyTransactions, isLoading } = useTransactions();
  const [isSnapLoaded, setIsSnapLoaded] = useState(false);

  useEffect(() => {
    getMyTransactions();
  }, [getMyTransactions]);

  useEffect(() => {
    const loadMidtransScript = async () => {
      try {
        const res = await api.get('/client/settings/midtrans');
        const { client_key, is_production } = res.data;

        const snapScriptId = 'midtrans-snap-script';
        if (!document.getElementById(snapScriptId)) {
          const script = document.createElement('script');
          script.id = snapScriptId;
          script.src = is_production 
            ? 'https://app.midtrans.com/snap/snap.js' 
            : 'https://app.sandbox.midtrans.com/snap/snap.js';
          script.setAttribute('data-client-key', client_key);
          script.onload = () => setIsSnapLoaded(true);
          document.body.appendChild(script);
        } else {
          setIsSnapLoaded(true);
        }
      } catch (error) {
        console.error("Gagal memuat konfigurasi Midtrans", error);
      }
    };

    loadMidtransScript();
  }, []);

  const handlePay = (snapToken: string) => {
    if (!isSnapLoaded || !window.snap) {
      alert("Sistem pembayaran sedang dimuat, mohon tunggu sebentar.");
      return;
    }
    if (!snapToken) {
      alert("Token pembayaran belum tersedia. Silakan hubungi admin.");
      return;
    }

    window.snap.pay(snapToken, {
      onSuccess: function () {
        setTimeout(() => {
          getMyTransactions();
        }, 2000);
      },
      onPending: function () {
        setTimeout(() => {
          getMyTransactions();
        }, 2000);
      },
      onError: function () {
        getMyTransactions();
      },
      onClose: function () {
        getMyTransactions();
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-3xl text-white shadow-xl">
        <div>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-none mb-4 px-3 py-1 font-medium tracking-wide">
            Billing & Payment
          </Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Riwayat Transaksi</h1>
          <p className="text-gray-300 mt-2 text-base md:text-lg max-w-xl">
            Kelola tagihan, selesaikan pembayaran paket e-voting Anda, dan akses tanda terima resmi di satu tempat.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-sm border border-white/10 shrink-0">
          <ShieldCheck className="text-[#12b3d6] h-8 w-8" />
          <div>
            <p className="text-xs text-gray-400 font-medium">Secured by</p>
            <p className="font-bold text-white tracking-wide">Midtrans Payment</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-gray-100 shadow-soft">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#12b3d6] rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Menyinkronkan data transaksi...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-gray-100 shadow-soft text-center px-6">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Receipt size={48} className="text-gray-300" />
          </div>
          <h3 className="font-extrabold text-gray-900 text-2xl mb-2">Belum ada transaksi</h3>
          <p className="text-gray-500 text-base max-w-md">Anda belum melakukan pembelian paket layanan apapun.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {transactions.map((trx) => (
            <div key={trx.id} className="group bg-white border-2 border-gray-100 hover:border-gray-200 rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row gap-6 lg:items-center justify-between shadow-soft hover:shadow-hover transition-all duration-300">
              
              <div className="flex items-start gap-5 flex-1">
                <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 items-center justify-center shrink-0 shadow-inner">
                  <CreditCard className="text-gray-400 h-6 w-6" />
                </div>
                
                <div className="flex flex-col gap-1.5 w-full">
                  <div className="flex items-center justify-between lg:justify-start gap-4 w-full">
                    <span className="font-mono font-bold text-gray-400 text-xs tracking-widest uppercase">
                      ID: {trx.id.split('-')[0]}
                    </span>
                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">
                      {formatDate(trx.created_at)}
                    </span>
                  </div>
                  
                  <h3 className="font-extrabold text-xl md:text-2xl text-gray-900 mt-1">
                    {/* PERBAIKAN DI SINI: Menggunakan huruf kecil 'layanan' sesuai JSON tag backend */}
                    {trx.layanan?.name || 'Paket Tidak Diketahui'}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="border-gray-200 text-gray-600 bg-gray-50">
                      {trx.payment_method}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-gray-100 lg:hidden"></div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-6 lg:gap-2 items-start sm:items-center lg:items-end shrink-0 min-w-[200px]">
                <div className="flex flex-col items-start sm:items-end">
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Tagihan</p>
                  <span className="font-extrabold text-3xl text-gray-900 tracking-tight">
                    {formatRupiah(trx.amount)}
                  </span>
                </div>

                <div className="w-full sm:w-auto flex justify-end">
                  {trx.status === 'paid' ? (
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-sm w-full sm:w-auto justify-center text-sm">
                      <CheckCircle2 size={18} /> Lunas
                    </Badge>
                  ) : trx.status === 'failed' || trx.status === 'expired' ? (
                    <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200 px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-sm w-full sm:w-auto justify-center text-sm">
                      <XCircle size={18} /> Gagal / Kadaluarsa
                    </Badge>
                  ) : (
                    <div className="flex flex-col w-full sm:w-auto gap-3">
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 px-4 py-2 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm text-sm">
                        <Clock size={18} /> Menunggu Pembayaran
                      </Badge>
                      <Button 
                        onClick={() => handlePay(trx.snap_token)}
                        className="bg-[#12b3d6] hover:bg-[#0fa0bf] shadow-lg shadow-cyan-200/50 rounded-xl font-bold text-sm h-12 px-6 transition-all hover:-translate-y-1 w-full"
                      >
                        Bayar Sekarang <ArrowRight size={18} className="ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}