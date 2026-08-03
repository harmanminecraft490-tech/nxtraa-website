"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, Search, Truck, XCircle, Loader2, MapPin, Clock } from "lucide-react";

import AnnouncementBar from "../components/layout/announcementbar";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";

export default function TrackOrderClient() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams?.get("id") ?? "";
  const [orderId, setOrderId] = useState(initialOrderId);
  
  const [trackingData, setTrackingData] = useState<any>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async (id: string) => {
    const trimmed = id.trim();

    if (!trimmed) {
      setTrackingData(null);
      setSearched(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tracking?id=${encodeURIComponent(trimmed)}`);

      if (!response.ok) {
        setTrackingData(null);
        setSearched(true);
        setError("Order not found or invalid tracking ID.");
        return;
      }

      const data = await response.json();
      setTrackingData(data);
      setSearched(true);
    } catch (err: any) {
      setError(err.message);
      setTrackingData(null);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      const timer = window.setTimeout(() => {
        void fetchTracking(initialOrderId);
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [initialOrderId]);

  // Auto-refresh tracking every 30 seconds if an order is active and not delivered/cancelled
  useEffect(() => {
    if (!trackingData || trackingData.status === 'DELIVERED' || trackingData.status === 'CANCELLED') return;
    
    const interval = setInterval(() => {
      fetchTracking(trackingData.orderNumber || trackingData.awbCode);
    }, 30000);

    return () => clearInterval(interval);
  }, [trackingData]);


  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchTracking(orderId);
  };

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen min-h-dvh bg-canvas">
        <div className="page-wrap section-space !pt-12">
          <div className="section-header max-w-xl">
            <p className="eyebrow">Track order</p>
            <h1 className="section-title mt-3 text-ink-950">Where is my order?</h1>
            <p className="body-copy mt-4">
              Enter your order ID (e.g. NX-...) or AWB Number for live updates.
            </p>
          </div>

          <form
            onSubmit={handleTrack}
            className="mt-8 max-w-xl rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-sm"
          >
            <label className="mb-3 block text-sm font-bold text-ink-950">
              Order ID or Tracking Number
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. NX-2026-12345 or AWB..."
                className="input-premium flex-1"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-8 text-sm font-bold text-white hover:bg-accent-deep transition-all duration-300 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                {loading ? "Tracking..." : "Track"}
              </button>
            </div>
          </form>

          {searched && error && (
            <div className="mt-6 max-w-xl rounded-2xl bg-red-50 p-6 text-center text-red-600 border border-red-100">
              <XCircle className="mx-auto mb-2" size={32} />
              <p className="font-bold">{error}</p>
              <p className="text-sm mt-1">Please check your ID and try again.</p>
            </div>
          )}

          {trackingData && (
            <div className="mt-10 max-w-3xl space-y-8 rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-line pb-6 gap-4">
                <div className="flex items-start gap-4">
                  <Package className="mt-1 shrink-0 text-accent" size={28} />
                  <div>
                    <p className="text-sm font-bold text-ink-500">Order</p>
                    <h2 className="text-xl font-black text-ink-950">{trackingData.orderNumber}</h2>
                    <p className="mt-1 text-sm text-ink-500">
                      Placed on {new Date(trackingData.createdAt).toLocaleDateString("en-IN", { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold shadow-sm ${
                    trackingData.status === 'DELIVERED' ? 'bg-green-100 text-green-700 border border-green-200' :
                    trackingData.status === 'CANCELLED' ? 'bg-red-100 text-red-700 border border-red-200' :
                    'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                    {trackingData.status === 'DELIVERED' ? <CheckCircle2 size={18} /> :
                     trackingData.status === 'CANCELLED' ? <XCircle size={18} /> :
                     <Truck size={18} className={trackingData.status === 'IN_TRANSIT' ? 'animate-pulse' : ''} />}
                    {trackingData.status}
                  </span>
                </div>
              </div>

              {trackingData.awbCode && (
                <div className="grid gap-4 sm:grid-cols-3 bg-canvas p-4 rounded-xl border border-line-soft">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Courier Partner</p>
                    <p className="mt-1 font-bold text-ink-950 flex items-center gap-1.5">
                      <Truck size={14} className="text-accent" />
                      {trackingData.courierName || "Assigned"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">AWB Number</p>
                    <p className="mt-1 font-mono font-bold text-ink-950">{trackingData.awbCode}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Estimated Delivery</p>
                    <p className="mt-1 font-bold text-ink-950 flex items-center gap-1.5">
                      <Clock size={14} className="text-accent" />
                      {trackingData.estimatedDelivery 
                        ? new Date(trackingData.estimatedDelivery).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                        : "Calculating..."}
                    </p>
                  </div>
                </div>
              )}

              {trackingData.trackingActivities && trackingData.trackingActivities.length > 0 ? (
                <div className="pt-4">
                  <h3 className="text-lg font-black text-ink-950 mb-6">Live Tracking Updates</h3>
                  <div className="relative pl-6">
                    <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-line-soft rounded-full"></div>
                    <div className="space-y-6 relative">
                      {trackingData.trackingActivities.map((activity: any, index: number) => (
                        <div key={index} className="relative group">
                          <div className={`absolute -left-[32px] top-1 h-[18px] w-[18px] rounded-full border-[3px] transition-colors ${
                            index === 0 
                              ? "border-accent bg-white shadow-[0_0_0_4px_rgba(6,182,212,0.1)] z-10" 
                              : "border-line bg-white group-hover:border-ink-300 z-10"
                          }`}></div>
                          <div className={`pl-2 ${index === 0 ? "opacity-100" : "opacity-70"}`}>
                            <p className={`font-bold ${index === 0 ? "text-ink-950 text-base" : "text-ink-800 text-sm"}`}>
                              {activity.activity}
                            </p>
                            <p className="text-xs text-ink-500 mt-1 flex items-center gap-1.5">
                              {activity.date} 
                              {activity.location && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-line"></span>
                                  <MapPin size={12} className="text-ink-400" />
                                  {activity.location}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 rounded-xl bg-canvas border border-line-soft">
                  <Package className="mx-auto text-ink-300 mb-4" size={48} />
                  <p className="text-lg font-bold text-ink-950">We're getting your shipment ready</p>
                  <p className="text-sm text-ink-500 mt-2 max-w-sm mx-auto">
                    Tracking updates will appear here automatically once the courier picks up your package.
                  </p>
                </div>
              )}

              <div className="border-t border-line pt-6 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <Link
                  href="/support"
                  className="text-sm font-bold text-ink-600 hover:text-accent transition-colors"
                >
                  Need help with your order?
                </Link>
                <Link
                  href="/"
                  className="btn btn-secondary text-sm h-10 px-6"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
