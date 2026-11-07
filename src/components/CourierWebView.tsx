import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bike,
  MapPin,
  Phone,
  CheckCircle,
  Camera,
  KeyRound,
  ShieldCheck,
  Coins,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const CourierWebView: React.FC = () => {
  const {
    activeCourierToken,
    setActiveCourierToken,
    orders,
    merchants,
    confirmCourierPickup,
    confirmCourierDelivery,
    couriers,
  } = useApp();

  const [pickupPinInput, setPickupPinInput] = useState<string>('PIN-8821');
  const [deliveryProofInput, setDeliveryProofInput] = useState<string>('FOTO-SERAH-TERIMA-GERBANG');
  const [activeStep, setActiveStep] = useState<'pickup' | 'delivery'>('pickup');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Find order associated with this token or pick latest assigned order
  const activeOrder =
    orders.find((o) => o.delivery?.token === activeCourierToken) ||
    orders.find((o) => o.delivery !== undefined) ||
    orders[0];

  const merchant = merchants.find((m) => m.id === activeOrder?.merchant_id);
  const courier = couriers.find((c) => c.id === activeOrder?.delivery?.courier_id) || couriers[0];

  const handleConfirmPickup = () => {
    if (!activeOrder) return;
    confirmCourierPickup(activeOrder.id, pickupPinInput);
    setActiveStep('delivery');
    setSuccessToast('Pickup berhasil dikonfirmasi! Silakan antar ke pelanggan.');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleConfirmDelivery = () => {
    if (!activeOrder) return;
    confirmCourierDelivery(activeOrder.id, deliveryProofInput);
    setSuccessToast('Pengantaran selesai! Biaya kurir Rp 6.000 dicatat ke dompet mitra.');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Token Web Link Header (FR-C4) */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Tautan Tugas Kurir</h2>
                <p className="text-[11px] text-slate-400">
                  {courier.name} • {courier.vehicle}
                </p>
              </div>
            </div>

            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2.5 py-1 rounded-full">
              Tanpa Driver App
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <div>
              <p className="text-[10px] text-slate-400">Order ID</p>
              <p className="font-mono font-bold text-amber-400">{activeOrder.id}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400">Honor Pengantaran</p>
              <p className="font-extrabold text-emerald-400">
                Rp {(activeOrder.delivery?.courier_cost || 6000).toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        {/* Token Switcher for Demo */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200 text-xs flex items-center justify-between">
          <span className="text-slate-500 font-medium">Token Web Aktif:</span>
          <span className="font-mono font-bold text-slate-800 text-[11px]">
            sonnet.id/c/{activeOrder.delivery?.token || 'token-demo-004'}
          </span>
        </div>

        {/* STEP 1: PICKUP MERCHANT */}
        <div
          className={`bg-white rounded-3xl p-5 border transition shadow-xs space-y-3 ${
            activeOrder.status === 'ready_for_pickup' || activeOrder.status === 'processing'
              ? 'border-blue-500 ring-2 ring-blue-500/10'
              : 'border-slate-200 opacity-90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              LANGKAH 1: PENJEMPUTAN (PICKUP)
            </span>
            {activeOrder.delivery?.picked_up_at && (
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Sudah Diambil
              </span>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">{merchant?.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{merchant?.address}</p>
            <p className="text-xs font-semibold text-slate-700 mt-2">
              Item yang Diambil:{' '}
              {activeOrder.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <a
              href={`tel:${merchant?.phone}`}
              className="flex items-center gap-1.5 text-xs text-blue-600 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Hubungi Toko ({merchant?.phone})</span>
            </a>
          </div>

          {!activeOrder.delivery?.picked_up_at && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="text-[11px] font-semibold text-slate-700 block">
                Kode PIN Konfirmasi Pickup Merchant
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pickupPinInput}
                  onChange={(e) => setPickupPinInput(e.target.value)}
                  placeholder="PIN-1234"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  onClick={handleConfirmPickup}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition"
                >
                  Konfirmasi Pickup
                </button>
              </div>
            </div>
          )}
        </div>

        {/* STEP 2: DELIVER TO CUSTOMER */}
        <div
          className={`bg-white rounded-3xl p-5 border transition shadow-xs space-y-3 ${
            activeOrder.status === 'out_for_delivery'
              ? 'border-emerald-500 ring-2 ring-emerald-500/10'
              : 'border-slate-200 opacity-90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              LANGKAH 2: PENGANTARAN KE WARGA
            </span>
            {activeOrder.status === 'delivered' || activeOrder.status === 'completed' ? (
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Selesai Diantar
              </span>
            ) : null}
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">{activeOrder.customer_name}</h3>
            <p className="text-xs text-slate-600 mt-0.5 flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{activeOrder.delivery_address}</span>
            </p>
            {activeOrder.notes && (
              <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg mt-2 border border-slate-100">
                Patokan: "{activeOrder.notes}"
              </p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <a
              href={`tel:${activeOrder.customer_phone}`}
              className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Hubungi Warga ({activeOrder.customer_phone})</span>
            </a>
          </div>

          {activeOrder.status === 'out_for_delivery' && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="text-[11px] font-semibold text-slate-700 block">
                Bukti Penyerahan (Foto / Tanda Tangan / PIN Penerima)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={deliveryProofInput}
                  onChange={(e) => setDeliveryProofInput(e.target.value)}
                  placeholder="FOTO-SERAH-TERIMA"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  onClick={handleConfirmDelivery}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition"
                >
                  Selesaikan Antaran
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Toast */}
        {successToast && (
          <div className="bg-slate-900 text-white text-xs font-semibold p-3.5 rounded-2xl shadow-xl text-center border border-slate-800 animate-in fade-in">
            {successToast}
          </div>
        )}
      </div>
    </div>
  );
};
