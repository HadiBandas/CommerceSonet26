import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  Bike,
  Store,
  Clock,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  XCircle,
  Download,
  Filter,
  ExternalLink,
  ChevronRight,
  Map,
} from 'lucide-react';
import { Order, FulfillmentMode, FunnelStage } from '../types';
import { MicroZoneMap } from './MicroZoneMap';

export const OpsConsole: React.FC = () => {
  const {
    orders,
    merchants,
    couriers,
    partners,
    manualDispatch,
    cancelOrder,
    transitionOrderStatus,
    setActiveRole,
    setActiveCourierToken,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'map' | 'dispatch' | 'funnel'>('map');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [dispatchModalOrder, setDispatchModalOrder] = useState<Order | null>(null);
  const [selectedCourierId, setSelectedCourierId] = useState<string>('cur_01');
  const [courierCostInput, setCourierCostInput] = useState<number>(6000);
  const [fulfillmentMode, setFulfillmentMode] = useState<FulfillmentMode>('courier_partner');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Cancel dialog
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('merchant_unresponsive');

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'active')
        return o.status !== 'completed' && o.status !== 'cancelled';
      return o.status === statusFilter;
    });
  }, [orders, statusFilter]);

  // SLA Alerts: Orders that need attention
  const slaAlertOrders = useMemo(() => {
    return orders.filter((o) => {
      // 1. Paid but not accepted by merchant yet
      if (o.status === 'paid') return true;
      // 2. Ready for pickup but no courier assigned
      if (o.status === 'ready_for_pickup' && !o.delivery) return true;
      return false;
    });
  }, [orders]);

  const handleExecuteDispatch = () => {
    if (!dispatchModalOrder) return;
    manualDispatch(
      dispatchModalOrder.id,
      selectedCourierId,
      courierCostInput,
      fulfillmentMode
    );
    setDispatchModalOrder(null);
  };

  const handleExecuteCancel = () => {
    if (!cancelModalOrder) return;
    cancelOrder(cancelModalOrder.id, cancelReason, 'delivery_ops@sonnet.id');
    setCancelModalOrder(null);
  };

  const handleExportCSV = () => {
    const headers = 'Order ID,Customer,Merchant,Status,Subtotal,Total,CM,Courier,Promised At\n';
    const rows = orders
      .map(
        (o) =>
          `"${o.id}","${o.customer_name}","${o.merchant_id}","${o.status}",${o.subtotal},${o.total},${o.financials.contribution_margin},"${o.delivery?.courier_name || '-'}","${o.promised_at}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sonnet_pilot_orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded tracking-wider uppercase">
                  Admin Console
                </span>
                <span className="text-xs text-slate-400">Micro-Zone Pilot Buah Batu</span>
              </div>
              <h2 className="text-lg font-extrabold text-white mt-1">
                Delivery Ops & Merchant Ops Hub
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 transition"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor CSV (FR-C7)</span>
            </button>
          </div>
        </div>

        {/* SLA Alert Banner (FR-C2) */}
        {slaAlertOrders.length > 0 && (
          <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-900">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-600 animate-ping" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider">
                  SLA Warning: {slaAlertOrders.length} Order Perlu Penanganan Ops!
                </h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  Order berpotensi melewati batas respon merchant (&gt;5 mnt) atau belum ada kurir
                  yang ditugaskan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {slaAlertOrders.slice(0, 2).map((o) => (
                <button
                  key={o.id}
                  onClick={() => setDispatchModalOrder(o)}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition"
                >
                  Tugaskan {o.id.slice(-6)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'map'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Peta Rute & Hot-Spot Micro-Zone (Live Map)</span>
          </button>

          <button
            onClick={() => setActiveTab('dispatch')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'dispatch'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Antrian Order & Dispatch Manual ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('funnel')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'funnel'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Funnel 20 Merchant Mitra (FR-F2)</span>
          </button>
        </div>

        {/* TAB 0: LIVE MICRO-ZONE MAP COMPONENT */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <MicroZoneMap
              onSelectOrder={(orderId) => {
                const target = orders.find((o) => o.id === orderId);
                if (target && target.status !== 'completed' && target.status !== 'cancelled') {
                  setDispatchModalOrder(target);
                }
              }}
            />

            {/* Quick action helper cards below map */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  Hot-Spot UMKM Terpadat
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-1">Koridor Utama Buah Batu & Turangga</h4>
                <p className="text-[11px] text-slate-500">
                  Konsentrasi 14 dari 20 merchant pilot berada dalam radius 1,8 km dari pusat hub.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                  Status Armada Kurir
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-1">{couriers.length} Kurir Siaga di Zona</h4>
                <p className="text-[11px] text-slate-500">
                  Kang Asep, Mas Budi, dan Kang Rian siap menerima dispatch manual via link web.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Cakupan Radius Layanan
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-1">3.5 km Lingkar Pilot Aktif</h4>
                <p className="text-[11px] text-slate-500">
                  Sesuai ketentuan Gate 1 PRD Seksi 1, seluruh rute berada di dalam zona terkontrol.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: ORDER QUEUE & DISPATCH (FR-C2 & FR-C3) */}
        {activeTab === 'dispatch' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Filter Status:</span>
                {['all', 'active', 'paid', 'processing', 'ready_for_pickup', 'completed'].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition capitalize ${
                        statusFilter === st
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>

              <span className="text-slate-400">Total {filteredOrders.length} Pesanan</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Order ID</th>
                    <th className="py-3 px-3">Pelanggan</th>
                    <th className="py-3 px-3">Merchant</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Kurir Ditugaskan</th>
                    <th className="py-3 px-3">Total & CM</th>
                    <th className="py-3 px-3 text-right">Aksi Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((o) => {
                    const mch = merchants.find((m) => m.id === o.merchant_id);
                    return (
                      <tr key={o.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {o.id}
                          {o.is_sonnet_customer && (
                            <span className="block text-[9px] font-sans text-blue-700 font-bold">
                              ISP Verified
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900">{o.customer_name}</p>
                          <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                            {o.delivery_address}
                          </p>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-800">{mch?.name || o.merchant_id}</p>
                          <p className="text-[10px] text-slate-400">{o.items.length} item</p>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              o.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : o.status === 'paid'
                                ? 'bg-amber-100 text-amber-800'
                                : o.status === 'cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {o.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {o.delivery ? (
                            <div>
                              <p className="font-bold text-slate-900">{o.delivery.courier_name}</p>
                              <p className="text-[10px] text-slate-500">
                                Biaya: Rp {o.delivery.courier_cost.toLocaleString('id-ID')}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                              Belum Ditugaskan
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-extrabold text-slate-900">
                            Rp {o.total.toLocaleString('id-ID')}
                          </p>
                          <p
                            className={`text-[10px] font-bold ${
                              o.financials.contribution_margin >= 0
                                ? 'text-emerald-600'
                                : 'text-rose-600'
                            }`}
                          >
                            CM: Rp {o.financials.contribution_margin.toLocaleString('id-ID')}
                          </p>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setActiveTab('map');
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-2 py-1 rounded-lg transition"
                              title="Lihat rute pengantaran di peta"
                            >
                              Peta Rute
                            </button>

                            {o.status !== 'completed' && o.status !== 'cancelled' && (
                              <button
                                onClick={() => setDispatchModalOrder(o)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition"
                              >
                                Dispatch
                              </button>
                            )}

                            {o.status !== 'cancelled' && o.status !== 'completed' && (
                              <button
                                onClick={() => setCancelModalOrder(o)}
                                className="text-rose-600 hover:bg-rose-50 border border-rose-200 text-[11px] font-bold px-2 py-1 rounded-lg transition"
                              >
                                Batal & Refund
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: 20 MERCHANTS ONBOARDING FUNNEL (FR-F2) */}
        {activeTab === 'funnel' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Merchant Funnel Management (20 Target Gate 1)
              </h3>
              <p className="text-xs text-slate-500">
                Pemantauan pipeline onboarding merchant mitra dari prospek hingga aktif menerima
                transaksi pilot.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {(
                [
                  { id: 'prospecting', label: '1. Prospecting', color: 'bg-slate-100 text-slate-800' },
                  { id: 'qualification', label: '2. Qualification', color: 'bg-amber-100 text-amber-800' },
                  { id: 'onboarding', label: '3. Onboarding', color: 'bg-blue-100 text-blue-800' },
                  { id: 'activation', label: '4. Activation (Go)', color: 'bg-emerald-100 text-emerald-800' },
                  { id: 'retention', label: '5. Retention', color: 'bg-purple-100 text-purple-800' },
                ] as const
              ).map((stage) => {
                const stageMerchants = merchants.filter((m) => m.funnel_stage === stage.id);
                return (
                  <div key={stage.id} className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${stage.color}`}>
                        {stage.label}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {stageMerchants.length}
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-96 overflow-y-auto">
                      {stageMerchants.map((m) => {
                        const partner = partners.find((p) => p.id === m.partner_id);
                        return (
                          <div
                            key={m.id}
                            className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-1"
                          >
                            <h4 className="font-bold text-xs text-slate-900 leading-snug">{m.name}</h4>
                            <p className="text-[10px] text-slate-500">{m.category_label}</p>
                            {partner && (
                              <p className="text-[9px] bg-blue-50 text-blue-800 font-bold px-1.5 py-0.2 rounded inline-block">
                                Ref: {partner.name.split(' ')[0]}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Manual Dispatch Modal (FR-C3) */}
        {dispatchModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bike className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Dispatch Manual Kurir ({dispatchModalOrder.id})
                  </h3>
                </div>
                <button
                  onClick={() => setDispatchModalOrder(null)}
                  className="text-slate-400 hover:text-slate-700 text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                <p>
                  <strong>Toko:</strong> {dispatchModalOrder.merchant_id}
                </p>
                <p>
                  <strong>Tujuan:</strong> {dispatchModalOrder.delivery_address}
                </p>
                <p>
                  <strong>Ongkir Dibayar Warga:</strong> Rp{' '}
                  {dispatchModalOrder.delivery_fee.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Pilih Kurir Mitra Sonnet
                  </label>
                  <select
                    value={selectedCourierId}
                    onChange={(e) => setSelectedCourierId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                  >
                    {couriers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.vehicle}) — Rating {c.rating}★
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Biaya Kurir Aktual (courier_cost)
                  </label>
                  <input
                    type="number"
                    value={courierCostInput}
                    onChange={(e) => setCourierCostInput(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Selisih ongkir dibayar ({dispatchModalOrder.delivery_fee}) - biaya kurir (
                    {courierCostInput}) langsung mempengaruhi CM.
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Mode Pengantaran
                  </label>
                  <select
                    value={fulfillmentMode}
                    onChange={(e) => setFulfillmentMode(e.target.value as FulfillmentMode)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                  >
                    <option value="courier_partner">Kurir Mitra Komunitas Sonnet</option>
                    <option value="merchant_self">Merchant Antar Sendiri</option>
                    <option value="customer_pickup">Pickup Pelanggan Langsung</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setDispatchModalOrder(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  onClick={handleExecuteDispatch}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  Kirim Tugas & Buat Token Web
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation & Refund Modal (FR-C5) */}
        {cancelModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Batalkan & Refund Order {cancelModalOrder.id}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Pilih kode alasan pembatalan resmi sesuai standar operasional Fase 0:
              </p>

              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
              >
                <option value="merchant_unresponsive">Merchant Tidak Merespon (&gt;5 mnt)</option>
                <option value="item_out_of_stock">Bahan / Stok Habis di Toko</option>
                <option value="no_courier_available">Kurir Tidak Tersedia di Zona</option>
                <option value="customer_request">Permintaan Pembatalan Pelanggan</option>
                <option value="address_unreachable">Alamat di Luar Jangkauan Fisik</option>
              </select>

              <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-[11px] text-rose-800 space-y-1">
                <p>
                  <strong>Perlakuan Keuangan:</strong> Dana pelanggan Rp{' '}
                  {cancelModalOrder.total.toLocaleString('id-ID')} akan direfund. Voucher dikembalikan
                  jika ada.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setCancelModalOrder(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Tutup
                </button>
                <button
                  onClick={handleExecuteCancel}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  Konfirmasi Pembatalan & Catat Audit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
