import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../context/AppContext';
import {
  Bike,
  Store,
  MapPin,
  Navigation,
  Layers,
  Eye,
  CheckCircle2,
  Clock,
  Compass,
  Maximize2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Order, Merchant } from '../types';

interface MicroZoneMapProps {
  onSelectOrder?: (orderId: string) => void;
}

export const MicroZoneMap: React.FC<MicroZoneMapProps> = ({ onSelectOrder }) => {
  const { zones, activeZoneId, merchants, orders, couriers } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [showBoundary, setShowBoundary] = useState<boolean>(true);
  const [showCouriers, setShowCouriers] = useState<boolean>(true);
  const [selectedRouteOrderId, setSelectedRouteOrderId] = useState<string | null>(null);

  // Active Zone
  const currentZone = zones.find((z) => z.id === activeZoneId) || zones[0];

  // Active orders with delivery
  const activeDeliveryOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        (o.status === 'out_for_delivery' ||
          o.status === 'ready_for_pickup' ||
          o.status === 'processing' ||
          o.status === 'paid' ||
          o.status === 'completed') &&
        o.zone_id === activeZoneId
    );
  }, [orders, activeZoneId]);

  // Coordinate mock helper around micro-zone center
  // Maps address string to realistic micro-zone coordinates for rendering
  const getCustomerCoords = (order: Order): [number, number] => {
    // Generate deterministic coordinates inside Buah Batu zone based on order ID
    const hash = order.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const latOffset = ((hash % 100) - 50) * 0.00035;
    const lngOffset = (((hash * 7) % 100) - 50) * 0.00035;
    return [currentZone.center.lat + latOffset + 0.004, currentZone.center.lng + lngOffset - 0.002];
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentZone.center.lat, currentZone.center.lng],
        zoom: 14,
        zoomControl: false,
      });

      // Add zoom control at top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // OpenStreetMap Tiles (Fast, lightweight, no API key needed)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | Sonnet Telematics',
        maxZoom: 18,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([currentZone.center.lat, currentZone.center.lng], 14);
    }

    return () => {
      // Keep map alive or clean up on unmount
    };
  }, [currentZone]);

  // Update map layers whenever state or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    // 1. Micro-Zone Boundary Circle & Hotspot Clusters (FR-A1, FR-F4)
    if (showBoundary) {
      const boundaryCircle = L.circle([currentZone.center.lat, currentZone.center.lng], {
        radius: currentZone.radius_km * 1000,
        color: '#2563eb', // Blue-600
        weight: 2,
        dashArray: '6, 6',
        fillColor: '#3b82f6',
        fillOpacity: 0.06,
      });
      boundaryCircle.bindTooltip(
        `<div class="text-xs font-bold text-blue-900">${currentZone.name}</div><div class="text-[10px] text-slate-500">Radius Layanan: ${currentZone.radius_km} km</div>`,
        { permanent: false, direction: 'top' }
      );
      layers.addLayer(boundaryCircle);

      // Inner dense coverage core
      const coreCircle = L.circle([currentZone.center.lat, currentZone.center.lng], {
        radius: 1800,
        color: '#059669',
        weight: 1.5,
        fillColor: '#10b981',
        fillOpacity: 0.04,
      });
      layers.addLayer(coreCircle);
    }

    // 2. Merchant Hot-Spots (Pins with category colors and density glow)
    if (showHotspots) {
      merchants
        .filter((m) => m.zone_id === activeZoneId)
        .forEach((merchant) => {
          const isSelectedMerchant =
            selectedRouteOrderId &&
            orders.find((o) => o.id === selectedRouteOrderId)?.merchant_id === merchant.id;

          const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
            fnb: { bg: 'bg-amber-500', border: 'border-amber-600', text: 'text-amber-900' },
            groceries: { bg: 'bg-emerald-600', border: 'border-emerald-700', text: 'text-emerald-900' },
            pharmacy: { bg: 'bg-rose-500', border: 'border-rose-600', text: 'text-rose-900' },
            services: { bg: 'bg-blue-600', border: 'border-blue-700', text: 'text-blue-900' },
            retail: { bg: 'bg-purple-600', border: 'border-purple-700', text: 'text-purple-900' },
          };

          const style = categoryColors[merchant.category] || categoryColors.fnb;

          // Pulse ring for merchants with active orders
          const hasActiveOrders = orders.some(
            (o) =>
              o.merchant_id === merchant.id &&
              o.status !== 'completed' &&
              o.status !== 'cancelled'
          );

          const iconHtml = `
            <div class="relative group cursor-pointer">
              ${
                hasActiveOrders
                  ? '<div class="absolute -inset-1.5 rounded-full bg-amber-400 opacity-75 animate-ping"></div>'
                  : ''
              }
              <div class="relative w-7 h-7 rounded-full ${style.bg} border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs transform transition hover:scale-125">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
              </div>
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-merchant-pin',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            popupAnchor: [0, -14],
          });

          const marker = L.marker([merchant.lat, merchant.lng], { icon: customIcon });

          const popupContent = `
            <div class="p-1 min-w-[190px] font-sans">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 uppercase tracking-wider">${merchant.category_label}</span>
                <span class="text-[10px] font-bold text-amber-600">★ ${merchant.rating}</span>
              </div>
              <h4 class="font-extrabold text-xs text-slate-900 mt-1">${merchant.name}</h4>
              <p class="text-[10px] text-slate-500 mt-0.5">${merchant.address}</p>
              <div class="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span class="text-slate-600">Komisi: <strong>${merchant.commission_rate * 100}%</strong></span>
                <span class="font-bold text-emerald-600">${merchant.is_open ? 'BUKA' : 'TUTUP'}</span>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
          layers.addLayer(marker);
        });
    }

    // 3. Active Delivery Routes & Courier Nodes
    if (showRoutes) {
      activeDeliveryOrders.forEach((order) => {
        const merchant = merchants.find((m) => m.id === order.merchant_id);
        if (!merchant) return;

        const customerCoords = getCustomerCoords(order);
        const merchantCoords: [number, number] = [merchant.lat, merchant.lng];

        // Courier midpoint simulation
        const courierCoords: [number, number] = [
          merchantCoords[0] + (customerCoords[0] - merchantCoords[0]) * 0.45,
          merchantCoords[1] + (customerCoords[1] - merchantCoords[1]) * 0.45,
        ];

        const isSelected = selectedRouteOrderId === order.id;

        // Route color based on status
        let routeColor = '#3b82f6'; // blue default
        let routeDash = '5, 5';
        if (order.status === 'out_for_delivery') {
          routeColor = '#7c3aed'; // vibrant purple
          routeDash = '0';
        } else if (order.status === 'ready_for_pickup') {
          routeColor = '#f59e0b'; // amber
          routeDash = '6, 6';
        } else if (order.status === 'completed') {
          routeColor = '#10b981'; // emerald
          routeDash = '0';
        }

        // Draw polyline route connecting Merchant -> Courier -> Customer
        const routeCoords: [number, number][] =
          order.status === 'out_for_delivery'
            ? [merchantCoords, courierCoords, customerCoords]
            : [merchantCoords, customerCoords];

        const polyline = L.polyline(routeCoords, {
          color: routeColor,
          weight: isSelected ? 5 : 3,
          opacity: isSelected ? 0.95 : 0.75,
          dashArray: routeDash,
        });

        polyline.bindTooltip(
          `<div class="text-xs font-bold font-mono">${order.id}</div><div class="text-[10px]">${order.customer_name} • ${order.status.toUpperCase()}</div>`,
          { sticky: true }
        );

        polyline.on('click', () => {
          setSelectedRouteOrderId(order.id);
          if (onSelectOrder) onSelectOrder(order.id);
        });

        layers.addLayer(polyline);

        // Destination Customer Pin
        const customerPinHtml = `
          <div class="w-6 h-6 rounded-full bg-rose-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        `;

        const customerMarker = L.marker(customerCoords, {
          icon: L.divIcon({
            html: customerPinHtml,
            className: 'custom-customer-pin',
            iconSize: [24, 24],
            iconAnchor: [12, 24],
          }),
        });

        customerMarker.bindPopup(`
          <div class="p-1 min-w-[170px] font-sans">
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 uppercase">Tujuan Pengantaran</span>
            <h4 class="font-bold text-xs text-slate-900 mt-1">${order.customer_name}</h4>
            <p class="text-[10px] text-slate-500">${order.delivery_address}</p>
            <div class="mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-600 flex justify-between">
              <span>Order: <strong>${order.id}</strong></span>
              <span class="font-bold text-blue-700">Rp ${order.total.toLocaleString('id-ID')}</span>
            </div>
          </div>
        `);

        layers.addLayer(customerMarker);

        // Live Courier Node on route (if assigned)
        if (showCouriers && order.delivery) {
          const courierPinHtml = `
            <div class="relative cursor-pointer">
              <div class="absolute -inset-1 rounded-full bg-purple-500 opacity-60 animate-ping"></div>
              <div class="relative w-7 h-7 rounded-full bg-slate-900 border-2 border-amber-400 shadow-lg flex items-center justify-center text-amber-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
              </div>
            </div>
          `;

          const courierMarker = L.marker(courierCoords, {
            icon: L.divIcon({
              html: courierPinHtml,
              className: 'custom-courier-pin',
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            }),
          });

          courierMarker.bindPopup(`
            <div class="p-1 min-w-[180px] font-sans">
              <div class="flex items-center gap-1.5">
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">KURIR AKTIF</span>
                <span class="text-[10px] text-slate-400">Token: ${order.delivery.token.slice(-6)}</span>
              </div>
              <h4 class="font-extrabold text-xs text-slate-900 mt-1">${order.delivery.courier_name}</h4>
              <p class="text-[10px] text-slate-500">${order.delivery.courier_phone}</p>
              <div class="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span class="text-slate-600">Ongkir Kurir:</span>
                <span class="font-extrabold text-emerald-700">Rp ${order.delivery.courier_cost.toLocaleString('id-ID')}</span>
              </div>
            </div>
          `);

          layers.addLayer(courierMarker);
        }
      });
    }
  }, [
    activeZoneId,
    currentZone,
    merchants,
    orders,
    activeDeliveryOrders,
    showRoutes,
    showHotspots,
    showBoundary,
    showCouriers,
    selectedRouteOrderId,
    onSelectOrder,
  ]);

  const handleFocusOrderRoute = (order: Order) => {
    setSelectedRouteOrderId(order.id);
    const map = mapInstanceRef.current;
    if (!map) return;

    const merchant = merchants.find((m) => m.id === order.merchant_id);
    if (!merchant) return;

    const customerCoords = getCustomerCoords(order);
    const bounds = L.latLngBounds([[merchant.lat, merchant.lng], customerCoords]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
  };

  const handleResetView = () => {
    setSelectedRouteOrderId(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([currentZone.center.lat, currentZone.center.lng], 14);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Map Control Toolbar */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white tracking-wide">
                Live Micro-Zone Delivery Map
              </h3>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.2 rounded-full font-mono">
                TELEMATICS ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {currentZone.name} • {merchants.filter((m) => m.zone_id === activeZoneId).length} UMKM
              Mitra • {activeDeliveryOrders.length} Rute Berjalan
            </p>
          </div>
        </div>

        {/* Layer Filter Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition text-[11px] ${
              showRoutes
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Navigation className="w-3 h-3" />
            <span>Rute Pengantaran</span>
          </button>

          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition text-[11px] ${
              showHotspots
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Store className="w-3 h-3" />
            <span>Hot-Spot UMKM</span>
          </button>

          <button
            onClick={() => setShowCouriers(!showCouriers)}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition text-[11px] ${
              showCouriers
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Bike className="w-3 h-3" />
            <span>Armada Kurir</span>
          </button>

          <button
            onClick={() => setShowBoundary(!showBoundary)}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition text-[11px] ${
              showBoundary
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Batas Zona</span>
          </button>

          <button
            onClick={handleResetView}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            title="Pusatkan Kembali Peta"
            aria-label="Pusatkan kembali peta"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative w-full h-[460px] bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Legend Overlay on Map */}
        <div className="absolute bottom-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-2xl border border-slate-700/80 shadow-lg text-[10px] space-y-1.5 pointer-events-auto max-w-[240px]">
          <p className="font-bold text-[11px] text-slate-200">Legenda Micro-Zone:</p>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white shrink-0" />
            <span className="text-slate-300">Merchant / Hot-Spot UMKM</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-amber-400 shrink-0" />
            <span className="text-slate-300">Kurir Mitra Bergerak</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 border border-white shrink-0" />
            <span className="text-slate-300">Tujuan Rumah Warga</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-purple-500 shrink-0" />
            <span className="text-slate-300">Rute Sedang Diantar</span>
          </div>
        </div>

        {/* Selected Route Info Card Overlay */}
        {selectedRouteOrderId && (
          <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md text-slate-900 p-3.5 rounded-2xl border border-blue-500 shadow-xl text-xs max-w-xs animate-in fade-in">
            {(() => {
              const order = orders.find((o) => o.id === selectedRouteOrderId);
              if (!order) return null;
              const mch = merchants.find((m) => m.id === order.merchant_id);
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-700">{order.id}</span>
                    <button
                      onClick={() => setSelectedRouteOrderId(null)}
                      className="text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="font-bold text-slate-800 leading-snug">{order.customer_name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{order.delivery_address}</p>
                  <div className="pt-1.5 border-t border-slate-200 text-[11px] space-y-0.5">
                    <p>
                      Merchant: <strong>{mch?.name}</strong>
                    </p>
                    <p>
                      Kurir: <strong>{order.delivery?.courier_name || 'Belum ditugaskan'}</strong>
                    </p>
                    <p className="text-emerald-700 font-extrabold">
                      Total: Rp {order.total.toLocaleString('id-ID')} (CM: Rp{' '}
                      {order.financials.contribution_margin.toLocaleString('id-ID')})
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Active Route Quick Selector Ribbon */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-500 font-bold shrink-0 flex items-center gap-1">
          <Navigation className="w-3.5 h-3.5 text-blue-600" />
          Fokus Rute:
        </span>
        {activeDeliveryOrders.map((ord) => {
          const isSelected = selectedRouteOrderId === ord.id;
          return (
            <button
              key={ord.id}
              onClick={() => handleFocusOrderRoute(ord)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-200 border border-slate-200 text-slate-700'
              }`}
            >
              <span className="font-mono">{ord.id.slice(-6)}</span>
              <span className="text-[10px] text-slate-400">•</span>
              <span className="truncate max-w-[100px]">{ord.customer_name.split(' ')[0]}</span>
              <span
                className={`text-[9px] px-1 rounded ${
                  ord.status === 'out_for_delivery'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {ord.status === 'out_for_delivery' ? 'Antar' : 'Proses'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
