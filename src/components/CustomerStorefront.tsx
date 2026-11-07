import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Merchant, Product } from '../types';
import {
  MapPin,
  Search,
  Star,
  Clock,
  Bike,
  Plus,
  Minus,
  Check,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  Gift,
  Coins,
} from 'lucide-react';

interface CustomerStorefrontProps {
  onOpenCart: () => void;
  onOpenTracking: () => void;
}

export const CustomerStorefront: React.FC<CustomerStorefrontProps> = ({
  onOpenCart,
  onOpenTracking,
}) => {
  const {
    merchants,
    products,
    cart,
    cartMerchant,
    addToCart,
    cartSubtotal,
    activeZoneId,
    zones,
    customerAddress,
    setCustomerAddress,
    isInsideActiveZone,
    setIsInsideActiveZone,
    isSonnetVerified,
    setIsSonnetVerified,
    customerSonnetId,
    setCustomerSonnetId,
    customerSonnetPoints,
    linkSonnetId,
  } = useApp();

  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSonnetModal, setShowSonnetModal] = useState<boolean>(false);
  const [sonnetInputText, setSonnetInputText] = useState<string>('SNT-882104');

  // Active Zone
  const currentZone = zones.find((z) => z.id === activeZoneId);

  // Categories
  const categories = [
    { id: 'all', label: 'Semua Kategori' },
    { id: 'fnb', label: '🍜 Kuliner & Kopi' },
    { id: 'groceries', label: '🛒 Sembako & Sayur' },
    { id: 'pharmacy', label: '💊 Farmasi & Obat' },
    { id: 'services', label: '💧 Air Galon & Layanan' },
    { id: 'retail', label: '📦 Retail & ATK' },
  ];

  // Filter merchants in active zone
  const zoneMerchants = useMemo(() => {
    return merchants.filter((m) => {
      const matchZone = m.zone_id === activeZoneId;
      const matchCategory = selectedCategory === 'all' || m.category === selectedCategory;
      const matchSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category_label.toLowerCase().includes(searchQuery.toLowerCase());
      return matchZone && matchCategory && matchSearch;
    });
  }, [merchants, activeZoneId, selectedCategory, searchQuery]);

  // Products of selected merchant
  const merchantProducts = useMemo(() => {
    if (!selectedMerchant) return [];
    return products.filter((p) => p.merchant_id === selectedMerchant.id);
  }, [selectedMerchant, products]);

  const handleAddToCart = (product: Product) => {
    const res = addToCart(product, 1);
    if (!res.success) {
      alert(res.error);
    } else {
      setToastMessage(`"${product.name}" ditambahkan ke keranjang`);
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Hero & Zone Verification Banner (FR-A1) */}
      <div className="bg-gradient-to-b from-blue-900 via-slate-900 to-slate-900 text-white pt-8 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Sonnet First Order Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 px-3 py-1 rounded-full text-xs text-amber-300 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">Voucher Khusus Warga & Pelanggan Sonnet:</span>
            <span>Diskon Rp 25.000 Pesanan Pertama</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Belanja dari Toko & UMKM Sekitar,
            <br />
            <span className="text-amber-400">Diantar Kurir Concierge Sonnet.</span>
          </h2>
          <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
            Dukung 20 UMKM lokal di micro-zone Buah Batu. Ongkir transparan, harga asli toko, dan
            pengantaran cepat tanpa biaya tersembunyi.
          </p>

          {/* Micro-Zone Address Check Input (FR-A1) */}
          <div className="mt-6 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2.5 w-full bg-white text-slate-900 px-3.5 py-2.5 rounded-xl">
              <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Masukkan alamat atau jalan Anda..."
                className="w-full text-xs md:text-sm font-medium focus:outline-none"
                aria-label="Alamat pengantaran Anda"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={() => setIsInsideActiveZone(true)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isInsideActiveZone
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-white/20 text-slate-200 hover:bg-white/30'
                }`}
                aria-pressed={isInsideActiveZone}
              >
                Dalam Zona Pilot
              </button>
              <button
                onClick={() => {
                  setIsInsideActiveZone(false);
                  setWaitlistSubmitted(false);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  !isInsideActiveZone
                    ? 'bg-rose-600 text-white shadow'
                    : 'bg-white/20 text-slate-200 hover:bg-white/30'
                }`}
                aria-pressed={!isInsideActiveZone}
              >
                Luar Zona (Simulasi)
              </button>
            </div>
          </div>

          {/* Out of Zone Notice with Waitlist (FR-A1) */}
          {!isInsideActiveZone && (
            <div className="mt-4 bg-amber-500/10 border border-amber-400/40 rounded-xl p-4 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-300">
                    Alamat Anda berada di luar micro-zone aktif pilot Fase 0.
                  </p>
                  <p className="text-slate-300 mt-0.5">
                    Saat ini layanan concierge aktif hanya melayani koridor Buah Batu, Turangga, dan
                    Cijagra (radius 3.5 km).
                  </p>
                </div>
              </div>

              {waitlistSubmitted ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/60 px-3 py-2 rounded-lg shrink-0">
                  <Check className="w-4 h-4" />
                  <span>Terdaftar di Waitlist!</span>
                </div>
              ) : (
                <button
                  onClick={() => setWaitlistSubmitted(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3.5 py-2 rounded-lg shrink-0 transition"
                >
                  Daftarkan Zona Saya ke Waitlist
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        {/* Category Pills & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === c.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
                aria-pressed={selectedCategory === c.id}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari toko atau makanan..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="Cari toko atau makanan"
            />
          </div>
        </div>

        {/* Pilot Verification & Sonnet Loyalty Rewards Banner */}
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Semua {zoneMerchants.length} Merchant Mitra Wajib Terkoneksi Sonnet Fiber
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full">
                  SLA Online 99.8%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Micro-zone {currentZone?.name.split('—')[0]} • Menjamin order diterima cepat tanpa gangguan sinyal
              </p>
            </div>
          </div>

          {/* Customer Sonnet Status & Loyalty Points */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            {customerSonnetId ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <div>
                    <span className="text-[10px] text-slate-500 block leading-tight">Poin Sonnet Saya</span>
                    <strong className="text-xs font-extrabold text-blue-700">
                      {customerSonnetPoints.toLocaleString('id-ID')} Poin
                    </strong>
                  </div>
                </div>
                <div className="h-6 w-px bg-slate-300" />
                <span className="text-[11px] font-mono font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded">
                  {customerSonnetId}
                </span>
                <button
                  onClick={() => setShowSonnetModal(true)}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline"
                >
                  Ubah
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Mode Tamu (Tanpa ID Sonnet)</span>
                <button
                  onClick={() => setShowSonnetModal(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs transition"
                >
                  <Gift className="w-3 h-3 text-amber-300" />
                  <span>+ Tambah ID Sonnet (Dapat Poin)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Merchant Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {zoneMerchants.map((merchant) => {
            const hasItemsInCart = cartMerchant?.id === merchant.id;
            return (
              <div
                key={merchant.id}
                onClick={() => setSelectedMerchant(merchant)}
                className={`group bg-white rounded-2xl border transition-all cursor-pointer overflow-hidden flex flex-col hover:shadow-md ${
                  hasItemsInCart
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Photo & Badge */}
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  <img
                    src={merchant.image}
                    alt={merchant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {merchant.category_label}
                    </span>
                    <span className="bg-blue-950/85 backdrop-blur-xs text-blue-200 border border-blue-400/30 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                      <span>Sonnet Fiber</span>
                    </span>
                    {hasItemsInCart && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Keranjang Aktif
                      </span>
                    )}
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs ${
                        merchant.is_open
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-rose-500/90 text-white'
                      }`}
                    >
                      {merchant.is_open ? 'BUKA' : 'TUTUP'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition leading-snug">
                        {merchant.name}
                      </h3>
                      <div className="flex items-center gap-1 text-amber-500 shrink-0 text-xs font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{merchant.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{merchant.description}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{merchant.hours}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-700 font-semibold">
                      <Bike className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ongkir ~Rp 6.000</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Merchant Detail Modal with Catalog (FR-A2) */}
      {selectedMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="relative h-44 bg-slate-900">
              <img
                src={selectedMerchant.image}
                alt={selectedMerchant.name}
                className="w-full h-full object-cover opacity-80"
              />
              <button
                onClick={() => setSelectedMerchant(null)}
                className="absolute top-4 right-4 bg-slate-900/70 hover:bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center transition"
                aria-label="Tutup katalog merchant"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {selectedMerchant.category_label}
                </span>
                <h2 className="text-xl font-extrabold mt-1">{selectedMerchant.name}</h2>
                <p className="text-xs text-slate-200">{selectedMerchant.address}</p>
              </div>
            </div>

            {/* Merchant Details Bar */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-4 h-4 fill-current text-amber-500" />
                  {selectedMerchant.rating} ({selectedMerchant.review_count} ulasan)
                </span>
                <span>•</span>
                <span>Radius Antar: {selectedMerchant.radius_m / 1000} km</span>
              </div>
              <span className="text-slate-500">Komisi platform: {selectedMerchant.commission_rate * 100}%</span>
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Daftar Menu & Produk
              </h3>
              {merchantProducts.length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-xs">
                  Belum ada produk untuk merchant ini.
                </p>
              ) : (
                merchantProducts.map((product) => {
                  const cartItem = cart.find(
                    (i) => i.product.id === product.id && i.product.merchant_id === selectedMerchant.id
                  );
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-4 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition"
                    >
                      <img
                        src={product.photo}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover shrink-0 bg-slate-100"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-xs truncate">{product.name}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {product.description}
                        </p>
                        <p className="text-xs font-extrabold text-blue-700 mt-1">
                          Rp {product.price.toLocaleString('id-ID')}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {!product.in_stock ? (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                            Stok Habis
                          </span>
                        ) : cartItem ? (
                          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg">
                            <button
                              onClick={() => addToCart(product, -1)}
                              className="w-5 h-5 flex items-center justify-center rounded text-blue-700 hover:bg-blue-100"
                              aria-label="Kurangi kuantitas"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-blue-900 px-1">
                              {cartItem.quantity}
                            </span>
                            <button
                              onClick={() => addToCart(product, 1)}
                              className="w-5 h-5 flex items-center justify-center rounded text-blue-700 hover:bg-blue-100"
                              aria-label="Tambah kuantitas"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500">Aturan Fase 0:</p>
                <p className="text-xs font-semibold text-slate-700">1 Keranjang = 1 Merchant</p>
              </div>
              <button
                onClick={() => {
                  setSelectedMerchant(null);
                  if (cart.length > 0) onOpenCart();
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                {cart.length > 0 ? 'Lihat Keranjang' : 'Tutup'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart Bar (FR-A3) */}
      {cart.length > 0 && cartMerchant && (
        <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto z-30 animate-in slide-in-from-bottom-4 duration-200">
          <div className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-4 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center relative">
                <ShoppingBag className="w-5 h-5 text-white" />
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-xs">
                  {cartMerchant.name}
                </p>
                <p className="text-xs text-amber-400 font-extrabold">
                  Rp {cartSubtotal.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <button
              onClick={onOpenCart}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition"
            >
              <span>Periksa Pesanan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Hubungkan / Ubah ID Sonnet (Opsional bagi Pelanggan) */}
      {showSonnetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Zap className="w-4 h-4 fill-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    ID Pelanggan Sonnet Fiber (Opsional)
                  </h3>
                  <p className="text-[11px] text-slate-500">Dapatkan Poin Loyalitas & Voucher Rp 25.000</p>
                </div>
              </div>
              <button
                onClick={() => setShowSonnetModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Memasukkan ID internet Sonnet bersifat opsional. Jika dihubungkan, Anda langsung mendapatkan{' '}
              <strong>+500 Poin Loyalitas</strong> dan poin tambahan di setiap order. Jika bukan pelanggan Sonnet, Anda tetap dapat memesan normal sebagai tamu.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">ID Pelanggan Sonnet:</label>
              <input
                type="text"
                value={sonnetInputText}
                onChange={(e) => setSonnetInputText(e.target.value)}
                placeholder="Contoh: SNT-882104"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <div className="flex items-center gap-2 pt-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSonnetInputText('SNT-882104')}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-medium transition"
                >
                  Contoh: SNT-882104
                </button>
                <button
                  type="button"
                  onClick={() => setSonnetInputText('')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-lg font-medium transition"
                >
                  Kosongkan (Mode Tamu)
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowSonnetModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  linkSonnetId(sonnetInputText);
                  setShowSonnetModal(false);
                  setToastMessage(
                    sonnetInputText.trim()
                      ? `ID ${sonnetInputText} terhubung! +500 Poin berhasil ditambahkan.`
                      : 'Mode Tamu aktif (tanpa ID Sonnet).'
                  );
                  setTimeout(() => setToastMessage(null), 3500);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow transition flex items-center gap-1.5"
              >
                <span>Simpan & Terapkan</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 animate-in fade-in duration-150">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
