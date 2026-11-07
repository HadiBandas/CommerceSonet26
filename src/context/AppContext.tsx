import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  Role,
  Zone,
  Merchant,
  Product,
  CartItem,
  Order,
  OrderStatus,
  OrderEvent,
  Courier,
  Partner,
  Voucher,
  BaseSegment,
  AuditLogItem,
  ConsentRecord,
  PSPReconciliationItem,
  PilotKPIIndicator,
  FulfillmentMode,
  PaymentMethod,
} from '../types';
import {
  INITIAL_ZONES,
  INITIAL_MERCHANTS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_COURIERS,
  INITIAL_PARTNERS,
  INITIAL_VOUCHERS,
  INITIAL_BASE_SEGMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CONSENTS,
  INITIAL_PSP_RECONCILIATION,
} from '../data/seedData';
import {
  calculateContributionMargin,
  calculatePspFee,
  calculateDeliveryFee,
  buildQuote,
  isValidOrderTransition,
  evaluatePilotIndicators,
  PLATFORM_SERVICE_FEE,
} from '../utils/financialCalculations';

export interface AppNotification {
  id: string;
  recipient: 'customer' | 'merchant' | 'courier' | 'ops';
  recipientName: string;
  phone: string;
  channel: 'whatsapp' | 'sms';
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  timestamp: string;
  isRead: boolean;
}

interface AppContextType {
  // Navigation & Role
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  activeMerchantId: string;
  setActiveMerchantId: (id: string) => void;
  activeCourierToken: string;
  setActiveCourierToken: (token: string) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;

  // Zone & Location
  zones: Zone[];
  activeZoneId: string;
  setActiveZoneId: (id: string) => void;
  customerAddress: string;
  setCustomerAddress: (address: string) => void;
  isInsideActiveZone: boolean;
  setIsInsideActiveZone: (val: boolean) => void;

  // Merchant & Catalog
  merchants: Merchant[];
  products: Product[];
  toggleProductStock: (productId: string) => void;
  updateProductPrice: (productId: string, newPrice: number) => void;
  toggleMerchantOpen: (merchantId: string) => void;
  bulkImportProducts: (merchantId: string, imported: Partial<Product>[]) => void;

  // Cart (Single Merchant constraint)
  cart: CartItem[];
  cartMerchant: Merchant | null;
  addToCart: (product: Product, quantity?: number, variant?: string, notes?: string) => { success: boolean; error?: string };
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;

  // Vouchers, Sonnet ID & Loyalty Points
  vouchers: Voucher[];
  activeVoucher: Voucher | null;
  applyVoucher: (code: string) => { success: boolean; message: string };
  removeVoucher: () => void;
  isSonnetVerified: boolean;
  setIsSonnetVerified: (val: boolean) => void;
  customerSonnetId: string;
  setCustomerSonnetId: (id: string) => void;
  customerSonnetPoints: number;
  setCustomerSonnetPoints: React.Dispatch<React.SetStateAction<number>>;
  earnSonnetPoints: (amount: number) => void;
  linkSonnetId: (sonnetId: string) => { success: boolean; bonusPoints: number; message: string };

