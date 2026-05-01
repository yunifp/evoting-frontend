/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useLayananStatus } from '@/hooks/useLayananStatus';
import { Button } from '@/components/ui/button';
import { Package, CheckCircle2, ScanFace, PlusCircle, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type TabType = 'tersedia' | 'digunakan' | 'selesai';

export default function ClientLayananStatusPage() {
  const { data, isLoading, fetchStatus } = useLayananStatus();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('tersedia');

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Status Layanan
          </h1>
          <p className="text-gray-500 mt-2 text-base md:text-lg max-w-xl">
            Pantau paket layanan yang Anda miliki, sedang digunakan untuk acara, maupun yang telah selesai.
          </p>
        </div>
      </div>

      <div className="flex p-1.5 bg-gray-50 border border-gray-100 rounded-2xl w-full sm:w-fit shadow-sm overflow-x-auto">
        {(['tersedia', 'digunakan', 'selesai'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 sm:flex-none capitalize text-sm font-bold px-6 py-2.5 rounded-xl transition-all duration-200 ${
              activeTab === tab
                ? 'bg-white text-[#12b3d6] shadow-sm border border-gray-100'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
            }`}
          >
            {tab} ({data?.[tab]?.length || 0})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-gray-100 shadow-soft">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#12b3d6] rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Memuat status layanan...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data[activeTab].length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-gray-100 shadow-soft text-center px-6">
              <div className="w-24 h-24 bg-cyan-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-cyan-100">
                {activeTab === 'tersedia' && <Package size={48} className="text-[#12b3d6]" />}
                {activeTab === 'digunakan' && <Activity size={48} className="text-[#12b3d6]" />}
                {activeTab === 'selesai' && <CheckCircle2 size={48} className="text-[#12b3d6]" />}
              </div>
              <h3 className="font-extrabold text-gray-900 text-2xl mb-2">
                {activeTab === 'tersedia' && 'Belum Ada Paket Tersedia'}
                {activeTab === 'digunakan' && 'Tidak Ada Paket Digunakan'}
                {activeTab === 'selesai' && 'Belum Ada Acara Selesai'}
              </h3>
              <p className="text-gray-500 text-base max-w-md">
                {activeTab === 'tersedia' && 'Silakan beli paket layanan di menu Katalog Layanan terlebih dahulu.'}
                {activeTab === 'digunakan' && 'Anda belum menggunakan paket apapun untuk membuat acara pemilu.'}
                {activeTab === 'selesai' && 'Belum ada acara e-voting Anda yang telah berakhir atau ditutup.'}
              </p>
            </div>
          ) : (
            data[activeTab].map((item: any) => (
              <div key={item.transaction_id} className={`group bg-white border-2 border-gray-100 hover:border-[#12b3d6]/30 rounded-3xl p-6 flex flex-col justify-between shadow-soft hover:shadow-xl transition-all duration-300 ${activeTab === 'selesai' ? 'opacity-80 hover:opacity-100' : ''}`}>
                <div className="flex items-center justify-between mb-4 min-h-[28px]">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                    activeTab === 'tersedia' ? 'bg-cyan-50 text-cyan-700 border-cyan-100' :
                    activeTab === 'digunakan' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}>
                    {activeTab === 'tersedia' && 'Tersedia'}
                    {activeTab === 'digunakan' && item.pemilu_status.toUpperCase()}
                    {activeTab === 'selesai' && 'Selesai'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono tracking-wider">
                    TRX-{item.transaction_id.substring(0, 8).toUpperCase()}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-base font-extrabold text-gray-900 mb-2 leading-snug">{item.layanan.name}</p>
                  {activeTab !== 'tersedia' && (
                    <p className="text-sm font-semibold text-[#12b3d6] line-clamp-2">
                      {item.pemilu_title}
                    </p>
                  )}
                </div>

                <span className="w-fit text-[11px] font-bold px-2.5 py-1 rounded-lg bg-gray-50 text-gray-500 border border-gray-100 mb-4 flex items-center gap-1.5">
                  Maks. {item.layanan.limit_dpt.toLocaleString('id-ID')} pemilih
                </span>

                <hr className="border-gray-100 mb-4" />

                <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                  {item.layanan.is_face_recognition && (
                    <li className="flex items-start gap-2.5 bg-cyan-50 rounded-xl px-3 py-2">
                      <ScanFace size={14} className="text-cyan-600 shrink-0 mt-0.5" />
                      <span className="text-xs font-bold text-cyan-700 leading-tight">
                        Verifikasi wajah biometrik
                      </span>
                    </li>
                  )}
                </ul>

                {activeTab === 'tersedia' && (
                  <Button
                    onClick={() => navigate('/dashboard/pemilu')}
                    className="w-full rounded-xl text-xs font-bold h-11 transition-all hover:-translate-y-0.5 bg-[#12b3d6] hover:bg-[#0fa0bf] text-white shadow-lg shadow-cyan-200/50"
                  >
                    <PlusCircle size={14} className="mr-2" />
                    Buat Ruang Pemilu
                  </Button>
                )}
                {activeTab === 'digunakan' && (
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/dashboard/pemilu/${item.pemilu_id}`)}
                    className="w-full rounded-xl text-xs font-bold h-11 border-2 border-gray-200 hover:border-[#12b3d6] hover:text-[#12b3d6] transition-all"
                  >
                    Lihat Event
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}