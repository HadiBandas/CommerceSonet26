import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Coins,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Building,
  CreditCard,
  Percent,
} from 'lucide-react';
import { formatRupiah } from '../utils/financialCalculations';

export const FinanceLedger: React.FC = () => {
  const { orders, merchants, pspReconciliations, reconcilePSPTransaction, couriers } = useApp();

  const [activeTab, setActiveTab] = useState<'ledger' | 'recon' | 'payouts'>('ledger');

  // Aggregated Financial Metrics
  const totals = useMemo(() => {
    let totalGMV = 0;
    let totalCommission = 0;
    let totalServiceFee = 0;
    let totalDeliveryCollected = 0;
    let totalCourierCost = 0;
    let totalPspFee = 0;
    let totalVoucherSubsidy = 0;
    let totalRefundLoss = 0;
    let totalCM = 0;

    orders.forEach((o) => {
      const f = o.financials;
      totalGMV += f.gmv;
      totalCommission += f.commission;
      totalServiceFee += f.service_fee_rev;
      totalDeliveryCollected += f.delivery_fee_passthrough;
      totalCourierCost += f.courier_cost;
      totalPspFee += f.psp_fee;
      totalVoucherSubsidy += f.voucher_subsidy;
      totalRefundLoss += f.refund_loss;
      totalCM += f.contribution_margin;
    });

    const avgCM = orders.length > 0 ? totalCM / orders.length : 0;
    const deliveryNetMargin = totalDeliveryCollected - totalCourierCost;

    return {
      totalGMV,
      totalCommission,
      totalServiceFee,
      totalDeliveryCollected,
      totalCourierCost,
      deliveryNetMargin,
      totalPspFee,
      totalVoucherSubsidy,
      totalRefundLoss,
      totalCM,
      avgCM,
    };
  }, [orders]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded tracking-wider uppercase">
                  Finance & Unit Economics
                </span>
                <span className="text-xs text-slate-400">PRD Seksi 5.4 & 7 (Formula CM)</span>
              </div>
              <h2 className="text-lg font-extrabold text-white mt-1">
                Buku Besar Per Order & Rekonsiliasi Gateway
              </h2>
            </div>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl px-4 py-2 text-right">
            <p className="text-[10px] text-slate-400 font-semibold">Rata-rata CM per Order</p>
            <p
              className={`text-base font-black ${
                totals.avgCM >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatRupiah(totals.avgCM)}
            </p>
          </div>
        </div>

        {/* Formula Explainer Card (PRD Section 7) */}
        <div className="bg-blue-900 text-white rounded-3xl p-5 border border-blue-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">
              Formula Resmi Contribution Margin (PRD Bagian 7):
            </h3>
          </div>
          <code className="block bg-slate-950/60 p-3 rounded-xl font-mono text-xs text-slate-200 overflow-x-auto">
            CM = komisi + biaya_layanan + (ongkir_dibayar - biaya_kurir) - biaya_pembayaran -
            subsidi_voucher - kerugian_refund
          </code>
          <p className="text-[11px] text-blue-200 leading-relaxed">
            *Ongkir yang diteruskan ke kurir tidak dihitung sebagai pendapatan; hanya selisih antara
            ongkir yang dibayar pelanggan dan biaya kurir aktual yang masuk ke perhitungan CM.
          </p>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <p className="text-xs text-slate-500">Gross Merchandise Value (GMV)</p>
            <h4 className="text-lg font-black text-slate-900 mt-1">
              {formatRupiah(totals.totalGMV)}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Nilai kotor transaksi produk</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <p className="text-xs text-slate-500">Pendapatan Komisi & Layanan</p>
            <h4 className="text-lg font-black text-blue-700 mt-1">
              {formatRupiah(totals.totalCommission + totals.totalServiceFee)}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Komisi ({formatRupiah(totals.totalCommission)}) + Layanan (
              {formatRupiah(totals.totalServiceFee)})
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <p className="text-xs text-slate-500">Total Biaya Operasional (Kurir + PSP)</p>
            <h4 className="text-lg font-black text-amber-700 mt-1">
              {formatRupiah(totals.totalCourierCost + totals.totalPspFee)}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Kurir ({formatRupiah(totals.totalCourierCost)}) + Fee PSP (
              {formatRupiah(totals.totalPspFee)})
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <p className="text-xs text-slate-500">Subsidi Voucher (Biaya Akuisisi)</p>
            <h4 className="text-lg font-black text-rose-600 mt-1">
              {formatRupiah(totals.totalVoucherSubsidy)}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Marketing pilot first order & warga
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'ledger'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Buku Besar Ledger Per Order (FR-D3)
          </button>
          <button
            onClick={() => setActiveTab('recon')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'recon'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Rekonsiliasi Harian PSP Gateway (FR-D4)
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'payouts'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Jadwal Payout Merchant & Kurir (FR-D5)
          </button>
        </div>

        {/* TAB 1: ORDER FINANCIALS LEDGER TABLE (FR-D3) */}
        {activeTab === 'ledger' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Tabel Ledger Terinci (Append-Only)
                </h3>
                <p className="text-xs text-slate-500">
                  Semua transaksi dicatat sampai tingkat komponen biaya riil tanpa spreadsheet manual.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-2">Order ID</th>
                    <th className="py-3 px-2">GMV</th>
                    <th className="py-3 px-2">Komisi</th>
                    <th className="py-3 px-2">Layanan</th>
                    <th className="py-3 px-2">Ongkir Warga</th>
                    <th className="py-3 px-2">Biaya Kurir</th>
                    <th className="py-3 px-2">Fee PSP</th>
                    <th className="py-3 px-2">Subsidi Vcr</th>
                    <th className="py-3 px-2 text-right">Contribution Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => {
                    const f = o.financials;
                    return (
                      <tr key={o.id} className="hover:bg-slate-50/70 transition font-mono">
                        <td className="py-3 px-2 font-bold text-slate-900">{o.id}</td>
                        <td className="py-3 px-2">{formatRupiah(f.gmv)}</td>
                        <td className="py-3 px-2 text-blue-700">+{formatRupiah(f.commission)}</td>
                        <td className="py-3 px-2 text-blue-700">+{formatRupiah(f.service_fee_rev)}</td>
                        <td className="py-3 px-2 text-slate-600">
                          {formatRupiah(f.delivery_fee_passthrough)}
                        </td>
                        <td className="py-3 px-2 text-amber-700">
                          -{formatRupiah(f.courier_cost)}
                        </td>
                        <td className="py-3 px-2 text-rose-600">-{formatRupiah(f.psp_fee)}</td>
                        <td className="py-3 px-2 text-rose-600">
                          {f.voucher_subsidy > 0 ? `-${formatRupiah(f.voucher_subsidy)}` : '-'}
                        </td>
                        <td
                          className={`py-3 px-2 text-right font-black ${
                            f.contribution_margin >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {formatRupiah(f.contribution_margin)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PSP RECONCILIATION (FR-D4) */}
        {activeTab === 'recon' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Rekonsiliasi Harian Payment Gateway (Midtrans / Xendit)
              </h3>
              <p className="text-xs text-slate-500">
                Pencocokan mutasi settlement penyedia pembayaran berizin terhadap data order internal.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Referensi PSP</th>
                    <th className="py-3 px-3">Order Terkait</th>
                    <th className="py-3 px-3">Nominal PSP</th>
                    <th className="py-3 px-3">Nominal Order</th>
                    <th className="py-3 px-3">Selisih (Variance)</th>
                    <th className="py-3 px-3">Status Settlement</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pspReconciliations.map((r) => (
                    <tr key={r.psp_ref} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{r.psp_ref}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{r.order_id}</td>
                      <td className="py-3 px-3 font-bold">{formatRupiah(r.psp_amount)}</td>
                      <td className="py-3 px-3 font-bold">{formatRupiah(r.order_amount)}</td>
                      <td className="py-3 px-3">
                        {r.variance === 0 ? (
                          <span className="text-emerald-600 font-bold">Rp 0 (Sesuai)</span>
                        ) : (
                          <span className="text-rose-600 font-bold">
                            {formatRupiah(r.variance)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          MATCHED
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-slate-400 text-[11px]">Terekonsiliasi</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PAYOUTS (FR-D5) */}
        {activeTab === 'payouts' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Jadwal Pencairan Dana (Payouts) ke Merchant & Kurir
              </h3>
              <p className="text-xs text-slate-500">
                Di Fase 0, Sonnet tidak menampung dana pihak ketiga secara permanen. Payout dicatat
                dan dieksekusi berkala.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Payout Merchant (Net GMV - Komisi)
                </h4>
                <div className="space-y-2 text-xs">
                  {merchants.slice(0, 5).map((m) => (
                    <div
                      key={m.id}
                      className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{m.name}</p>
                        <p className="text-[11px] text-slate-500">Jadwal H+1 Sore • BCA 8821xxxx</p>
                      </div>
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        Siap Transfer
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Honor Kurir Mitra (Akumulasi Trip)
                </h4>
                <div className="space-y-2 text-xs">
                  {couriers.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {c.completed_trips} trip selesai • Mingguan
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">
                          {formatRupiah(c.completed_trips * 6000)}
                        </p>
                        <span className="text-[10px] text-slate-400">Terjadwal Jumat</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
