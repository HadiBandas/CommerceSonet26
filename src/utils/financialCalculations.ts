import { OrderFinancials, OrderStatus, PilotKPIIndicator } from '../types';

/**
 * Calculates Contribution Margin per order according to PRD Section 7:
 * CM = komisi + biaya_layanan + (ongkir_dibayar - biaya_kurir) - biaya_pembayaran - subsidi_voucher - kerugian_refund
 */
export function calculateContributionMargin(params: {
  commission: number;
  service_fee_rev: number;
  delivery_fee_passthrough: number;
  courier_cost: number;
  psp_fee: number;
  voucher_subsidy: number;
  refund_loss?: number;
}): number {
  const refund_loss = params.refund_loss || 0;
  const deliveryMargin = params.delivery_fee_passthrough - params.courier_cost;
  return (
    params.commission +
    params.service_fee_rev +
    deliveryMargin -
    params.psp_fee -
    params.voucher_subsidy -
    refund_loss
  );
}

/**
 * Calculates delivery fee based on road distance in km.
 * Pilot policy: Rp 6.000 base for up to 2.0 km, + Rp 2.500 per subsequent km.
 */
export function calculateDeliveryFee(distanceKm: number): number {
  if (distanceKm <= 0) return 0;
  const baseFee = 6000;
  if (distanceKm <= 2.0) return baseFee;
  const extraKm = Math.ceil(distanceKm - 2.0);
  return baseFee + extraKm * 2500;
}

/**
 * Standard platform service fee for Concierge MVP (Fase 0)
 */
export const PLATFORM_SERVICE_FEE = 2000;

/**
 * Calculates PSP (Payment Service Provider) fee estimate.
 * QRIS: 0.7% fixed by Bank Indonesia
 * VA: flat Rp 2.500
 * E-Wallet: 1.5%
 */
export function calculatePspFee(method: 'qris' | 'va_bca' | 'va_mandiri' | 'gopay', amount: number): number {
  switch (method) {
    case 'qris':
      return Math.round(amount * 0.007);
    case 'gopay':
      return Math.round(amount * 0.015);
    case 'va_bca':
    case 'va_mandiri':
      return 2500;
    default:
      return Math.round(amount * 0.007);
  }
}

/**
 * Build quote calculation
 */
export function buildQuote(params: {
  subtotal: number;
  distanceKm: number;
  voucherDiscount?: number;
  taxRate?: number;
}) {
  const delivery_fee = calculateDeliveryFee(params.distanceKm);
  const service_fee = PLATFORM_SERVICE_FEE;
  const discount = Math.min(params.voucherDiscount || 0, params.subtotal);
  const taxableAmount = Math.max(0, params.subtotal - discount);
  const tax = params.taxRate ? Math.round(taxableAmount * params.taxRate) : 0;
  const total = params.subtotal + delivery_fee + service_fee + tax - discount;

  return {
    subtotal: params.subtotal,
    distance_km: params.distanceKm,
    delivery_fee,
    service_fee,
    tax,
    discount,
    total,
  };
}

/**
 * State machine validator for orders
 */
export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  created: ['paid', 'cancelled'],
  paid: ['merchant_accepted', 'cancelled'],
  merchant_accepted: ['processing', 'cancelled'],
  processing: ['ready_for_pickup', 'cancelled'],
  ready_for_pickup: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export function isValidOrderTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  const allowed = VALID_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

/**
 * Evaluates the 8 Pilot Gate 1 Indicators
 */
