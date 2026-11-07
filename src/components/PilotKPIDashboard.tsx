import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  MapPin,
  ShieldCheck,
  FileText,
  Sliders,
  Layers,
  Sparkles,
} from 'lucide-react';

export const PilotKPIDashboard: React.FC = () => {
  const {
    pilotKPIs,
    baseSegments,
    zones,
    activeZoneId,
    merchants,
    orders,
    consents,
    toggleConsent,
    auditLogs,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'scoreboard' | 'segments' | 'scorecard' | 'compliance'>(
    'scoreboard'
  );

  // Overall Gate 1 Verdict
  const hasStop = pilotKPIs.some((k) => k.status === 'stop');
  const hasCaution = pilotKPIs.some((k) => k.status === 'caution');
  const allGo = pilotKPIs.every((k) => k.status === 'go');

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-blue-500 text-white font-black px-2 py-0.5 rounded tracking-wider uppercase">
                  Executive Dashboard
                </span>
                <span className="text-xs text-slate-400">Seksi 2 & 10 PRD — Gate 1 Decision</span>
              </div>
              <h2 className="text-lg font-extrabold text-white mt-1">
                Pilot KPI Scoreboard & Segmentasi Basis 4.000
              </h2>
            </div>
          </div>

          {/* Gate 1 Verdict Badge */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl px-5 py-2.5 text-right flex items-center gap-3">
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Status Gate 1 (Fase 1 Readiness)
              </p>
              <h3
                className={`text-sm font-black flex items-center gap-1.5 justify-end mt-0.5 ${
                  hasStop
                    ? 'text-rose-400'
                    : hasCaution
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {hasStop ? (
                  <>
                    <XCircle className="w-4 h-4" /> STOP / UBAH ARAH
                  </>
                ) : hasCaution ? (
                  <>
                    <AlertTriangle className="w-4 h-4" /> DALAM EVALUASI (CAUTION)
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> GO TO FASE 1 (MEMENUHI SYARAT)
                  </>
                )}
              </h3>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('scoreboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'scoreboard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>8 Indikator Gate 1 Go/No-Go</span>
          </button>

          <button
            onClick={() => setActiveTab('segments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'segments'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Segmentasi Basis 4.000 ISP (FR-F3)</span>
          </button>

          <button
            onClick={() => setActiveTab('scorecard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'scorecard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Zone Scorecard Kandidat (FR-F4)</span>
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'compliance'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Privasi UU PDP & Audit Log (FR-F7)</span>
          </button>
        </div>

        {/* TAB 1: 8 GATE 1 INDICATORS (PRD SECTION 2) */}
        {activeTab === 'scoreboard' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Matriks Keputusan Gate 1 (Ambang Konfigurasi Minggu 4)
                </h3>
                <p className="text-xs text-slate-500">
                  Data otomatis dihitung dari orders, merchants, ratings, dan ledger tanpa rekap
                  manual.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pilotKPIs.map((kpi) => {
                const isGo = kpi.status === 'go';
                const isCaution = kpi.status === 'caution';
                const statusColor = isGo
                  ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950'
                  : isCaution
                  ? 'border-amber-200 bg-amber-50/50 text-amber-950'
                  : 'border-rose-200 bg-rose-50/50 text-rose-950';

                const badgeColor = isGo
                  ? 'bg-emerald-600 text-white'
                  : isCaution
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-rose-600 text-white';

                return (
                  <div
                    key={kpi.id}
                    className={`rounded-2xl border p-4 flex flex-col justify-between shadow-2xs transition ${statusColor}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${badgeColor}`}>
                          {kpi.status.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {kpi.category.toUpperCase()}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 mt-2.5 leading-snug">
                        {kpi.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {kpi.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-slate-900">
                          {kpi.unit === 'Rp'
                            ? `Rp ${kpi.current_value.toLocaleString('id-ID')}`
                            : `${kpi.current_value} ${kpi.unit}`}
                        </span>
                      </div>

                      <div className="mt-2 text-[10px] text-slate-500 space-y-0.5">
                        <p>
                          Target Go:{' '}
                          <strong>
                            {kpi.higher_is_better ? `≥ ${kpi.target_go}` : `≤ ${kpi.target_go}`}{' '}
                            {kpi.unit !== 'Rp' ? kpi.unit : ''}
                          </strong>
                        </p>
                        <p>
                          Ambang Stop:{' '}
                          <strong>
                            {kpi.higher_is_better ? `< ${kpi.target_stop}` : `> ${kpi.target_stop}`}{' '}
                            {kpi.unit !== 'Rp' ? kpi.unit : ''}
                          </strong>
                        </p>
                        <p className="text-slate-400 font-mono text-[9px] truncate">
                          Sumber: {kpi.system_source}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: 4,000 ISP BASE SEGMENTATION (FR-F3) */}
        {activeTab === 'segments' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Segmentasi Basis 4.000 ISP Sonnet (FR-F3)
              </h3>
              <p className="text-xs text-slate-500">
                Pemisahan data logis: Pelanggan ISP, Mitra, dan Kandidat Merchant. Kolom identitas
                asli dienkripsi dan dimasking untuk mematuhi UU PDP.
              </p>
            </div>

            {/* Aggregated breakdown cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-xs text-blue-900 font-semibold">Total Basis ISP</p>
                <h4 className="text-2xl font-black text-blue-950 mt-1">4.000</h4>
                <p className="text-[10px] text-blue-700 mt-0.5">Data terdaftar di sistem Sonnet</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <p className="text-xs text-emerald-900 font-semibold">Micro-Zone Bandung</p>
                <h4 className="text-2xl font-black text-emerald-950 mt-1">2.100 (52.5%)</h4>
                <p className="text-[10px] text-emerald-700 mt-0.5">
                  Konsentrasi tertinggi di Buah Batu & Dago
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                <p className="text-xs text-purple-900 font-semibold">Status Dapat Dihubungi</p>
                <h4 className="text-2xl font-black text-purple-950 mt-1">3.420 (85.5%)</h4>
                <p className="text-[10px] text-purple-700 mt-0.5">Kanal WhatsApp aktif terverifikasi</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-xs text-amber-900 font-semibold">Kandidat Merchant Potensial</p>
                <h4 className="text-2xl font-black text-amber-950 mt-1">180 Toko</h4>
                <p className="text-[10px] text-amber-700 mt-0.5">UMKM pelanggan paket bisnis ISP</p>
              </div>
            </div>

            {/* Segment sample table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Pseudo ID (Masked)</th>
                    <th className="py-3 px-3">Jenis Segmen</th>
                    <th className="py-3 px-3">Kota</th>
                    <th className="py-3 px-3">Micro-Zone</th>
                    <th className="py-3 px-3">Paket ISP</th>
                    <th className="py-3 px-3">Dapat Dihubungi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {baseSegments.map((s) => (
                    <tr key={s.pseudo_id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-bold text-slate-900">{s.pseudo_id}</td>
                      <td className="py-3 px-3 font-sans capitalize font-medium">
                        {s.kind.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-3 font-sans">{s.city}</td>
                      <td className="py-3 px-3 font-sans text-slate-500">{s.zone_id}</td>
                      <td className="py-3 px-3 font-sans">{s.data_speed}</td>
                      <td className="py-3 px-3 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.is_contactable
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {s.is_contactable ? 'BERIZIN (OPT-IN)' : 'BELUM BERIZIN'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: MICRO-ZONE SCORECARD (FR-F4) */}
        {activeTab === 'scorecard' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Peta Densitas & Zone Scorecard (FR-F4)
              </h3>
              <p className="text-xs text-slate-500">
                Penilaian kuantitatif pemilihan micro-zone pilot berdasarkan densitas pelanggan ISP,
                kesiapan merchant, dan kelayakan logistik kurir lokal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {zones.map((z) => {
                const isSelected = z.active;
                return (
                  <div
                    key={z.id}
                    className={`rounded-3xl p-5 border flex flex-col justify-between transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isSelected ? 'ZONA PILOT TERPILIH' : 'PIPELINE FASE 1'}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{z.city}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 mt-2">{z.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{z.description}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Radius Layanan:</span>
                        <span className="font-bold text-slate-900">{z.radius_km} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Jam Operasional:</span>
                        <span className="font-bold text-slate-900">{z.service_hours}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Merchant Siap:</span>
                        <span className="font-bold text-blue-700">
                          {isSelected ? '20 Merchant (100%)' : 'Dalam Prospecting'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: COMPLIANCE & UU PDP REGISTRY (FR-F7, FR-G2) */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            {/* Consent Table */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Consent Registry UU PDP & Opt-out Manajemen (FR-G2)
                </h3>
                <p className="text-xs text-slate-500">
                  Pencatatan persetujuan pemrosesan data pribadi. Pelanggan dapat melakukan opt-out
                  kapan saja dalam 1 langkah.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Nomor Kontak (Masked)</th>
                      <th className="py-3 px-3">Tujuan Pemrosesan</th>
                      <th className="py-3 px-3">Kanal</th>
                      <th className="py-3 px-3">Versi Notice</th>
                      <th className="py-3 px-3">Status Persetujuan</th>
                      <th className="py-3 px-3 text-right">Aksi Opt-out</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {consents.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">{c.phone}</td>
                        <td className="py-3 px-3 text-slate-600">{c.purpose}</td>
                        <td className="py-3 px-3 font-bold uppercase">{c.channel}</td>
                        <td className="py-3 px-3 font-mono text-slate-500">{c.notice_version}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.status === 'opt_in'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {c.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => toggleConsent(c.phone, c.channel)}
                            className="text-xs text-blue-600 hover:underline font-semibold"
                          >
                            Toggle Status
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Audit Trail Aksi Sensitif Admin (FR-F7)
                </h3>
                <p className="text-xs text-slate-500">
                  Log append-only merekam perubahan tarif komisi, refund manual, ekspor data, dan
                  login impersonasi.
                </p>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{log.action}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString('id-ID')} WIB
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Aktor: <strong>{log.actor}</strong> • Entitas: {log.entity}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {log.before} → {log.after}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
