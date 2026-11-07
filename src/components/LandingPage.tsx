import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import {
  ShoppingBag,
  Store,
  Bike,
  ShieldAlert,
  Coins,
  BarChart3,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  Smartphone,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Zap,
  Info,
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: (role: Role) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const {
    merchants,
    zones,
    activeZoneId,
    setActiveZoneId,
    activeMerchantId,
    setActiveMerchantId,
    activeCourierToken,
    setActiveCourierToken,
    isSonnetVerified,
    setIsSonnetVerified,
    customerSonnetId,
    setCustomerSonnetId,
    customerSonnetPoints,
    setCustomerSonnetPoints,
    couriers,
  } = useApp();

  const [selectedRoleTab, setSelectedRoleTab] = useState<Role>('customer');

  // Customer Form state
  const [customerPhone, setCustomerPhone] = useState<string>('0812-3456-7890');
  const [customerOtp, setCustomerOtp] = useState<string>('8821');
  const [inputCustomerSonnetId, setInputCustomerSonnetId] = useState<string>(customerSonnetId || 'SNT-882104');
  const [isOtpSent, setIsOtpSent] = useState<boolean>(true);
  const [consentAgreed, setConsentAgreed] = useState<boolean>(true);

  // Merchant Form state (Wajib Pelanggan Sonnet)
  const [merchantPin, setMerchantPin] = useState<string>('1234');
  const currentMerchantData = merchants.find((m) => m.id === activeMerchantId) || merchants[0];
  const [merchantSonnetIdInput, setMerchantSonnetIdInput] = useState<string>(
    currentMerchantData?.sonnet_customer_id || 'SNT-BIZ-BB01'
  );
  const [merchantAuthError, setMerchantAuthError] = useState<string | null>(null);

  // Update merchant Sonnet ID when selecting another merchant
  const handleSelectMerchant = (mId: string) => {
    setActiveMerchantId(mId);
    const m = merchants.find((item) => item.id === mId);
    if (m) {
      setMerchantSonnetIdInput(m.sonnet_customer_id);
      setMerchantAuthError(null);
    }
  };

  // Courier Form state
  const [courierTokenInput, setCourierTokenInput] = useState<string>('courier-token-004');

  const currentZone = zones.find((z) => z.id === activeZoneId) || zones[0];

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim()) {
      alert('Masukkan nomor WhatsApp Anda.');
      return;
    }
    if (!consentAgreed) {
      alert('Anda wajib menyetujui Ketentuan Privasi UU PDP.');
      return;
    }
    // Handle optional Sonnet ID for customer
    const cleanSonnetId = inputCustomerSonnetId.trim();
    if (cleanSonnetId) {
      setCustomerSonnetId(cleanSonnetId);
      setIsSonnetVerified(true);
    } else {
      setCustomerSonnetId('');
      setIsSonnetVerified(false);
    }
    onEnterApp('customer');
  };

  const handleMerchantLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setMerchantAuthError(null);
    const cleanBizId = merchantSonnetIdInput.trim().toUpperCase();
    
    // Syarat Mutlak: Merchant HARUS pengguna/pelanggan Sonnet Fiber Biz
    if (!cleanBizId || !cleanBizId.startsWith('SNT-BIZ-')) {
      setMerchantAuthError(
        'Akses Ditolak: Seluruh merchant wajib merupakan pelanggan aktif internet Sonnet Fiber Biz. Format ID Pelanggan: SNT-BIZ-BB01 s/d SNT-BIZ-BB20.'
      );
      return;
    }

    onEnterApp('merchant');
  };

  const handleCourierLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (courierTokenInput.trim()) {
      setActiveCourierToken(courierTokenInput.trim());
    }
    onEnterApp('courier');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-blue-500/20">
              S
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Sonnet Digital Ecosystem
                <span className="text-[10px] font-black uppercase bg-amber-400 text-slate-950 px-2 py-0.2 rounded">
                  Fase 0 MVP
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Pilot Micro-Zone Commerce & Concierge Delivery • Bandung
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Zona Aktif:</span>
              <strong className="text-white">{currentZone.name.split('—')[0]}</strong>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[350px] h-[200px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-amber-500/10 border border-slate-700/80 px-4 py-1.5 rounded-full text-xs text-slate-300 backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-200">Gerbang Akses Multi-Peran Pilot 4 Minggu</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400 font-bold">PRD Gate 1 Decision Engine</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight sm:leading-none">
            Pusat Ekosistem Digital <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
              Sonnet Concierge Pilot
            </span>
          </h2>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
            Membuktikan permintaan warga, suplai 20 UMKM merchant mitra, dan ekonomi per order
            (Contribution Margin ≥ 0) dalam 1 micro-zone terkontrol sebelum build aplikasi skala penuh.
          </p>

          {/* Quick Persona Launch Ribbon (Demo Explorer) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold mr-1 text-[11px] uppercase tracking-wider">
              Masuk Cepat:
            </span>
            <button
              onClick={() => onEnterApp('customer')}
              className="bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 hover:border-blue-500 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Warga / Toko</span>
            </button>
            <button
              onClick={() => onEnterApp('merchant')}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-500 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Merchant UMKM</span>
            </button>
            <button
              onClick={() => onEnterApp('courier')}
              className="bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 hover:border-purple-500 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5"
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Kurir Link Web</span>
            </button>
            <button
              onClick={() => onEnterApp('ops')}
              className="bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 hover:border-rose-500 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Ops & Dispatch</span>
            </button>
            <button
              onClick={() => onEnterApp('finance')}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 hover:border-emerald-500 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Finance Ledger</span>
            </button>
            <button
              onClick={() => onEnterApp('analytics')}
              className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Executive KPI</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Login / Persona Selection Portal Card */}
      <section className="max-w-4xl mx-auto w-full px-4 -mt-4 pb-16 flex-1">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Persona Tabs Header */}
          <div className="bg-slate-950/80 border-b border-slate-800 p-2 sm:p-3 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {[
                { id: 'customer', label: '1. Pelanggan / Warga', icon: <ShoppingBag className="w-4 h-4" /> },
                { id: 'merchant', label: '2. Merchant UMKM', icon: <Store className="w-4 h-4" /> },
                { id: 'courier', label: '3. Kurir Mitra Web', icon: <Bike className="w-4 h-4" /> },
                { id: 'ops', label: '4. Delivery & Ops', icon: <ShieldAlert className="w-4 h-4" /> },
                { id: 'finance', label: '5. Finance & Ledger', icon: <Coins className="w-4 h-4" /> },
                { id: 'analytics', label: '6. Board & KPI', icon: <BarChart3 className="w-4 h-4" /> },
              ].map((tab) => {
                const isActive = selectedRoleTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedRoleTab(tab.id as Role)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Content per Persona */}
          <div className="p-6 sm:p-8">
            {/* 1. PELANGGAN / WARGA LOGIN */}
            {selectedRoleTab === 'customer' && (
              <form onSubmit={handleCustomerLogin} className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      Login Storefront Pelanggan (OTP WhatsApp)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Sesuai FR-A5: Registrasi nomor HP dan pencatatan consent privasi UU PDP.
                    </p>
                  </div>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold px-2.5 py-1 rounded-full w-fit">
                    PWA-Ready Mobile Web
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Nomor WhatsApp / HP
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="0812-xxxx-xxxx"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Kode OTP Masuk (Simulasi)
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={customerOtp}
                        onChange={(e) => setCustomerOtp(e.target.value)}
                        placeholder="8821"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono tracking-widest focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Sonnet ISP Customer Verification (Optional with Points Reward) */}
                <div className="bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-800/80 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">
                        ID Pelanggan Sonnet Fiber (Opsional — Dapatkan Poin Loyalitas)
                      </span>
                    </div>
                    <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded">
                      +500 Poin & Diskon Rp 25.000
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Pelanggan umum dapat belanja langsung tanpa ID. Jika Anda memasukkan ID internet Sonnet di rumah,
                    Anda otomatis mendapatkan <strong>500 Poin Sonnet Rewards</strong>, voucher <strong>SONNETFIRST</strong>,
                    dan reward poin di setiap transaksi!
                  </p>

                  <div className="space-y-2">
                    <div className="relative">
                      <Zap className="w-4 h-4 text-blue-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={inputCustomerSonnetId}
                        onChange={(e) => setInputCustomerSonnetId(e.target.value)}
                        placeholder="Contoh: SNT-882104 (Boleh dikosongkan jika pembeli umum)"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-400"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setInputCustomerSonnetId('SNT-882104')}
                        className="bg-blue-900/40 hover:bg-blue-800/50 text-blue-300 border border-blue-700/60 px-2.5 py-1 rounded-lg transition"
                      >
                        ✓ Gunakan ID Demo: SNT-882104
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputCustomerSonnetId('')}
                        className="bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-700/60 px-2.5 py-1 rounded-lg transition"
                      >
                        ✕ Masuk sebagai Tamu (Tanpa ID)
                      </button>
                    </div>

                    {inputCustomerSonnetId.trim() ? (
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          <strong>ID Sonnet Terhubung:</strong> Anda mendapatkan bonus 500 Poin & berhak klaim voucher pelanggan Rp 25.000.
                        </span>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center gap-2">
                        <Info className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>
                          <strong>Mode Tamu / Non-Sonnet:</strong> Anda tetap dapat berbelanja makanan & sembako dengan normal.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* UU PDP Consent Notice (FR-A5, FR-G2) */}
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentAgreed}
                      onChange={(e) => setConsentAgreed(e.target.checked)}
                      className="mt-0.5 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      Saya menyetujui pemrosesan data nomor HP untuk notifikasi pesanan dan concierge
                      delivery sesuai <strong>Ketentuan Privasi UU PDP Sonnet (Notice v1.0)</strong>.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm py-3 rounded-2xl shadow-lg shadow-blue-600/30 transition"
                >
                  <span>
                    {inputCustomerSonnetId.trim()
                      ? 'Masuk sebagai Pelanggan Sonnet (+500 Poin Rewards)'
                      : 'Masuk sebagai Warga / Tamu Umum'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* 2. MERCHANT UMKM LOGIN (WAJIB PELANGGAN INTERNET SONNET FIBER) */}
            {selectedRoleTab === 'merchant' && (
              <form onSubmit={handleMerchantLogin} className="space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <span>Login Portal Toko / Merchant UMKM</span>
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 font-black px-2 py-0.5 rounded">
                        Wajib Pelanggan Sonnet
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Khusus bagi pelaku usaha mitra yang terdaftar pada jaringan internet Sonnet Fiber.
                    </p>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold px-2.5 py-1 rounded-full">
                    20 Merchant Pilot
                  </span>
                </div>

                {/* Sonnet Fiber Mandatory Banner for Merchants */}
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Syarat Mutlak: Wajib Pelanggan Aktif Internet Sonnet Fiber Biz</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Sistem Concierge MVP mewajibkan setiap merchant mitra berlangganan internet Sonnet Fiber untuk
                    menjamin penerimaan pesanan digital tanpa kendala jaringan (SLA respon &lt; 5 menit).
                  </p>
                </div>

                {merchantAuthError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Verifikasi Gagal</p>
                      <p className="text-[11px] mt-0.5">{merchantAuthError}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Pilih Toko / Merchant Mitra
                    </label>
                    <select
                      value={activeMerchantId}
                      onChange={(e) => handleSelectMerchant(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {merchants.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.category_label}) — Komisi {m.commission_rate * 100}%
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      ID Pelanggan Bisnis Sonnet Fiber (Wajib)
                    </label>
                    <div className="relative">
                      <Zap className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={merchantSonnetIdInput}
                        onChange={(e) => {
                          setMerchantSonnetIdInput(e.target.value);
                          setMerchantAuthError(null);
                        }}
                        placeholder="Contoh: SNT-BIZ-BB01"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-emerald-400">
                      <span>✓ Paket: {currentMerchantData.sonnet_plan || 'Sonnet Fiber Biz Pro 100 Mbps'}</span>
                      <span className="font-bold">SLA Jaringan 99.8%</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      PIN Akses Toko (Default: 1234)
                    </label>
                    <input
                      type="password"
                      value={merchantPin}
                      onChange={(e) => setMerchantPin(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    Staf Ops juga dapat masuk atas nama merchant mitra Sonnet (impersonasi tercatat di audit trail).
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm py-3 rounded-2xl shadow-lg shadow-amber-500/20 transition"
                >
                  <span>Verifikasi ID Sonnet & Buka Portal Merchant</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* 3. KURIR MITRA WEB LINK */}
            {selectedRoleTab === 'courier' && (
              <form onSubmit={handleCourierLogin} className="space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      Akses Kurir Mitra via Tautan Web (FR-C4)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Sesuai US-11: Kurir membuka tautan order tanpa perlu memasang aplikasi native.
                    </p>
                  </div>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold px-2.5 py-1 rounded-full">
                    Tanpa Driver App
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Tautan Token Tugas Kurir (One-Time Token)
                    </label>
                    <div className="relative">
                      <Bike className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={courierTokenInput}
                        onChange={(e) => setCourierTokenInput(e.target.value)}
                        placeholder="courier-token-004"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Format URL: <code>sonnet.id/c/{courierTokenInput}</code>
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Pilih Profil Kurir Siaga di Zona:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      {couriers.map((c) => (
                        <div
                          key={c.id}
                          className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-300"
                        >
                          <p className="font-bold text-white">{c.name.split(' ')[0]}</p>
                          <p className="text-[10px] text-slate-500">{c.vehicle}</p>
                          <p className="text-[10px] text-emerald-400 font-bold mt-1">
                            {c.completed_trips} trip • {c.rating}★
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm py-3 rounded-2xl shadow-lg shadow-purple-600/30 transition"
                >
                  <span>Buka Halaman Tugas Pengantaran Web</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* 4. OPS & DISPATCH */}
            {selectedRoleTab === 'ops' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      Delivery Ops & Merchant Ops Hub
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Konsol operasional harian: dispatch manual, SLA alert, dan live telematics map.
                    </p>
                  </div>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold px-2.5 py-1 rounded-full">
                    Internal Sonnet
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs text-slate-300">
                  <p className="font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Kewenangan Peran Ops:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400 text-[11px]">
                    <li>Memantau antrian order aktif dan alert waktu respon merchant (&gt;5 mnt).</li>
                    <li>Menugaskan kurir mitra dan mencatat biaya kurir aktual (`courier_cost`).</li>
                    <li>Memantau peta interaktif micro-zone dan live delivery routes.</li>
                    <li>Mengelola funnel onboarding 20 merchant mitra (Prospecting sampai Retention).</li>
                  </ul>
                </div>

                <button
                  onClick={() => onEnterApp('ops')}
                  className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm py-3 rounded-2xl shadow-lg shadow-rose-600/30 transition"
                >
                  <span>Masuk ke Ops & Dispatch Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 5. FINANCE & LEDGER */}
            {selectedRoleTab === 'finance' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      Finance & Unit Economics Portal
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Buku besar per order, rekonsiliasi gateway berizin, dan tracking Contribution Margin.
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold px-2.5 py-1 rounded-full">
                    Finance Clearance
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs text-slate-300">
                  <p className="font-bold text-white">Formula Contribution Margin Per Order:</p>
                  <code className="block bg-slate-900 p-2 rounded text-[11px] font-mono text-emerald-400">
                    CM = komisi + biaya_layanan + (ongkir - biaya_kurir) - fee_psp - subsidi_vcr - refund
                  </code>
                  <p className="text-[11px] text-slate-400">
                    Rekonsiliasi mutasi harian otomatis mencocokkan pembayaran Midtrans terhadap order internal.
                  </p>
                </div>

                <button
                  onClick={() => onEnterApp('finance')}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm py-3 rounded-2xl shadow-lg shadow-emerald-600/30 transition"
                >
                  <span>Masuk ke Buku Besar Finance & Rekonsiliasi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 6. EXECUTIVE KPI & GATE 1 BOARD */}
            {selectedRoleTab === 'analytics' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      Executive Scoreboard & Gate 1 Engine
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      8 Indikator Go/No-Go pilot, segmentasi 4.000 basis ISP, dan scorecard micro-zone.
                    </p>
                  </div>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold px-2.5 py-1 rounded-full">
                    Board Level
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500">Merchant Aktif</span>
                    <p className="font-bold text-emerald-400 mt-0.5">Target ≥ 15 (Go)</p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500">Total Order</span>
                    <p className="font-bold text-emerald-400 mt-0.5">Target ≥ 200 (Go)</p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500">CSAT Kepuasan</span>
                    <p className="font-bold text-emerald-400 mt-0.5">Target ≥ 4.2 / 5</p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500">Avg CM / Order</span>
                    <p className="font-bold text-emerald-400 mt-0.5">Target ≥ Rp 0 (Go)</p>
                  </div>
                </div>

                <button
                  onClick={() => onEnterApp('analytics')}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-sm py-3 rounded-2xl shadow-lg shadow-cyan-600/20 transition"
                >
                  <span>Buka Pilot KPI Scoreboard & Analisis Basis 4.000</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Value Pillars Footer Section */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-8 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <div className="w-4 h-4 rounded bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
              S
            </div>
            <span className="text-slate-400 font-semibold">
              Sonnet Digital Ecosystem • Micro-Zone Buah Batu Bandung (Fase 0 Concierge MVP)
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>UU PDP Compliant</span>
            <span>•</span>
            <span>Licensed PSP</span>
            <span>•</span>
            <span>4-Week Pilot Framework</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
