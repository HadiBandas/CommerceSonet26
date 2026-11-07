/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { CustomerStorefront } from './components/CustomerStorefront';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { MerchantPortal } from './components/MerchantPortal';
import { CourierWebView } from './components/CourierWebView';
import { OpsConsole } from './components/OpsConsole';
import { FinanceLedger } from './components/FinanceLedger';
import { PilotKPIDashboard } from './components/PilotKPIDashboard';
import { NotificationDrawer } from './components/NotificationDrawer';
import { LandingPage } from './components/LandingPage';
import { Shield, Sparkles, MapPin, ExternalLink } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeRole, setActiveRole } = useApp();

  // Check URL params for autostart
  const isAutostart = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('autostart') === '1';

  const [showLandingPage, setShowLandingPage] = useState(!isAutostart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(null);

  const handleOrderSuccess = (orderId: string) => {
    setIsCheckoutOpen(false);
    setTrackedOrderId(orderId);
    setIsTrackingOpen(true);
  };

  if (showLandingPage) {
    return (
      <LandingPage
        onEnterApp={(role) => {
          setActiveRole(role);
          setShowLandingPage(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Universal Header with Role Switcher & Back to Portal button */}
      <Header
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenTracking={() => {
          setTrackedOrderId(null);
          setIsTrackingOpen(true);
        }}
        onReturnToLanding={() => setShowLandingPage(true)}
      />

      {/* Main Persona Surfaces */}
      <main className="flex-1">
        {activeRole === 'customer' && (
          <CustomerStorefront
            onOpenCart={() => setIsCartOpen(true)}
            onOpenTracking={() => {
              setTrackedOrderId(null);
              setIsTrackingOpen(true);
            }}
          />
        )}

        {activeRole === 'merchant' && <MerchantPortal />}

        {activeRole === 'courier' && <CourierWebView />}

        {activeRole === 'ops' && <OpsConsole />}

        {activeRole === 'finance' && <FinanceLedger />}

        {activeRole === 'analytics' && <PilotKPIDashboard />}
      </main>

      {/* Floating Drawers & Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        orderId={trackedOrderId}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectOrder={(orderId) => {
          setTrackedOrderId(orderId);
          setIsTrackingOpen(true);
        }}
      />

      {/* Standard Footer with Pilot Compliance Notice */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              S
            </div>
            <span className="font-semibold text-slate-200">
              Sonnet Digital Ecosystem — Fase 0 Concierge MVP
            </span>
            <span>•</span>
            <span>Micro-Zone Buah Batu Bandung</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>UU PDP Compliance v1.0</span>
            <span>•</span>
            <span>Licensed PSP Settlement</span>
            <span>•</span>
            <button
              onClick={() => setActiveRole('analytics')}
              className="text-blue-400 hover:underline"
            >
              8 Gate 1 Scorecard
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
