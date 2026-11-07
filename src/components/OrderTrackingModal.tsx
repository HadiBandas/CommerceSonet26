import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import {
  X,
  CheckCircle,
  Clock,
  Bike,
  Store,
  MapPin,
  Star,
  RefreshCw,
  Phone,
  AlertTriangle,
  Receipt,
  ExternalLink,
} from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string | null;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  orderId,
}) => {
  const {
    orders,
    selectedOrderId,
    setSelectedOrderId,
    submitOrderRating,
    transitionOrderStatus,
    confirmCourierDelivery,
    addToCart,
    products,
    merchants,
    setActiveRole,
    setActiveCourierToken,
  } = useApp();

  const [ratingScore, setRatingScore] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentOrderId = orderId || selectedOrderId || orders[0]?.id;
  const currentOrder = orders.find((o) => o.id === currentOrderId) || orders[0];

  if (!currentOrder) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
        <div className="bg-white rounded-2xl p-6 text-center max-w-sm">
          <p className="text-sm text-slate-500">Belum ada riwayat pesanan.</p>
          <button
            onClick={onClose}
            className="mt-4 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  const merchant = merchants.find((m) => m.id === currentOrder.merchant_id);

  const steps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'paid', label: 'Diterima & Terbayar', desc: 'Pembayaran terverifikasi via QRIS/VA' },
    { key: 'processing', label: 'Diproses Toko', desc: 'Merchant sedang menyiapkan pesanan' },
    { key: 'ready_for_pickup', label: 'Siap Dijemput', desc: 'Menunggu pengambilan kurir' },
    { key: 'out_for_delivery', label: 'Sedang Diantar', desc: 'Kurir dalam perjalanan ke alamat Anda' },
    { key: 'completed', label: 'Selesai & Diterima', desc: 'Pesanan telah sampai dengan selamat' },
  ];

  const getStepStatus = (stepKey: OrderStatus) => {
    const statusOrder: OrderStatus[] = [
      'created',
      'paid',
      'merchant_accepted',
      'processing',
      'ready_for_pickup',
      'out_for_delivery',
      'delivered',
      'completed',
    ];

    if (currentOrder.status === 'cancelled') return 'cancelled';

    const currentIndex = statusOrder.indexOf(currentOrder.status);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (currentIndex >= stepIndex) return 'completed';
    return 'pending';
  };

  const handleReorder = () => {
    for (const item of currentOrder.items) {
      const prod = products.find((p) => p.id === item.product_id);
      if (prod) {
        addToCart(prod, item.qty, item.variant);
      }
    }
    alert('Item dari pesanan sebelumnya telah dimasukkan ke keranjang!');
    onClose();
  };

  const handleSubmitRating = () => {
    submitOrderRating(currentOrder.id, ratingScore, ratingComment);
    setRatingSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full my-6 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
              Pelacakan Status Pesanan
            </span>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <span>{currentOrder.id}</span>
              <span className="text-xs font-normal text-slate-300">
                • {merchant?.name || 'Merchant'}
              </span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition"
            aria-label="Tutup pelacakan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Selector (if multiple orders exist) */}
        {orders.length > 1 && (
          <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-500 font-medium shrink-0">Pilih Pesanan:</span>
            {orders.slice(0, 5).map((o) => (
              <button
                key={o.id}
                onClick={() => setSelectedOrderId(o.id)}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-semibold transition ${
                  o.id === currentOrder.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                {o.id.slice(-6)} ({o.status})
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Stepper */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tahap Pesanan Real-Time
            </h3>

            {currentOrder.status === 'cancelled' ? (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Pesanan Dibatalkan</h4>
                  <p className="mt-0.5">Alasan: {currentOrder.cancel_reason || 'Dibatalkan oleh ops'}</p>
                  <p className="text-[11px] text-rose-700 mt-1">
                    Dana pembayaran dan voucher telah diproses untuk pengembalian penuh.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 ml-2">
                {steps.map((st) => {
                  const state = getStepStatus(st.key);
                  const isDone = state === 'completed';
                  return (
                    <div key={st.key} className="relative">
                      <div
                        className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          isDone
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isDone ? <CheckCircle className="w-4 h-4" /> : '•'}
                      </div>
                      <div>
                        <h4
                          className={`text-xs font-bold ${
                            isDone ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {st.label}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{st.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Courier Details (if assigned) */}
          {currentOrder.delivery && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                    <Bike className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {currentOrder.delivery.courier_name}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Kurir Mitra Sonnet • Biaya antar: Rp{' '}
                      {currentOrder.delivery.courier_cost.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveRole('courier');
                    if (currentOrder.delivery) {
                      setActiveCourierToken(currentOrder.delivery.token);
                    }
                    onClose();
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200 transition"
                >
                  <span>Link Web Kurir</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Delivery Proof */}
              {currentOrder.delivery.delivery_proof && (
                <div className="text-[11px] bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-emerald-800">
                  <strong>Bukti Pengantaran Selesai:</strong> {currentOrder.delivery.delivery_proof}
                </div>
              )}
            </div>
          )}

          {/* Interactive Fast-Forward Simulation Bar for Testing */}
          {currentOrder.status !== 'completed' && currentOrder.status !== 'cancelled' && (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5">
              <p className="text-[11px] font-bold text-amber-900">
                ⚡ Simulasi Alur Cepat (Concierge Workflow):
              </p>
              <div className="flex flex-wrap gap-2">
                {currentOrder.status === 'paid' && (
                  <button
                    onClick={() =>
                      transitionOrderStatus(
                        currentOrder.id,
                        'merchant_accepted',
                        'merchant',
                        'mch_01'
                      )
                    }
                    className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-md"
                  >
                    1. Terima Order (Merchant)
                  </button>
                )}
                {currentOrder.status === 'merchant_accepted' && (
                  <button
                    onClick={() =>
                      transitionOrderStatus(currentOrder.id, 'processing', 'merchant', 'mch_01')
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-md"
                  >
                    2. Mulai Masak / Siapkan
                  </button>
                )}
                {currentOrder.status === 'processing' && (
                  <button
                    onClick={() =>
                      transitionOrderStatus(
                        currentOrder.id,
                        'ready_for_pickup',
                        'merchant',
                        'mch_01'
                      )
                    }
                    className="bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-md"
                  >
                    3. Siap Diambil Kurir
                  </button>
                )}
                {(currentOrder.status === 'ready_for_pickup' ||
                  currentOrder.status === 'out_for_delivery') && (
                  <button
                    onClick={() =>
                      confirmCourierDelivery(
                        currentOrder.id,
                        'PIN-TERVERIFIKASI-IBU-NENDEN'
                      )
                    }
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-md"
                  >
                    4. Konfirmasi Tiba & Selesaikan (Kurir)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Post-Delivery Rating (FR-A7 CSAT) */}
          {(currentOrder.status === 'delivered' || currentOrder.status === 'completed') && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>Ulasan Kepuasan Layanan (CSAT)</span>
                </h4>
                <span className="text-[10px] bg-amber-200/60 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                  Target Pilot ≥ 4.2
                </span>
              </div>

              {currentOrder.rating || ratingSubmitted ? (
                <div className="bg-white/80 p-3 rounded-xl border border-amber-200/80">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= (currentOrder.rating?.score || ratingScore)
                            ? 'fill-current'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-800 ml-2">
                      {currentOrder.rating?.score || ratingScore} / 5 Bintang
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 italic">
                    "{currentOrder.rating?.comment || ratingComment || 'Pesanan cepat dan rapi!'}"
                  </p>
                  <p className="text-[10px] text-emerald-700 font-bold mt-1">
                    ✓ Nilai CSAT Anda telah masuk ke indikator Gate 1.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setRatingScore(num)}
                        className="p-1 hover:scale-110 transition"
                        aria-label={`Beri bintang ${num}`}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            num <= ratingScore
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-800 ml-2">{ratingScore} / 5</span>
                  </div>

                  <input
                    type="text"
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Tulis ulasan Anda (misal: kurir ramah, makanan hangat)..."
                    className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />

                  <button
                    onClick={handleSubmitRating}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                  >
                    Kirim Ulasan & Selesaikan
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Items & Financial Breakdown */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Item Pesanan
            </h4>
            <div className="space-y-1.5 text-xs text-slate-700">
              {currentOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {it.qty}x {it.name}
                  </span>
                  <span className="font-semibold">
                    Rp {(it.unit_price * it.qty).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900">
                <span>Total Dibayar</span>
                <span className="text-blue-700">Rp {currentOrder.total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer: Re-order button (FR-A8) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleReorder}
            className="flex items-center gap-1.5 text-blue-700 hover:text-blue-800 font-bold text-xs bg-blue-100/70 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Pesan Ulang dari Riwayat</span>
          </button>

          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
