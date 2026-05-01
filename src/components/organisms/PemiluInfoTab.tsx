/* eslint-disable @typescript-eslint/no-explicit-any */
import { Clock } from 'lucide-react';

export function PemiluInfoTab({ pemilu }: { pemilu: any }) {
    return (
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-soft max-w-3xl">
            <h3 className="font-extrabold text-gray-900 mb-8 flex items-center gap-3 text-2xl border-b border-gray-100 pb-4">
                <Clock className="text-[#12b3d6]" size={28} /> Waktu Pelaksanaan Bilik Suara
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="w-1.5 h-full bg-emerald-400 absolute left-0 top-0"></div>
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Bilik Dibuka</span>
                    <span className="font-black text-2xl text-gray-900">{new Date(pemilu.start_date).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</span>
                </div>
                <div className="flex flex-col p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="w-1.5 h-full bg-red-400 absolute left-0 top-0"></div>
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Bilik Ditutup</span>
                    <span className="font-black text-2xl text-gray-900">{new Date(pemilu.end_date).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</span>
                </div>
            </div>
        </div>
    );
}