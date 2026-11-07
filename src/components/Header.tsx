import React from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import {
  ShoppingBag,
  Store,
  Bike,
  ShieldAlert,
  Coins,
  BarChart3,
  Bell,
  MapPin,
  ChevronDown,
  LogOut,
} from 'lucide-react';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenTracking: () => void;
  onReturnToLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenTracking,
  onReturnToLanding,
}) => {
  const {
    activeRole,
    setActiveRole,
    zones,
    activeZoneId,
    setActiveZoneId,
    cart,
    orders,
    notifications,
  } = useApp();

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;
  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'completed' && o.status !== 'cancelled'
  ).length;

  const roles: { id: Role; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'customer', label: 'Storefront Warga', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'merchant', label: 'Portal Merchant', icon: <Store className="w-4 h-4" /> },
    { id: 'courier', label: 'Kurir Link Web', icon: <Bike className="w-4 h-4" /> },
    {
      id: 'ops',
      label: 'Ops & Dispatch',
      icon: <ShieldAlert className="w-4 h-4" />,
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
    },
    { id: 'finance', label: 'Finance & Ledger', icon: <Coins className="w-4 h-4" /> },
    { id: 'analytics', label: 'Executive KPI Pilot', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const currentZone = zones.find((z) => z.id === activeZoneId);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      {/* Top Banner: Sonnet Ecosystem branding & Zone Selector */}
      <div className="bg-slate-900 text-slate-100 text-xs px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded font-bold bg-amber-500 text-slate-950 text-[10px] tracking-wider uppercase">
              Fase 0 Pilot
            </span>
            <span className="font-semibold text-slate-200">
              Sonnet Digital Ecosystem — Concierge MVP
            </span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline text-slate-400">
              Micro-Zone Commerce & Hyperlocal Delivery
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Zone Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] text-slate-400">Zona:</span>
              <select
                value={activeZoneId}
                onChange={(e) => setActiveZoneId(e.target.value)}
                className="bg-transparent text-slate-100 text-xs font-medium focus:outline-none cursor-pointer"
                aria-label="Pilih micro-zone"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id} className="bg-slate-900 text-slate-100">
                    {z.name} {z.active ? '(Aktif)' : '(Waitlist)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Simulated WhatsApp Notification button */}
            <button
              onClick={onOpenNotifications}
              className="relative flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-xs font-medium transition"
              aria-label="Buka notifikasi WhatsApp"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Notifikasi WA</span>
              {unreadNotifs > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {unreadNotifs}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar: Role switcher tabs */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-1 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
            S
          </div>
          <div className="ml-2">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
              Sonnet Concierge
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">
              {currentZone?.name || 'Micro-Zone'}
            </p>
          </div>
        </div>

        {/* Role Tabs */}
        <nav className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0" aria-label="Role navigation">
          {roles.map((r) => {
            const isActive = activeRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setActiveRole(r.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                aria-pressed={isActive}
              >
                {r.icon}
                <span>{r.label}</span>
                {r.badge !== undefined && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {r.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2 shrink-0">
          {activeRole === 'customer' && (
            <button
              onClick={onOpenTracking}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 px-3 py-1.5 rounded-lg transition"
              aria-label="Lihat status pesanan aktif"
            >
              <span>Riwayat & Lacak</span>
              {activeOrdersCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          )}

          {onReturnToLanding && (
            <button
              onClick={onReturnToLanding}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-3 py-1.5 rounded-lg transition"
              title="Kembali ke Landing Page / Ganti Peran"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Pilihan Peran / Keluar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
