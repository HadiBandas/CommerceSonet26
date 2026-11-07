import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateContributionMargin,
  calculateDeliveryFee,
  calculatePspFee,
  buildQuote,
  isValidOrderTransition,
  evaluatePilotIndicators,
  PLATFORM_SERVICE_FEE,
} from './financialCalculations';

test('Contribution Margin calculates correctly according to PRD formula', () => {
  // Scenario 1: Standard positive order
  // Komisi: Rp 6.000, Layanan: Rp 2.000, Ongkir dibayar: Rp 8.500, Biaya kurir aktual: Rp 7.000
  // PSP fee: Rp 350, Subsidi voucher: Rp 0, Refund: Rp 0
  // Ongkir margin = 8.500 - 7.000 = +1.500
  // CM = 6.000 + 2.000 + 1.500 - 350 - 0 - 0 = 9.150
  const cm1 = calculateContributionMargin({
    commission: 6000,
    service_fee_rev: 2000,
    delivery_fee_passthrough: 8500,
    courier_cost: 7000,
    psp_fee: 350,
    voucher_subsidy: 0,
    refund_loss: 0,
  });
  assert.equal(cm1, 9150);

  // Scenario 2: Subsidized first-order voucher with courier deficit
  // Komisi: Rp 5.000, Layanan: Rp 2.000, Ongkir dibayar: Rp 6.000, Kurir aktual: Rp 8.000 (selisih -2.000)
  // PSP fee: Rp 200, Subsidi voucher: Rp 10.000
  // CM = 5.000 + 2.000 + (6.000 - 8.000) - 200 - 10.000 = -5.200
  const cm2 = calculateContributionMargin({
    commission: 5000,
    service_fee_rev: 2000,
    delivery_fee_passthrough: 6000,
    courier_cost: 8000,
    psp_fee: 200,
    voucher_subsidy: 10000,
  });
  assert.equal(cm2, -5200);
});

test('Delivery fee calculation scales cleanly by distance', () => {
  // Up to 2 km: base fee is 6000
  assert.equal(calculateDeliveryFee(0.8), 6000);
  assert.equal(calculateDeliveryFee(2.0), 6000);

  // 2.5 km -> base + 1 km extra (ceil(0.5) = 1) = 6000 + 2500 = 8500
  assert.equal(calculateDeliveryFee(2.5), 8500);

  // 3.8 km -> base + 2 km extra (ceil(1.8) = 2) = 6000 + 5000 = 11000
  assert.equal(calculateDeliveryFee(3.8), 11000);
});

test('PSP fee correctly applies payment method rates', () => {
  // QRIS: 0.7%
  assert.equal(calculatePspFee('qris', 50000), 350);
  // VA: flat 2500
  assert.equal(calculatePspFee('va_bca', 50000), 2500);
  assert.equal(calculatePspFee('va_mandiri', 100000), 2500);
  // Gopay: 1.5%
  assert.equal(calculatePspFee('gopay', 100000), 1500);
});

test('Quote builder accurately locks subtotal, delivery fee, service fee, and vouchers', () => {
  const quote = buildQuote({
    subtotal: 50000,
    distanceKm: 1.5,
    voucherDiscount: 15000,
  });

  assert.equal(quote.subtotal, 50000);
  assert.equal(quote.delivery_fee, 6000);
  assert.equal(quote.service_fee, PLATFORM_SERVICE_FEE);
  assert.equal(quote.discount, 15000);
  // Total = 50000 + 6000 + 2000 - 15000 = 43000
  assert.equal(quote.total, 43000);
});

test('Order state machine validates allowed and disallowed transitions', () => {
  assert.equal(isValidOrderTransition('created', 'paid'), true);
  assert.equal(isValidOrderTransition('paid', 'merchant_accepted'), true);
  assert.equal(isValidOrderTransition('merchant_accepted', 'processing'), true);
  assert.equal(isValidOrderTransition('processing', 'ready_for_pickup'), true);
  assert.equal(isValidOrderTransition('ready_for_pickup', 'out_for_delivery'), true);
  assert.equal(isValidOrderTransition('out_for_delivery', 'delivered'), true);
  assert.equal(isValidOrderTransition('delivered', 'completed'), true);

  // Cancellation allowed from most active states
  assert.equal(isValidOrderTransition('created', 'cancelled'), true);
  assert.equal(isValidOrderTransition('paid', 'cancelled'), true);

  // Illegal jumps
  assert.equal(isValidOrderTransition('created', 'delivered'), false);
  assert.equal(isValidOrderTransition('completed', 'processing'), false);
  assert.equal(isValidOrderTransition('cancelled', 'paid'), false);
});

test('Gate 1 indicators evaluate to correct status (Go, Caution, Stop)', () => {
  // Perfect Go scenario
  const indicatorsGo = evaluatePilotIndicators({
    activeMerchants: 18,
    totalOrders: 240,
    repeatBuyerRate: 0.32,
    cancellationRate: 0.05,
    onTimeRate: 0.92,
    csatAverage: 4.6,
    avgContributionMargin: 4200,
    securityIncidents: 0,
  });

  for (const ind of indicatorsGo) {
    assert.equal(ind.status, 'go', `Expected indicator ${ind.name} to be 'go'`);
  }

  // Mixed / Caution scenario
  const indicatorsCaution = evaluatePilotIndicators({
    activeMerchants: 10, // Caution (8-14)
    totalOrders: 150, // Caution (80-199)
    repeatBuyerRate: 0.15, // Caution (10-24%)
    cancellationRate: 0.15, // Caution (11-20%)
    onTimeRate: 0.78, // Caution (70-84%)
    csatAverage: 3.8, // Caution (3.5-4.1)
    avgContributionMargin: 1200, // Go (>= 0)
    securityIncidents: 0, // Go (0)
  });

  assert.equal(indicatorsCaution.find(i => i.id === 'kpi_merchant_active')?.status, 'caution');
  assert.equal(indicatorsCaution.find(i => i.id === 'kpi_total_orders')?.status, 'caution');

  // Hard stop condition: security breach > 0
  const indicatorsStop = evaluatePilotIndicators({
    activeMerchants: 20,
    totalOrders: 300,
    repeatBuyerRate: 0.40,
    cancellationRate: 0.04,
    onTimeRate: 0.95,
    csatAverage: 4.8,
    avgContributionMargin: -500, // Stop (< 0)
    securityIncidents: 1, // Stop (> 0)
  });

  assert.equal(indicatorsStop.find(i => i.id === 'kpi_cm_per_order')?.status, 'stop');
  assert.equal(indicatorsStop.find(i => i.id === 'kpi_security_incidents')?.status, 'stop');
});
