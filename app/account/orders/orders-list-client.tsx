"use client";

import Link from "next/link";
import {
  Package,
  Truck,
  Clock,
  CheckCircle2,
  CreditCard,
  ChevronRight,
} from "lucide-react";

import type { Order } from "@/app/components/lib/orders";
import { useProducts } from "@/app/components/lib/products-store";

type OrdersListClientProps = {
  orders: Order[];
};

const STATUS_CONFIG = {
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-700",
    icon: CheckCircle2,
  },
  processing: {
    label: "Processing",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
  shipped: {
    label: "Shipped",
    color: "bg-purple-100 text-purple-700",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-700",
    icon: Package,
  },
} as const;

const PAYMENT_STATUS_CONFIG = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  PAID: { label: "Paid", color: "bg-green-100 text-green-700" },
  FAILED: { label: "Failed", color: "bg-red-100 text-red-700" },
  REFUNDED: { label: "Refunded", color: "bg-gray-100 text-gray-700" },
} as const;

export default function OrdersListClient({ orders }: OrdersListClientProps) {
  useProducts();

  return (
    <div className="mt-8 space-y-4">
      {orders.map((order) => {
        const statusConfig = STATUS_CONFIG[order.status];
        const paymentConfig = PAYMENT_STATUS_CONFIG[order.paymentStatus];
        const StatusIcon = statusConfig.icon;

        return (
          <Link
            key={order.id}
            href={`/track-order?id=${encodeURIComponent(order.id)}`}
            className="block rounded-2xl border border-line bg-white p-5 transition-all hover:border-accent hover:shadow-[0_4px_20px_-4px_rgba(6,182,212,0.15)] sm:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Left: Order Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <StatusIcon size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-ink-950">{order.id}</p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {order.items.slice(0, 3).map((item, index) => (
                    <span
                      key={index}
                      className="rounded-lg bg-canvas px-2.5 py-1 text-xs font-medium text-ink-600"
                    >
                      Product #{item.productId} × {item.quantity}
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="rounded-lg bg-canvas px-2.5 py-1 text-xs font-medium text-ink-400">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Right: Status & Amount */}
              <div className="flex items-center gap-4 sm:text-right">
                <div>
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                  {order.payment !== "COD" && (
                    <div className="mt-1">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${paymentConfig.color}`}>
                        {paymentConfig.label}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-lg font-black text-ink-950">
                    Rs. {order.total.toLocaleString("en-IN")}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {order.payment}
                  </p>
                </div>
                <ChevronRight size={20} className="text-ink-300" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