export function evaluatePilotIndicators(stats: {
  activeMerchants: number;
  totalOrders: number;
  repeatBuyerRate: number; // 0 to 1
  cancellationRate: number; // 0 to 1
  onTimeRate: number; // 0 to 1
  csatAverage: number; // 1 to 5
  avgContributionMargin: number; // in IDR
  securityIncidents: number;
}): PilotKPIIndicator[] {
  // Indicator 1: Merchant Aktif
  const ind1Status = stats.activeMerchants >= 15 ? 'go' : stats.activeMerchants >= 8 ? 'caution' : 'stop';
  // Indicator 2: Total Order Pilot
  const ind2Status = stats.totalOrders >= 200 ? 'go' : stats.totalOrders >= 80 ? 'caution' : 'stop';
  // Indicator 3: Repeat Buyer Rate
  const ind3Status = stats.repeatBuyerRate >= 0.25 ? 'go' : stats.repeatBuyerRate >= 0.10 ? 'caution' : 'stop';
  // Indicator 4: Cancellation Rate (Lower is better)
  const ind4Status = stats.cancellationRate <= 0.10 ? 'go' : stats.cancellationRate <= 0.20 ? 'caution' : 'stop';
  // Indicator 5: On-time Delivery Rate
  const ind5Status = stats.onTimeRate >= 0.85 ? 'go' : stats.onTimeRate >= 0.70 ? 'caution' : 'stop';
  // Indicator 6: CSAT Score
  const ind6Status = stats.csatAverage >= 4.2 ? 'go' : stats.csatAverage >= 3.5 ? 'caution' : 'stop';
  // Indicator 7: Contribution Margin per order
  const ind7Status = stats.avgContributionMargin >= 0 ? 'go' : 'stop';
  // Indicator 8: Security & Privacy Incidents
  const ind8Status = stats.securityIncidents === 0 ? 'go' : 'stop';

  return [
    {
      id: 'kpi_merchant_active',
      name: 'Merchant Aktif (≥ 1 order/minggu)',
      category: 'merchant',
      current_value: stats.activeMerchants,
      unit: 'merchant',
      target_go: 15,
      target_stop: 8,
      higher_is_better: true,
      status: ind1Status,
      system_source: 'orders.merchant_id per minggu',
      description: 'Jumlah merchant mitra yang menerima minimal 1 transaksi selesai per minggu.',
    },
    {
      id: 'kpi_total_orders',
      name: 'Total Order Selesai Selama Pilot',
      category: 'orders',
      current_value: stats.totalOrders,
      unit: 'order',
      target_go: 200,
      target_stop: 80,
      higher_is_better: true,
      status: ind2Status,
      system_source: 'orders berstatus selesai',
      description: 'Volume akumulatif pesanan sukses selama 4 minggu masa pilot micro-zone.',
    },
    {
      id: 'kpi_repeat_buyers',
      name: 'Pembeli Order Ulang (≥ 2 kali)',
      category: 'orders',
      current_value: Math.round(stats.repeatBuyerRate * 100),
      unit: '%',
      target_go: 25,
      target_stop: 10,
      higher_is_better: true,
      status: ind3Status,
      system_source: 'orders.customer_id cohort',
      description: 'Persentase pelanggan unik yang melakukan pemesanan minimal dua kali.',
    },
    {
      id: 'kpi_cancellation_rate',
      name: 'Tingkat Pembatalan Order',
      category: 'quality',
      current_value: Math.round(stats.cancellationRate * 100),
      unit: '%',
      target_go: 10,
      target_stop: 20,
      higher_is_better: false,
      status: ind4Status,
      system_source: 'order_events (cancelled) / total',
      description: 'Rasio pesanan yang dibatalkan oleh pelanggan, merchant, atau kurir.',
    },
    {
      id: 'kpi_on_time_rate',
      name: 'Ketepatan Waktu Pengantaran',
      category: 'quality',
      current_value: Math.round(stats.onTimeRate * 100),
      unit: '%',
      target_go: 85,
      target_stop: 70,
      higher_is_better: true,
      status: ind5Status,
      system_source: 'deliveries.promised_at vs delivered_at',
      description: 'Ketepatan pengantaran kurir tiba sebelum atau tepat waktu yang dijanjikan.',
    },
    {
      id: 'kpi_csat',
      name: 'Skor Kepuasan Pelanggan (CSAT)',
      category: 'quality',
      current_value: Number(stats.csatAverage.toFixed(2)),
      unit: '/ 5.0',
      target_go: 4.2,
      target_stop: 3.5,
      higher_is_better: true,
      status: ind6Status,
      system_source: 'order_ratings post-delivery',
      description: 'Rata-rata ulasan bintang dari pelanggan setelah pesanan diselesaikan.',
    },
    {
      id: 'kpi_cm_per_order',
      name: 'Rata-rata Contribution Margin per Order',
      category: 'finance',
      current_value: Math.round(stats.avgContributionMargin),
      unit: 'Rp',
      target_go: 0,
      target_stop: 0,
      higher_is_better: true,
      status: ind7Status,
      system_source: 'order_financials formula',
      description: 'Margin per order setelah memperhitungkan komisi, ongkir, kurir, PSP, dan voucher.',
    },
    {
      id: 'kpi_security_incidents',
      name: 'Insiden Privasi & Keamanan (UU PDP)',
      category: 'compliance',
      current_value: stats.securityIncidents,
      unit: 'insiden',
      target_go: 0,
      target_stop: 0,
      higher_is_better: false,
      status: ind8Status,
      system_source: 'log insiden, audit trail, consent registry',
      description: 'Nol kebocoran data pelanggan ISP atau transaksi; wajib 0 untuk Gate 1.',
    },
  ];
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}
