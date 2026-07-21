import type { CartItem } from "./cartcontext";

export type OrderAddress = {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
};

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type Order = {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  payment: string;
  paymentStatus: PaymentStatus;
  phonepeMerchantTransactionId?: string | null;
  phonepeTransactionId?: string | null;
  currency: string;
  address: OrderAddress;
  status: "confirmed" | "processing" | "shipped" | "delivered";
  createdAt: string;
};

export const ORDER_STEPS = [
  { key: "confirmed", label: "Order placed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
] as const;
