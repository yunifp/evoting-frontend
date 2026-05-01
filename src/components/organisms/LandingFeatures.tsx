import { ShieldCheck, Zap, UserCheck, BarChart3 } from 'lucide-react';

export function LandingFeatures() {
    const features = [
        {
            icon: <ShieldCheck size={32} className="text-[#12b3d6]" />,
            title: "Keamanan Anti-Fraud",
            description: "Sistem mendeteksi dan mencegah upaya kecurangan atau pemungutan suara ganda secara otomatis (Satu NIK, Satu Suara)."
        },
        {
            icon: <UserCheck size={32} className="text-[#12b3d6]" />,
            title: "Verifikasi Biometrik",
            description: "Mendukung teknologi Face Recognition untuk memvalidasi identitas pemilih dengan akurat sebelum masuk ke bilik suara."
        },
        {
            icon: <Zap size={32} className="text-[#12b3d6]" />,
            title: "Live Count Real-time",
            description: "Pantau perolehan suara kandidat secara langsung detik itu juga tanpa perlu menunggu proses hitung manual yang lama."
        },
        {
            icon: <BarChart3 size={32} className="text-[#12b3d6]" />,
            title: "Laporan Valid",
            description: "Unduh hasil akhir pemilihan beserta berita acara dan riwayat aktivitas pemilih dengan format dokumen yang rapi."
        }
    ];

    return (
        <section id="fitur" className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">Kenapa Memilih Kami?</h2>
                    <p className="text-lg text-gray-500 font-medium">Beresin membawa standar keamanan Enterprise ke dalam pemilihan skala organisasi Anda.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((item, index) => (
                        <div key={index} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#12b3d6] group-hover:text-white transition-all">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-3">{item.title}</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}