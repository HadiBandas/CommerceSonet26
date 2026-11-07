import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import {
  X,
  CreditCard,
  QrCode,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Building2,
  Smartphone,
  Info,
  Coins,
  Gift,
  Zap,
} from 'lucide-react';
import { calculateDeliveryFee, PLATFORM_SERVICE_FEE } from '../utils/financialCalculations';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const {
    cart,
    cartMerchant,
    cartSubtotal,
    activeVoucher,
    customerAddress,
    createOrder,
    isSonnetVerified,
    customerSonnetId,
    customerSonnetPoints,
    linkSonnetId,
  } = useApp();

  const [customerName, setCustomerName] = useState('Kang Rizki Pratama');
  const [customerPhone, setCustomerPhone] = useState('0812-3456-7890');
  const [deliveryNotes, setDeliveryNotes] = useState('Pagar hitam no. 18, bel di samping kanan.');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');
  const [isConsentChecked, setIsConsentChecked] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showSimulatedQR, setShowSimulatedQR] = useState<boolean>(false);
  const [usePoints, setUsePoints] = useState<boolean>(false);
  const [inlineSonnetId, setInlineSonnetId] = useState<string>('SNT-882104');
  const [linkedToast, setLinkedToast] = useState<string | null>(null);

  if (!isOpen || cart.length === 0 || !cartMerchant) return null;

  const distanceKm = 1.6;
  const deliveryFee = calculateDeliveryFee(distanceKm);
  const serviceFee = PLATFORM_SERVICE_FEE;
  const discount = activeVoucher ? activeVoucher.value : 0;
  
  // Sonnet Points logic: 200 points = Rp 2.000 discount
  const pointsAvailable = customerSonnetPoints || 0;
  const pointsToRedeem = usePoints && pointsAvailable >= 200 ? 200 : 0;
  const pointsDiscount = pointsToRedeem > 0 ? 2000 : 0;
  
  const total = Math.max(0, cartSubtotal + deliveryFee + serviceFee - discount - pointsDiscount);
  const pointsEarned = (isSonnetVerified || Boolean(customerSonnetId)) ? Math.round(cartSubtotal / 100) : 0;

  const paymentOptions: {
    id: PaymentMethod;
    name: string;
    description: string;
    icon: React.ReactNode;
    tag?: string;
  }[] = [
    {
      id: 'qris',
      name: 'QRIS (Semua Bank & E-Wallet)',
      description: 'BCA, Mandiri, BRI, GoPay, OVO, ShopeePay',
      icon: <QrCode className="w-5 h-5 text-emerald-600" />,
      tag: 'Instan & Bebas Biaya',
    },
    {
      id: 'va_bca',
      name: 'BCA Virtual Account',
      description: 'Verifikasi otomatis 24 jam via m-BCA & KlikBCA',
      icon: <Building2 className="w-5 h-5 text-blue-600" />,
    },
    {
      id: 'va_mandiri',
      name: 'Mandiri Virtual Account',
      description: 'Livin by Mandiri & ATM Mandiri',
      icon: <Building2 className="w-5 h-5 text-amber-600" />,
    },
    {
      id: 'gopay',
      name: 'GoPay / GoPay Later',
      description: 'Langsung buka aplikasi Gojek di ponsel',
      icon: <Smartphone className="w-5 h-5 text-cyan-600" />,
    },
  ];

  const handleConfirmOrder = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Nama dan nomor HP penerima wajib diisi.');
      return;
    }
    if (!isConsentChecked) {
      alert('Anda wajib menyetujui pemrosesan data (UU PDP) untuk pengiriman pesanan.');
      return;
    }

    setIsProcessing(true);
    const res = createOrder({
      customerName,
      customerPhone,
      deliveryAddress: customerAddress,
      notes: deliveryNotes,
      paymentMethod,
      channel: isSonnetVerified ? 'sonnet_wa' : 'organic',
      pointsToUse: pointsToRedeem,
    });
    setIsProcessing(false);

    if (res.success && res.orderId) {
      onClose();
      onOrderSuccess(res.orderId);
    } else {
      alert(res.error || 'Gagal memproses pesanan.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full my-8 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold">Checkout & Pembayaran Aman</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition"
            aria-label="Tutup checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Merchant & Order Summary Snapshot */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-500">Toko / Merchant Pilihan</p>
              <h3 className="text-xs font-bold text-slate-900">{cartMerchant.name}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {cart.reduce((a, b) => a + b.quantity, 0)} item ({cart.map((i) => i.product.name).join(', ')})
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-500">Total Akhir</p>
              <p className="text-sm font-black text-blue-700">Rp {total.toLocaleString('id-ID')}</p>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              1. Alamat & Kontak Pengantaran
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Nama Penerima
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Nomor WhatsApp Penerima
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0812..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Alamat Lengkap
              </label>
              <input
                type="text"
                value={customerAddress}
                readOnly
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Catatan Patokan untuk Kurir
              </label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Contoh: Rumah cat hijau, titipkan ke satpam"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Payment Method Selector (FR-D1) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                2. Metode Pembayaran Berizin
              </h4>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Licensed PSP (Midtrans/Xendit)
              </span>
            </div>

            <div className="space-y-2">
              {paymentOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === opt.id
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value={opt.id}
                      checked={paymentMethod === opt.id}
                      onChange={() => setPaymentMethod(opt.id)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      {opt.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{opt.name}</span>
                        {opt.tag && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                            {opt.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{opt.description}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Sonnet Rewards & Poin Loyalitas Pelanggan (Opsional) */}
          <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Coins className="w-4 h-4 fill-amber-300 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Sonnet Rewards Loyalty</h4>
                  <p className="text-[10px] text-slate-500">Poin loyalitas belanja eksklusif pelanggan Sonnet</p>
                </div>
              </div>
              {customerSonnetId ? (
                <span className="text-[10px] font-mono font-bold bg-white border border-blue-300 text-blue-700 px-2 py-0.5 rounded-full">
                  {customerSonnetId}
                </span>
              ) : (
                <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                  Opsional
                </span>
              )}
            </div>

            {customerSonnetId ? (
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-[11px]">Poin Sonnet Tersedia:</span>
                  <strong className="text-blue-700 font-extrabold">{pointsAvailable.toLocaleString('id-ID')} Poin</strong>
                </div>
                <div className="flex items-center justify-between text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 text-[11px]">
                  <span>Poin diperoleh dari transaksi ini:</span>
                  <span className="font-extrabold">+{pointsEarned} Poin</span>
                </div>

                {pointsAvailable >= 200 ? (
                  <label className="flex items-center gap-2.5 cursor-pointer pt-1 bg-white p-2.5 rounded-xl border border-blue-200">
                    <input
                      type="checkbox"
                      checked={usePoints}
                      onChange={(e) => setUsePoints(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Tukarkan 200 Poin Sonnet (Potongan <strong className="text-blue-700">-Rp 2.000</strong>)
                    </span>
                  </label>
                ) : (
                  <p className="text-[10px] text-slate-500">
                    Minimal 200 poin untuk penukaran diskon belanja (kumpulkan poin dari setiap order).
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-slate-600 leading-snug">
                  Belanja sebagai tamu? Jika Anda punya internet Sonnet di rumah, masukkan ID Pelanggan Anda
                  sekarang untuk langsung mendapatkan <strong>500 Poin</strong> dan diskon khusus:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inlineSonnetId}
                    onChange={(e) => setInlineSonnetId(e.target.value)}
                    placeholder="Contoh: SNT-882104"
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (inlineSonnetId.trim()) {
                        linkSonnetId(inlineSonnetId.trim());
                        setLinkedToast('ID Sonnet terhubung! +500 Poin bonus ditambahkan.');
                        setTimeout(() => setLinkedToast(null), 3500);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition shrink-0"
                  >
                    Verifikasi ID
                  </button>
                </div>
                {linkedToast && (
                  <p className="text-[11px] text-emerald-600 font-bold">{linkedToast}</p>
                )}
              </div>
            )}
          </div>

          {/* UU PDP Consent & Privacy Notice (FR-A5, FR-G2) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-slate-700 leading-snug">
              <input
                type="checkbox"
                checked={isConsentChecked}
                onChange={(e) => setIsConsentChecked(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                Saya menyetujui pemrosesan data nama dan nomor telepon untuk pengantaran pesanan,
                sesuai <strong>Ketentuan Privasi UU PDP Sonnet (Notice v1.0-20261101)</strong>. Data
                ISP tidak dibagikan ke pihak ketiga atau pengiklan.
              </span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-slate-500">Total Ditagihkan</p>
            <p className="text-base font-extrabold text-blue-700">
              Rp {total.toLocaleString('id-ID')}
            </p>
          </div>

          <button
            onClick={handleConfirmOrder}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition"
          >
            {isProcessing ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses Webhook PSP...</span>
              </span>
            ) : (
              <span>Bayar & Konfirmasi Pesanan</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
