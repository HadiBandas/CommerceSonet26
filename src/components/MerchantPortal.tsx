import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Store,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  Coins,
  Package,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronDown,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { Product } from '../types';

export const MerchantPortal: React.FC = () => {
  const {
    merchants,
    activeMerchantId,
    setActiveMerchantId,
    products,
    toggleProductStock,
    updateProductPrice,
    toggleMerchantOpen,
    bulkImportProducts,
    orders,
    transitionOrderStatus,
    triggerSimulatedAlert,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'catalog' | 'reports'>('orders');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPriceValue, setNewPriceValue] = useState<number>(0);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [bulkCsvText, setBulkCsvText] = useState<string>(
    `Nama Produk,Harga,Kategori,Deskripsi
Kopi Susu Regal,26000,Kopi,Espresso dengan susu kental manis dan biskuit Marie Regal
Roti Srikaya Panggang,18000,Pastry,Roti tawar bakar selai srikaya telur bebek pandan
Donat Keju Gurih,14000,Pastry,Donat kentang dengan parutan keju edam melimpah`
  );

  const currentMerchant = merchants.find((m) => m.id === activeMerchantId) || merchants[0];
  const merchantProducts = products.filter((p) => p.merchant_id === currentMerchant.id);

  // Orders for this merchant
  const merchantOrders = orders.filter((o) => o.merchant_id === currentMerchant.id);
  const pendingOrders = merchantOrders.filter((o) => o.status === 'paid');
  const inProgressOrders = merchantOrders.filter(
    (o) => o.status === 'merchant_accepted' || o.status === 'processing'
  );
  const readyOrders = merchantOrders.filter((o) => o.status === 'ready_for_pickup');
  const completedOrders = merchantOrders.filter(
    (o) => o.status === 'completed' || o.status === 'delivered'
  );

  // Financials
  const totalGMV = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalCommission = Math.round(totalGMV * currentMerchant.commission_rate);
  const netPayout = totalGMV - totalCommission;

  const handleSavePrice = (productId: string) => {
    updateProductPrice(productId, newPriceValue);
    setEditingPriceId(null);
  };

  const handleProcessBulkImport = () => {
    try {
      const lines = bulkCsvText.trim().split('\n');
      const imported: Partial<Product>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols.length >= 2) {
          imported.push({
            name: cols[0]?.trim(),
            price: parseInt(cols[1]?.trim() || '15000', 10),
            category: cols[2]?.trim() || 'Menu Tambahan',
            description: cols[3]?.trim() || 'Menu spesial dari merchant',
          });
        }
      }

      if (imported.length > 0) {
        bulkImportProducts(currentMerchant.id, imported);
        alert(`Berhasil mengimpor ${imported.length} produk ke katalog merchant!`);
        setIsBulkModalOpen(false);
      } else {
        alert('Format CSV tidak valid. Pastikan ada baris data setelah header.');
      }
    } catch (e) {
      alert('Gagal memproses data CSV.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header & Merchant Switcher */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">
                  Portal UMKM Mitra
                </span>
                <span className="text-xs text-slate-400">Komisi: {currentMerchant.commission_rate * 100}%</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <select
                  value={currentMerchant.id}
                  onChange={(e) => setActiveMerchantId(e.target.value)}
                  className="text-base font-bold text-slate-900 bg-transparent hover:bg-slate-50 rounded-lg pr-4 py-0.5 focus:outline-none cursor-pointer"
                  aria-label="Pilih merchant untuk dikelola"
                >
                  {merchants.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.category_label})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Open/Close Store Toggle (FR-B3) */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right">
              <p className="text-[11px] text-slate-500">Status Toko</p>
              <span
                className={`text-xs font-bold ${
                  currentMerchant.is_open ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {currentMerchant.is_open ? 'Menerima Order' : 'Tutup Sementara'}
              </span>
            </div>
            <button
              onClick={() => toggleMerchantOpen(currentMerchant.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                currentMerchant.is_open
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {currentMerchant.is_open ? 'Tutup Toko' : 'Buka Toko'}
            </button>
          </div>
        </div>

        {/* Sonnet Fiber Internet Connection Card (Wajib Pelanggan Sonnet) */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-4.5 border border-blue-700/60 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold text-white">
                  Mitra Resmi Terkoneksi Sonnet Fiber
                </span>
                <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-2 py-0.2 rounded-full">
                  Status: Online & Menerima Order
                </span>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 border border-blue-400/30 font-bold px-2 py-0.2 rounded-full">
                  Wajib Sonnet Partner
                </span>
              </div>
              <p className="text-[11px] text-blue-200 mt-1">
                ID Pelanggan Bisnis:{' '}
                <strong className="font-mono text-white bg-blue-950 px-1.5 py-0.5 rounded border border-blue-700/60">
                  {currentMerchant.sonnet_customer_id || 'SNT-BIZ-BB01'}
                </strong>{' '}
                • Layanan: <span className="text-amber-200 font-semibold">{currentMerchant.sonnet_plan || 'Sonnet Fiber Biz Pro 100 Mbps'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end text-[11px] bg-slate-900/80 border border-slate-700/80 px-3.5 py-2 rounded-2xl">
            <div>
              <span className="text-slate-400 block text-[10px]">Latensi Dispatch:</span>
              <span className="text-emerald-400 font-bold">4 ms (SLA &lt; 5 Menit)</span>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px]">SLA Jaringan:</span>
              <span className="text-blue-300 font-bold">99.8% Uptime</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Pesanan Masuk</span>
            {pendingOrders.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {pendingOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'catalog'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Katalog & Stok ({merchantProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Laporan & Payout</span>
          </button>
        </div>

        {/* TAB 1: ORDERS & INBOX (FR-B4 & FR-B5) */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Urgent Pending Orders (Countdown Simulation) */}
            {pendingOrders.length > 0 && (
              <div className="bg-amber-500/10 border-2 border-amber-400 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                    <h3 className="text-sm font-black text-amber-950 uppercase tracking-wider">
                      Pesanan Baru Menunggu Konfirmasi ({pendingOrders.length})
                    </h3>
                  </div>
                  <span className="text-xs bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded-lg">
                    Batas Respon: 5 Menit (SLA Ops)
                  </span>
                </div>

                <div className="space-y-3">
                  {pendingOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white rounded-2xl p-4 border border-amber-300 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900">
                            {ord.id}
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                            Terbayar via QRIS
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 mt-1">
                          Pemesan: {ord.customer_name} ({ord.customer_phone})
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {ord.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                        </p>
                        {ord.notes && (
                          <p className="text-[11px] text-amber-800 italic mt-1 bg-amber-50 p-1 rounded">
                            Catatan: "{ord.notes}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <button
                          onClick={() => {
                            transitionOrderStatus(
                              ord.id,
                              'merchant_accepted',
                              'merchant',
                              currentMerchant.id
                            );
                            triggerSimulatedAlert({
                              recipient: 'customer',
                              recipientName: ord.customer_name,
                              phone: ord.customer_phone,
                              channel: 'whatsapp',
                              title: 'Merchant Telah Menerima Pesanan!',
                              message: `${currentMerchant.name} telah menerima pesanan Anda dan mulai memasak.`,
                            });
                          }}
                          className="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition"
                        >
                          ✓ Terima Pesanan
                        </button>

                        <button
                          onClick={() => {
                            const reason = prompt('Masukkan alasan penolakan pesanan:', 'Bahan habis');
                            if (reason) {
                              transitionOrderStatus(
                                ord.id,
                                'cancelled',
                                'merchant',
                                currentMerchant.id,
                                reason
                              );
                            }
                          }}
                          className="bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-bold px-3 py-2.5 rounded-xl transition border border-slate-200"
                        >
                          Tolak
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* In-Progress Orders */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Pesanan Sedang Diproses / Siap Diambil
              </h3>

              {inProgressOrders.length === 0 && readyOrders.length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-xs">
                  Tidak ada pesanan aktif saat ini.
                </p>
              ) : (
                <div className="space-y-3">
                  {[...inProgressOrders, ...readyOrders].map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900">
                            {ord.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              ord.status === 'ready_for_pickup'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {ord.status === 'ready_for_pickup'
                              ? 'SIAP DIJEMPUT KURIR'
                              : 'SEDANG DISIAPKAN'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 mt-1">
                          {ord.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Total: Rp {ord.subtotal.toLocaleString('id-ID')}
                        </p>
                      </div>

                      <div>
                        {ord.status === 'merchant_accepted' && (
                          <button
                            onClick={() =>
                              transitionOrderStatus(
                                ord.id,
                                'processing',
                                'merchant',
                                currentMerchant.id
                              )
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                          >
                            Mulai Memasak / Siapkan
                          </button>
                        )}
                        {ord.status === 'processing' && (
                          <button
                            onClick={() =>
                              transitionOrderStatus(
                                ord.id,
                                'ready_for_pickup',
                                'merchant',
                                currentMerchant.id
                              )
                            }
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                          >
                            Tandai Makanan Siap Diambil
                          </button>
                        )}
                        {ord.status === 'ready_for_pickup' && (
                          <span className="text-xs text-slate-500 italic">
                            Menunggu penugasan & pickup kurir dari Ops Console...
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CATALOG & STOCK (FR-B2 & FR-B7) */}
        {activeTab === 'catalog' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Katalog Produk ({currentMerchant.name})
                </h3>
                <p className="text-xs text-slate-500">
                  Kelola ketersediaan stok seketika dan sesuaikan harga jual tanpa ribet.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBulkModalOpen(true)}
                  className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Impor Massal CSV (FR-B7)</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {merchantProducts.map((p) => (
                <div
                  key={p.id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.photo}
                      alt={p.name}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{p.name}</h4>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        {p.category}
                      </span>

                      {/* Price editor */}
                      <div className="mt-1">
                        {editingPriceId === p.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={newPriceValue}
                              onChange={(e) => setNewPriceValue(Number(e.target.value))}
                              className="w-24 bg-white border border-blue-400 rounded px-2 py-0.5 text-xs font-bold"
                            />
                            <button
                              onClick={() => handleSavePrice(p.id)}
                              className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded"
                            >
                              Simpan
                            </button>
                            <button
                              onClick={() => setEditingPriceId(null)}
                              className="text-[10px] text-slate-500 px-1"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingPriceId(p.id);
                              setNewPriceValue(p.price);
                            }}
                            className="flex items-center gap-1 text-xs font-extrabold text-blue-700 hover:underline"
                          >
                            <span>Rp {p.price.toLocaleString('id-ID')}</span>
                            <Edit2 className="w-3 h-3 text-slate-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stock Toggle (FR-B2) */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => toggleProductStock(p.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        p.in_stock
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {p.in_stock ? 'Tersedia (In Stock)' : 'Habis (Out of Stock)'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: REPORTS & SETTLEMENTS (FR-B6) */}
        {activeTab === 'reports' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <p className="text-xs text-slate-500">Gross Merchandise Value (GMV)</p>
                <h4 className="text-xl font-black text-slate-900 mt-1">
                  Rp {totalGMV.toLocaleString('id-ID')}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Dari {completedOrders.length} order selesai
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <p className="text-xs text-slate-500">
                  Komisi Platform Sonnet ({currentMerchant.commission_rate * 100}%)
                </p>
                <h4 className="text-xl font-black text-amber-600 mt-1">
                  Rp {totalCommission.toLocaleString('id-ID')}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">Dipotong otomatis dari GMV</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <p className="text-xs text-slate-500">Estimasi Bersih Payout Merchant</p>
                <h4 className="text-xl font-black text-emerald-600 mt-1">
                  Rp {netPayout.toLocaleString('id-ID')}
                </h4>
                <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                  Jadwal transfer: H+1 sore
                </p>
              </div>
            </div>

            {/* Orders Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Riwayat Transaksi Merchant
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {merchantOrders.map((o) => (
                  <div key={o.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-slate-900">{o.id}</span>
                      <p className="text-[11px] text-slate-500">
                        {o.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        Rp {o.subtotal.toLocaleString('id-ID')}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-semibold">
                        Bersih: Rp{' '}
                        {(o.subtotal * (1 - currentMerchant.commission_rate)).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bulk Import Modal (FR-B7) */}
        {isBulkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Impor Massal Produk via CSV (FR-B7)
                </h3>
                <button
                  onClick={() => setIsBulkModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 text-sm"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fitur percepatan onboarding 20 merchant per pilot zone. Masukkan data berformat CSV:
                <code className="block bg-slate-100 p-2 rounded mt-1 font-mono text-[10px]">
                  Nama Produk,Harga,Kategori,Deskripsi
                </code>
              </p>

              <textarea
                rows={6}
                value={bulkCsvText}
                onChange={(e) => setBulkCsvText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                aria-label="CSV input data"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  onClick={handleProcessBulkImport}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  Impor ke Katalog
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
