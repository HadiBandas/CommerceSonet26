export type Role = 'customer' | 'merchant' | 'courier' | 'ops' | 'finance' | 'analytics';

export type FunnelStage = 'prospecting' | 'qualification' | 'onboarding' | 'activation' | 'retention';

export type OrderStatus =
  | 'created'
  | 'paid'
  | 'merchant_accepted'
  | 'processing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type FulfillmentMode = 'customer_pickup' | 'merchant_self' | 'courier_partner';

export type PaymentMethod = 'qris' | 'va_bca' | 'va_mandiri' | 'gopay';

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export type PayoutStatus = 'pending' | 'processing' | 'completed';

export interface Zone {
  id: string;
  name: string;
  city: string;
  active: boolean;
  service_hours: string;
  center: { lat: number; lng: number };
  radius_km: number;
  description: string;
}

export interface Merchant {
  id: string;
  name: string;
  category: 'fnb' | 'groceries' | 'pharmacy' | 'services' | 'retail';
  category_label: string;
  zone_id: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  radius_m: number;
  hours: string;
  is_open: boolean;
  funnel_stage: FunnelStage;
  commission_rate: number; // e.g. 0.12 = 12%
  partner_id?: string;
  rating: number;
  review_count: number;
  image: string;
  description: string;
  // Sonnet Fiber Business requirement (mandatory for merchant partners)
  sonnet_customer_id: string; // Wajib: ID Pelanggan Bisnis Sonnet (e.g. SNT-BIZ-BB01)
  sonnet_plan: string; // e.g. 'Sonnet Fiber Biz Pro 100 Mbps'
  is_sonnet_verified: boolean;
}

export interface Product {
  id: string;
  merchant_id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  photo: string;
  in_stock: boolean;
  variants?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
  notes?: string;
}

export interface Quote {
  quote_id: string;
  merchant_id: string;
  subtotal: number;
  distance_km: number;
  delivery_fee: number;
  service_fee: number;
  tax: number;
  discount: number;
  voucher_code?: string;
  total: number;
  valid_until: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  unit_price: number;
  qty: number;
  variant?: string;
  notes?: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  actor_type: 'customer' | 'merchant' | 'courier' | 'ops' | 'system';
  actor_id: string;
  reason_code?: string;
  notes?: string;
  timestamp: string;
}

export interface DeliveryRecord {
  order_id: string;
  courier_id: string;
  courier_name: string;
  courier_phone: string;
  mode: FulfillmentMode;
  courier_cost: number; // Biaya aktual yang dibayarkan ke kurir
  picked_up_at?: string;
  delivered_at?: string;
  pickup_proof?: string;
  delivery_proof?: string;
  token: string;
}

export interface Courier {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  contract_type: 'partner' | 'internal_ops';
  zone_id: string;
  is_active: boolean;
  completed_trips: number;
  rating: number;
}

export interface PaymentRecord {
  id: string;
  order_id: string;
  psp: 'Midtrans' | 'Xendit' | 'DOKU';
  psp_ref: string;
  method: PaymentMethod;
  amount: number;
  psp_fee: number;
  status: PaymentStatus;
  paid_at?: string;
}

export interface OrderFinancials {
  order_id: string;
  gmv: number;
  commission: number;
  service_fee_rev: number;
  delivery_fee_passthrough: number; // Ongkir dibayar pelanggan
  courier_cost: number; // Ongkir aktual kurir
  psp_fee: number;
  voucher_subsidy: number;
  refund_loss: number;
  contribution_margin: number;
}

export interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  merchant_id: string;
  zone_id: string;
  status: OrderStatus;
  fulfillment_mode: FulfillmentMode;
  delivery_address: string;
  notes?: string;
  subtotal: number;
  delivery_fee: number;
  service_fee: number;
  tax: number;
  discount: number;
  total: number;
  voucher_code?: string;
  is_sonnet_customer: boolean;
  sonnet_customer_id?: string;
  sonnet_points_earned?: number;
  sonnet_points_used?: number;
  points_discount?: number;
  channel: 'qr_merchant' | 'mitra_sonnet' | 'sonnet_wa' | 'organic';
  created_at: string;
  promised_at: string; // SLA promised delivery time
  delivered_at?: string;
  cancelled_at?: string;
  cancel_reason?: string;
  items: OrderItem[];
  events: OrderEvent[];
  delivery?: DeliveryRecord;
  payment?: PaymentRecord;
  financials: OrderFinancials;
  rating?: {
    score: number;
    comment: string;
    submitted_at: string;
  };
}

export interface Voucher {
  id: string;
  code: string;
  title: string;
  value: number;
  min_order: number;
  quota: number;
  used_count: number;
  valid_until: string;
  is_sonnet_only: boolean;
  cost_center: 'marketing_pilot' | 'merchant_co_op';
}

export interface Partner {
  id: string;
  code: string;
  name: string;
  phone: string;
  type: 'community_leader' | 'field_technician' | 'local_agent';
  zone_id: string;
  merchant_count: number;
  order_count: number;
}

export interface ConsentRecord {
  id: string;
  user_id: string;
  phone: string;
  purpose: string;
  channel: 'whatsapp' | 'sms' | 'email';
  status: 'opt_in' | 'opt_out';
  notice_version: string;
  updated_at: string;
}

export interface BaseSegment {
  pseudo_id: string;
  kind: 'pelanggan_isp' | 'mitra_sonnet' | 'merchant_kandidat';
  city: 'Bandung' | 'Jakarta' | 'Sukabumi';
  zone_id: string;
  is_active: boolean;
  is_contactable: boolean;
  data_speed?: string;
  avg_arpu?: number;
}

export interface PilotKPIIndicator {
  id: string;
  name: string;
  category: 'merchant' | 'orders' | 'quality' | 'finance' | 'compliance';
  current_value: number;
  unit: string;
  target_go: number;
  target_stop: number;
  higher_is_better: boolean;
  status: 'go' | 'caution' | 'stop';
  system_source: string;
  description: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entity: string;
  before: string;
  after: string;
}

export interface PSPReconciliationItem {
  psp_ref: string;
  order_id: string;
  psp_amount: number;
  order_amount: number;
  variance: number;
  psp_fee: number;
  settlement_status: 'matched' | 'unmatched_psp' | 'unmatched_order' | 'variance_detected';
  date: string;
}
