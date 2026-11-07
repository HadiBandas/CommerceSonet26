import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Trash2,
  Tag,
  Check,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { calculateDeliveryFee, PLATFORM_SERVICE_FEE } from '../utils/financialCalculations';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const {
    cart,
    cartMerchant,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    vouchers,
    activeVoucher,
    applyVoucher,
    removeVoucher,
    isSonnetVerified,
    setIsSonnetVerified,
  } = useApp();

  const [voucherInput, setVoucherInput] = useState<string>('');
  const [voucherError, setVoucherError] = useState<string | null>(null);

  if (!isOpen) return null;

  const distanceKm = 1.6; // average pilot distance
  const deliveryFee = calculateDeliveryFee(distanceKm);
  const serviceFee = PLATFORM_SERVICE_FEE;
  const voucherDiscount = activeVoucher ? activeVoucher.value : 0;
  const finalTotal = Math.max(0, cartSubtotal + deliveryFee + serviceFee - voucherDiscount);

  const handleApplyVoucher = (codeToApply: string) => {
    setVoucherError(null);
    const res = applyVoucher(codeToApply);
    if (!res.success) {
      setVoucherError(res.message);
    } else {
      setVoucherInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Keranjang Belanja</h2>
            {cartMerchant && (
              <p className="text-xs text-blue-700 font-semibold truncate max-w-xs">
                {cartMerchant.name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition"
            aria-label="Tutup keranjang"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Single Merchant Policy Notice (FR-A3) */}
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-100 flex items-center justify-between text-[11px] text-amber-900">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Aturan Fase 0: 1 Order hanya untuk 1 Merchant.</span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-amber-800 hover:text-rose-600 font-semibold underline text-[10px]"
            >
              Kosongkan
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-xs">Keranjang Anda masih kosong.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Pilih produk dari salah satu merchant di zona Anda.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                  {item.selectedVariant && (
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.selectedVariant}
                    </span>
                  )}
                  <p className="text-xs font-extrabold text-blue-700 mt-1">
                    Rp {item.product.price.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-2 py-1">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="w-5 h-5 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 rounded"
                      aria-label="Kurangi kuantitas"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-slate-900 px-1">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="w-5 h-5 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 rounded"
                      aria-label="Tambah kuantitas"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition"
                    aria-label="Hapus item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Sonnet First Order Verification Box (FR-E1 & FR-E2) */}
          {cart.length > 0 && (
            <div className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-950">Pelanggan Internet Sonnet?</span>
                </div>
                <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                  Benefit Harian
                </span>
              </div>
              <p className="text-[11px] text-blue-800 leading-snug">
                Verifikasi status pelanggan Sonnet untuk mendapatkan voucher belanja gratis Rp
                25.000 pada order pertama Anda!
              </p>

              <div className="pt-1 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-blue-900">
                  <input
                    type="checkbox"
                    checked={isSonnetVerified}
                    onChange={(e) => {
                      setIsSonnetVerified(e.target.checked);
                      if (e.target.checked) {
                        applyVoucher('SONNETFIRST');
                      } else if (activeVoucher?.code === 'SONNETFIRST') {
                        removeVoucher();
                      }
                    }}
                    className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Nomor ini Terdaftar di Sonnet Fiber</span>
                </label>

                {isSonnetVerified && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Terverifikasi
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Voucher Input & Quick Selector */}
          {cart.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-bold text-slate-800">Gunakan Kode Voucher</span>
              </div>

              {activeVoucher ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-900">{activeVoucher.code}</span>
                    <p className="text-[10px] text-emerald-700">
                      Diskon Rp {activeVoucher.value.toLocaleString('id-ID')} ({activeVoucher.title})
                    </p>
                  </div>
                  <button
                    onClick={removeVoucher}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    placeholder="Contoh: SONNETFIRST"
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    aria-label="Input kode voucher"
                  />
                  <button
                    onClick={() => handleApplyVoucher(voucherInput)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                  >
                    Terapkan
                  </button>
                </div>
              )}

              {voucherError && <p className="text-[11px] text-rose-600">{voucherError}</p>}

              {/* Quick voucher buttons */}
              {!activeVoucher && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {vouchers.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleApplyVoucher(v.code)}
                      className="text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 text-slate-700 px-2 py-1 rounded-md transition font-medium"
                    >
                      {v.code} (-Rp {v.value.toLocaleString('id-ID')})
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pricing Breakdown & Quote (FR-A4) */}
        {cart.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Rincian Biaya Transparan (Quote)
            </h4>

            <div className="text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal Produk</span>
                <span className="font-semibold text-slate-900">
                  Rp {cartSubtotal.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ongkir Kurir (~{distanceKm} km)</span>
                <span className="font-semibold text-slate-900">
                  Rp {deliveryFee.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Layanan Platform</span>
                <span className="font-semibold text-slate-900">
                  Rp {serviceFee.toLocaleString('id-ID')}
                </span>
              </div>
              {voucherDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Diskon Voucher ({activeVoucher?.code})</span>
                  <span>-Rp {voucherDiscount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-950">
                <span>Total Pembayaran</span>
                <span className="text-blue-700">Rp {finalTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full mt-3 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md transition"
            >
              <span>Lanjut ke Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