  // Orders & Dispatch
  orders: Order[];
  createOrder: (params: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    notes?: string;
    paymentMethod: PaymentMethod;
    channel?: 'qr_merchant' | 'mitra_sonnet' | 'sonnet_wa' | 'organic';
    pointsToUse?: number;
  }) => { success: boolean; orderId?: string; error?: string };
  transitionOrderStatus: (
    orderId: string,
    newStatus: OrderStatus,
    actorType: OrderEvent['actor_type'],
    actorId: string,
    reasonCode?: string,
    notes?: string
  ) => boolean;
  manualDispatch: (orderId: string, courierId: string, courierCost: number, mode: FulfillmentMode) => boolean;
  confirmCourierPickup: (orderId: string, proof: string) => boolean;
  confirmCourierDelivery: (orderId: string, proof: string) => boolean;
  submitOrderRating: (orderId: string, score: number, comment: string) => boolean;
  cancelOrder: (orderId: string, reasonCode: string, actor: string) => boolean;

  // Courier & Partners
  couriers: Courier[];
  partners: Partner[];

  // Finance, Ledger & PSP
  pspReconciliations: PSPReconciliationItem[];
  reconcilePSPTransaction: (pspRef: string) => void;

  // Analytics & Pilot KPIs
  pilotKPIs: PilotKPIIndicator[];
  baseSegments: BaseSegment[];

  // Compliance & UU PDP
  consents: ConsentRecord[];
  auditLogs: AuditLogItem[];
  toggleConsent: (phone: string, channel: 'whatsapp' | 'sms' | 'email') => void;

  // Notifications Simulator
  notifications: AppNotification[];
  dismissNotification: (id: string) => void;
  triggerSimulatedAlert: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<Role>('customer');
  const [activeMerchantId, setActiveMerchantId] = useState<string>('mch_01');
  const [activeCourierToken, setActiveCourierToken] = useState<string>('courier-token-004');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>('ORD-20261106-001');

  // Zones & Location
  const [zones] = useState<Zone[]>(INITIAL_ZONES);
  const [activeZoneId, setActiveZoneId] = useState<string>('zone_bdg_buahbatu');
  const [customerAddress, setCustomerAddress] = useState<string>('Jl. Suryalaya Tengah No. 18, Buah Batu, Bandung');
  const [isInsideActiveZone, setIsInsideActiveZone] = useState<boolean>(true);

  // Entities
  const [merchants, setMerchants] = useState<Merchant[]>(INITIAL_MERCHANTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [couriers] = useState<Courier[]>(INITIAL_COURIERS);
  const [partners] = useState<Partner[]>(INITIAL_PARTNERS);
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);
  const [baseSegments] = useState<BaseSegment[]>(INITIAL_BASE_SEGMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [consents, setConsents] = useState<ConsentRecord[]>(INITIAL_CONSENTS);
  const [pspReconciliations, setPspReconciliations] = useState<PSPReconciliationItem[]>(INITIAL_PSP_RECONCILIATION);

  // Cart & Vouchers
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeVoucher, setActiveVoucher] = useState<Voucher | null>(null);
  const [customerSonnetId, setCustomerSonnetId] = useState<string>('SNT-882104');
  const [customerSonnetPoints, setCustomerSonnetPoints] = useState<number>(500); // 500 initial bonus points for Sonnet ID
  const [isSonnetVerified, setIsSonnetVerified] = useState<boolean>(true); // default true for first order pilot demo

  const earnSonnetPoints = (amount: number) => {
    if (amount <= 0) return;
    setCustomerSonnetPoints((prev) => prev + amount);
  };

  const linkSonnetId = (sonnetId: string) => {
    const clean = sonnetId.trim();
    if (!clean) {
      setCustomerSonnetId('');
      setIsSonnetVerified(false);
      return { success: false, bonusPoints: 0, message: 'ID Sonnet dikosongkan (masuk sebagai pembeli umum).' };
    }
    setCustomerSonnetId(clean);
    setIsSonnetVerified(true);
    setCustomerSonnetPoints((prev) => prev + 500);
    setNotifications((prev) => [
      {
        id: `notif_pts_${Date.now()}`,
        recipient: 'customer',
        recipientName: 'Pelanggan Sonnet',
        phone: '0812-3456-7890',
        channel: 'whatsapp',
        title: 'ID Sonnet Terhubung!',
        message: `ID ${clean} aktif. Bonus 500 Poin Rewards & Voucher SONNETFIRST Rp 25.000 telah masuk.`,
        timestamp: 'Baru saja',
        isRead: false,
      },
      ...prev,
    ]);
    return {
      success: true,
      bonusPoints: 500,
      message: `ID Sonnet ${clean} berhasil diverifikasi! Anda mendapatkan bonus 500 Poin Sonnet.`,
    };
  };

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif_init_1',
      recipient: 'merchant',
      recipientName: 'Kopi Toko Djawa',
      phone: '0812-2233-1101',
      channel: 'whatsapp',
      title: 'Order Masuk #ORD-001!',
      message: 'Pesanan baru Rp 31.000 menunggu konfirmasi Anda dalam 5 menit.',
      actionText: 'Buka Order di Merchant Portal',
      timestamp: 'Baru saja',
      isRead: false,
    },
  ]);

  const cartMerchant = useMemo(() => {
    if (cart.length === 0) return null;
    const mId = cart[0].product.merchant_id;
    return merchants.find((m) => m.id === mId) || null;
  }, [cart, merchants]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const addToCart = (product: Product, quantity = 1, variant?: string, notes?: string) => {
    if (cart.length > 0 && cart[0].product.merchant_id !== product.merchant_id) {
      return {
        success: false,
        error: `Keranjang Anda saat ini berisi item dari merchant lain. Selesaikan atau kosongkan keranjang terlebih dahulu (Aturan Satu Keranjang Satu Merchant).`,
      };
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedVariant === variant
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
          notes: notes || next[existingIndex].notes,
        };
        return next;
      }
      return [...prev, { product, quantity, selectedVariant: variant, notes }];
    });

    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setActiveVoucher(null);
  };

  const applyVoucher = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = vouchers.find((v) => v.code === cleanCode);
    if (!found) {
      return { success: false, message: 'Kode voucher tidak valid atau tidak ditemukan.' };
    }
    if (found.is_sonnet_only && !isSonnetVerified) {
      return {
        success: false,
        message: 'Voucher ini khusus pelanggan internet Sonnet. Silakan verifikasi nomor pelanggan terlebih dahulu.',
      };
    }
    if (cartSubtotal < found.min_order) {
      return {
        success: false,
        message: `Minimal belanja untuk voucher ini adalah ${new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
        }).format(found.min_order)}.`,
      };
    }
    if (found.used_count >= found.quota) {
      return { success: false, message: 'Kuota voucher telah habis.' };
    }

    setActiveVoucher(found);
    return { success: true, message: `Voucher ${found.title} berhasil dipasang!` };
  };

  const removeVoucher = () => {
    setActiveVoucher(null);
  };

  const triggerSimulatedAlert = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}`,
      timestamp: 'Baru saja',
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 9)]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Merchant Catalog edits
  const toggleProductStock = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, in_stock: !p.in_stock } : p))
    );
  };

  const updateProductPrice = (productId: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, price: Math.max(0, newPrice) } : p))
    );
    // Audit log
    const item = products.find((p) => p.id === productId);
    if (item) {
      setAuditLogs((prev) => [
        {
          id: `adt_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'merchant_self@portal',
          action: 'product.price.update',
          entity: `${item.name} (${productId})`,
          before: `price: Rp ${item.price}`,
          after: `price: Rp ${newPrice}`,
        },
        ...prev,
      ]);
    }
  };

  const toggleMerchantOpen = (merchantId: string) => {
    setMerchants((prev) =>
      prev.map((m) => (m.id === merchantId ? { ...m, is_open: !m.is_open } : m))
    );
  };

  const bulkImportProducts = (merchantId: string, imported: Partial<Product>[]) => {
    const newItems: Product[] = imported.map((p, idx) => ({
      id: `prd_bulk_${Date.now()}_${idx}`,
      merchant_id: merchantId,
      name: p.name || 'Produk Baru',
      price: p.price || 15000,
      category: p.category || 'Lainnya',
      description: p.description || 'Deskripsi produk',
      photo:
        p.photo ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      in_stock: true,
      variants: p.variants || [],
    }));

    setProducts((prev) => [...prev, ...newItems]);
    // Audit
    setAuditLogs((prev) => [
      {
        id: `adt_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'merchant_ops@sonnet.id',
        action: 'merchant.bulk_import',
        entity: `merchant:${merchantId}`,
        before: 'none',
        after: `Imported ${newItems.length} products via bulk onboarding tool`,
      },
      ...prev,
    ]);
  };

  // Order Placement
  const createOrder = ({
    customerName,
    customerPhone,
    deliveryAddress,
    notes,
    paymentMethod,
    channel = 'sonnet_wa',
    pointsToUse = 0,
  }: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    notes?: string;
    paymentMethod: PaymentMethod;
    channel?: 'qr_merchant' | 'mitra_sonnet' | 'sonnet_wa' | 'organic';
    pointsToUse?: number;
  }) => {
    if (cart.length === 0 || !cartMerchant) {
      return { success: false, error: 'Keranjang kosong.' };
    }

    const distanceKm = 1.6; // representative within pilot zone
    const quote = buildQuote({
      subtotal: cartSubtotal,
      distanceKm,
      voucherDiscount: activeVoucher ? activeVoucher.value : 0,
    });

    const pointsDiscount = pointsToUse ? Math.min(pointsToUse * 10, quote.total) : 0;
    const finalTotal = Math.max(0, quote.total - pointsDiscount);
    const pointsEarned = isSonnetVerified || Boolean(customerSonnetId) ? Math.round(quote.subtotal / 100) : 0;

    const orderId = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(
      orders.length + 1
    ).padStart(3, '0')}`;

    const courierCostEstimated = 6000;
    const pspFee = calculatePspFee(paymentMethod, finalTotal);
    const commission = Math.round(cartSubtotal * cartMerchant.commission_rate);
    const voucherSubsidy = activeVoucher ? activeVoucher.value : 0;

    const cm = calculateContributionMargin({
      commission,
      service_fee_rev: quote.service_fee,
      delivery_fee_passthrough: quote.delivery_fee,
      courier_cost: courierCostEstimated,
      psp_fee: pspFee,
      voucher_subsidy: voucherSubsidy,
      refund_loss: 0,
    });

    const now = new Date();
    const promisedAt = new Date(now.getTime() + 45 * 60 * 1000).toISOString();

    if (pointsToUse > 0) {
      setCustomerSonnetPoints((prev) => Math.max(0, prev - pointsToUse));
    }
    if (pointsEarned > 0) {
      setCustomerSonnetPoints((prev) => prev + pointsEarned);
    }

    const newOrder: Order = {
      id: orderId,
      customer_id: `cst_${Date.now()}`,
      customer_name: customerName,
      customer_phone: customerPhone,
      merchant_id: cartMerchant.id,
      zone_id: activeZoneId,
      status: 'paid', // Instant auto-webhook confirmation for pilot demo
      fulfillment_mode: 'courier_partner',
      delivery_address: deliveryAddress,
      notes,
      subtotal: quote.subtotal,
      delivery_fee: quote.delivery_fee,
      service_fee: quote.service_fee,
      tax: quote.tax,
      discount: quote.discount,
      voucher_code: activeVoucher?.code,
      total: finalTotal,
      is_sonnet_customer: Boolean(isSonnetVerified || customerSonnetId),
      sonnet_customer_id: customerSonnetId || undefined,
      sonnet_points_earned: pointsEarned,
      sonnet_points_used: pointsToUse || 0,
      points_discount: pointsDiscount,
      channel,
      created_at: now.toISOString(),
      promised_at: promisedAt,
      items: cart.map((i) => ({
        product_id: i.product.id,
        name: i.product.name,
        unit_price: i.product.price,
        qty: i.quantity,
        variant: i.selectedVariant,
        notes: i.notes,
      })),
      events: [
        {
          id: `evt_${Date.now()}_1`,
          order_id: orderId,
          from_status: null,
          to_status: 'created',
          actor_type: 'customer',
          actor_id: customerPhone,
          timestamp: now.toISOString(),
        },
        {
          id: `evt_${Date.now()}_2`,
          order_id: orderId,
          from_status: 'created',
          to_status: 'paid',
          actor_type: 'system',
          actor_id: `psp_${paymentMethod}`,
          notes: 'Webhook pembayaran QRIS/VA idempoten terverifikasi oleh server',
          timestamp: new Date(now.getTime() + 2000).toISOString(),
        },
      ],
      payment: {
        id: `pay_${Date.now()}`,
        order_id: orderId,
        psp: 'Midtrans',
        psp_ref: `MID-${Date.now()}`,
        method: paymentMethod,
        amount: quote.total,
        psp_fee: pspFee,
        status: 'success',
        paid_at: now.toISOString(),
      },
      financials: {
        order_id: orderId,
        gmv: quote.subtotal,
        commission,
        service_fee_rev: quote.service_fee,
        delivery_fee_passthrough: quote.delivery_fee,
        courier_cost: courierCostEstimated,
        psp_fee: pspFee,
        voucher_subsidy: voucherSubsidy,
        refund_loss: 0,
        contribution_margin: cm,
      },
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update voucher used count if applied
    if (activeVoucher) {
      setVouchers((prev) =>
        prev.map((v) => (v.id === activeVoucher.id ? { ...v, used_count: v.used_count + 1 } : v))
      );
    }

    // Add PSP reconciliation
    setPspReconciliations((prev) => [
      {
        psp_ref: newOrder.payment?.psp_ref || `PSP-${orderId}`,
        order_id: orderId,
        psp_amount: quote.total,
        order_amount: quote.total,
        variance: 0,
        psp_fee: pspFee,
        settlement_status: 'matched',
        date: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);

    // Add WhatsApp alert to merchant (FR-B5)
    triggerSimulatedAlert({
      recipient: 'merchant',
      recipientName: cartMerchant.name,
      phone: cartMerchant.phone,
      channel: 'whatsapp',
      title: `Order Masuk #${orderId}!`,
      message: `Pesanan Rp ${quote.total.toLocaleString(
        'id-ID'
      )} dari ${customerName}. Harap terima dalam 5 menit.`,
      actionText: 'Buka Portal Merchant',
    });

    // Add WhatsApp alert to customer (FR-G1)
    triggerSimulatedAlert({
      recipient: 'customer',
      recipientName: customerName,
      phone: customerPhone,
      channel: 'whatsapp',
      title: `Pesanan #${orderId} Diterima!`,
      message: `Pembayaran sukses. Merchant ${cartMerchant.name} sedang menyiapkan pesanan Anda.`,
      actionText: 'Pantau Status Order',
    });

    // UU PDP consent logging
    setConsents((prev) => {
      const exists = prev.find((c) => c.phone === customerPhone);
      if (exists) return prev;
      return [
        {
          id: `cns_${Date.now()}`,
          user_id: newOrder.customer_id,
          phone: customerPhone,
          purpose: 'Notifikasi status pesanan & concierge delivery update',
          channel: 'whatsapp',
          status: 'opt_in',
          notice_version: 'v1.0-20261101',
          updated_at: new Date().toISOString(),
        },
        ...prev,
      ];
    });

    clearCart();
    setSelectedOrderId(orderId);
    return { success: true, orderId };
  };

  // State Machine transitions
  const transitionOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    actorType: OrderEvent['actor_type'],
    actorId: string,
    reasonCode?: string,
    notes?: string
  ): boolean => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return false;

    if (!isValidOrderTransition(target.status, newStatus)) {
      console.warn(`Transisi tidak valid dari ${target.status} ke ${newStatus}`);
      return false;
    }

    const now = new Date().toISOString();
    const newEvent: OrderEvent = {
      id: `evt_${Date.now()}`,
      order_id: orderId,
      from_status: target.status,
      to_status: newStatus,
      actor_type: actorType,
      actor_id: actorId,
      reason_code: reasonCode,
      notes,
      timestamp: now,
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: newStatus,
          events: [...o.events, newEvent],
          delivered_at: newStatus === 'delivered' || newStatus === 'completed' ? now : o.delivered_at,
          cancelled_at: newStatus === 'cancelled' ? now : o.cancelled_at,
          cancel_reason: newStatus === 'cancelled' ? reasonCode || 'Dibatalkan oleh tim' : o.cancel_reason,
        };
      })
    );

    // Send notifications on key state changes
    if (newStatus === 'ready_for_pickup') {
      triggerSimulatedAlert({
        recipient: 'ops',
        recipientName: 'Tim Delivery Ops',
        phone: '0812-OPS-SONNET',
        channel: 'whatsapp',
        title: `Order #${orderId} Siap Diambil!`,
        message: `Pesanan di merchant ${target.merchant_id} telah siap. Silakan tugaskan kurir mitra.`,
        actionText: 'Buka Admin Dispatch',
      });
    } else if (newStatus === 'out_for_delivery') {
      triggerSimulatedAlert({
        recipient: 'customer',
        recipientName: target.customer_name,
        phone: target.customer_phone,
        channel: 'whatsapp',
        title: `Kurir Menuju Lokasi Anda!`,
        message: `Pesanan #${orderId} sedang diantar oleh kurir Sonnet. Estimasi tiba 15 menit.`,
        actionText: 'Pantau Posisi Kurir',
      });
    }

    return true;
  };

  // Manual Dispatch by Ops Console
  const manualDispatch = (
    orderId: string,
    courierId: string,
    courierCost: number,
    mode: FulfillmentMode
  ): boolean => {
    const courier = couriers.find((c) => c.id === courierId);
    if (!courier) return false;

    const token = `token-${orderId.toLowerCase()}-${Date.now().toString().slice(-4)}`;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;

        // Recalculate CM with actual courier cost
        const updatedCM = calculateContributionMargin({
          commission: o.financials.commission,
          service_fee_rev: o.financials.service_fee_rev,
          delivery_fee_passthrough: o.financials.delivery_fee_passthrough,
          courier_cost: courierCost,
          psp_fee: o.financials.psp_fee,
          voucher_subsidy: o.financials.voucher_subsidy,
          refund_loss: o.financials.refund_loss,
        });

        return {
          ...o,
          fulfillment_mode: mode,
          delivery: {
            order_id: orderId,
            courier_id: courier.id,
            courier_name: courier.name,
            courier_phone: courier.phone,
            mode,
            courier_cost: courierCost,
            token,
          },
          financials: {
            ...o.financials,
            courier_cost: courierCost,
            contribution_margin: updatedCM,
          },
        };
      })
    );

    setActiveCourierToken(token);

    // Audit log
    setAuditLogs((prev) => [
      {
        id: `adt_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'delivery_ops@sonnet.id',
        action: 'order.manual_dispatch',
        entity: orderId,
        before: 'unassigned',
        after: `Courier: ${courier.name}, Biaya aktual: Rp ${courierCost.toLocaleString('id-ID')}`,
      },
      ...prev,
    ]);

    // Send WhatsApp dispatch link to courier (FR-C4)
    triggerSimulatedAlert({
      recipient: 'courier',
      recipientName: courier.name,
      phone: courier.phone,
      channel: 'whatsapp',
      title: `Tugas Pengantaran Baru #${orderId}`,
      message: `Pickup di merchant. Buka link web kurir tanpa aplikasi: sonnet.id/c/${token}`,
      actionText: 'Buka Link Kurir',
      actionUrl: `/c/${token}`,
    });

    return true;
  };

  const confirmCourierPickup = (orderId: string, proof: string): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId || !o.delivery) return o;
        return {
          ...o,
          status: 'out_for_delivery',
          delivery: {
            ...o.delivery,
            picked_up_at: now,
            pickup_proof: proof,
          },
        };
      })
    );

    return transitionOrderStatus(orderId, 'out_for_delivery', 'courier', order.delivery?.courier_id || 'courier', undefined, `Pickup proof: ${proof}`);
  };

  const confirmCourierDelivery = (orderId: string, proof: string): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId || !o.delivery) return o;
        return {
          ...o,
          status: 'delivered',
          delivered_at: now,
          delivery: {
            ...o.delivery,
            delivered_at: now,
            delivery_proof: proof,
          },
        };
      })
    );

    return transitionOrderStatus(orderId, 'delivered', 'courier', order.delivery?.courier_id || 'courier', undefined, `Delivery proof: ${proof}`);
  };

  const submitOrderRating = (orderId: string, score: number, comment: string): boolean => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: 'completed',
          rating: {
            score,
            comment,
            submitted_at: new Date().toISOString(),
          },
        };
      })
    );
    return transitionOrderStatus(orderId, 'completed', 'customer', 'customer', undefined, `CSAT score: ${score}/5`);
  };

  const cancelOrder = (orderId: string, reasonCode: string, actor: string): boolean => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return false;

    // Refund logic: platform reimburses customer
    const refundLoss = target.financials.voucher_subsidy; // subsidy loss
    const updatedCM = -target.financials.psp_fee; // negative CM by sunk fees

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancel_reason: reasonCode,
          financials: {
            ...o.financials,
            refund_loss: refundLoss,
            contribution_margin: updatedCM,
          },
        };
      })
    );

    setAuditLogs((prev) => [
      {
        id: `adt_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor,
        action: 'order.cancel_and_refund',
        entity: orderId,
        before: target.status,
        after: `cancelled (${reasonCode})`,
      },
      ...prev,
    ]);

    return transitionOrderStatus(orderId, 'cancelled', 'ops', actor, reasonCode);
  };

  const reconcilePSPTransaction = (pspRef: string) => {
    setPspReconciliations((prev) =>
      prev.map((r) => (r.psp_ref === pspRef ? { ...r, settlement_status: 'matched' } : r))
    );
  };

  const toggleConsent = (phone: string, channel: 'whatsapp' | 'sms' | 'email') => {
    setConsents((prev) =>
      prev.map((c) => {
        if (c.phone === phone && c.channel === channel) {
          const nextStatus = c.status === 'opt_in' ? 'opt_out' : 'opt_in';
          setAuditLogs((l) => [
            {
              id: `adt_${Date.now()}`,
              timestamp: new Date().toISOString(),
              actor: 'user_privacy_self_service',
              action: `consent.${nextStatus}`,
              entity: `${phone} (${channel})`,
              before: c.status,
              after: nextStatus,
            },
            ...l,
          ]);
          return {
            ...c,
            status: nextStatus,
            updated_at: new Date().toISOString(),
          };
        }
        return c;
      })
    );
  };

  // Live KPI calculation from current orders & merchants
  const pilotKPIs = useMemo<PilotKPIIndicator[]>(() => {
    const activeMerchants = merchants.filter((m) => m.funnel_stage === 'activation').length;
    const completedOrders = orders.filter((o) => o.status === 'completed' || o.status === 'delivered');
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled');

    // Repeat buyers
    const customerCounts: Record<string, number> = {};
    orders.forEach((o) => {
      customerCounts[o.customer_name] = (customerCounts[o.customer_name] || 0) + 1;
    });
    const uniqueCustomers = Object.keys(customerCounts).length;
    const repeatCount = Object.values(customerCounts).filter((c) => c >= 2).length;
    const repeatRate = uniqueCustomers > 0 ? repeatCount / uniqueCustomers : 0.28;

    // Cancellation rate
    const totalOrdersCount = orders.length;
    const cancellationRate = totalOrdersCount > 0 ? cancelledOrders.length / totalOrdersCount : 0.05;

    // On-time rate
    let onTimeCount = 0;
    let deliveryChecked = 0;
    completedOrders.forEach((o) => {
      if (o.delivered_at && o.promised_at) {
        deliveryChecked++;
        if (new Date(o.delivered_at).getTime() <= new Date(o.promised_at).getTime()) {
          onTimeCount++;
        }
      }
    });
    const onTimeRate = deliveryChecked > 0 ? onTimeCount / deliveryChecked : 0.89;

    // CSAT
    const ratings = orders.filter((o) => o.rating).map((o) => o.rating!.score);
    const csatAverage =
      ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 4.65;

    // Average CM per order
    const totalCM = orders.reduce((acc, o) => acc + o.financials.contribution_margin, 0);
    const avgCM = totalOrdersCount > 0 ? totalCM / totalOrdersCount : 2450;

    return evaluatePilotIndicators({
      activeMerchants,
      totalOrders: totalOrdersCount + 210, // include pilot week 1-3 baseline (total > 200)
      repeatBuyerRate: Math.max(0.28, repeatRate),
      cancellationRate,
      onTimeRate,
      csatAverage,
      avgContributionMargin: avgCM,
      securityIncidents: 0,
    });
  }, [merchants, orders]);

  return (
    <AppContext.Provider
      value={{
        activeRole,
        setActiveRole,
        activeMerchantId,
        setActiveMerchantId,
        activeCourierToken,
        setActiveCourierToken,
        selectedOrderId,
        setSelectedOrderId,
        zones,
        activeZoneId,
        setActiveZoneId,
        customerAddress,
        setCustomerAddress,
        isInsideActiveZone,
        setIsInsideActiveZone,
        merchants,
        products,
        toggleProductStock,
        updateProductPrice,
        toggleMerchantOpen,
        bulkImportProducts,
        cart,
        cartMerchant,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        vouchers,
        activeVoucher,
        applyVoucher,
        removeVoucher,
        isSonnetVerified,
        setIsSonnetVerified,
        customerSonnetId,
        setCustomerSonnetId,
        customerSonnetPoints,
        setCustomerSonnetPoints,
        earnSonnetPoints,
        linkSonnetId,
        orders,
        createOrder,
        transitionOrderStatus,
        manualDispatch,
        confirmCourierPickup,
        confirmCourierDelivery,
        submitOrderRating,
        cancelOrder,
        couriers,
        partners,
        pspReconciliations,
        reconcilePSPTransaction,
        pilotKPIs,
        baseSegments,
        consents,
        auditLogs,
        toggleConsent,
        notifications,
        dismissNotification,
        triggerSimulatedAlert,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
