"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

import AnnouncementBar from "@/app/components/layout/announcementbar";
import Navbar from "@/app/components/layout/navbar";
import Footer from "@/app/components/layout/footer";

/**
 * PhonePe Payment Callback Page
 *
 * PhonePe redirects here after the user completes (or cancels) payment
 * on the PhonePe page. The URL contains a `code` parameter that encodes
 * the transaction reference.
 *
 * This page:
 * 1. Shows a loading spinner
 * 2. Calls /api/phonepe/verify to confirm the payment status
 * 3. Redirects to /order-success or /payment/failed
 */
export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen min-h-dvh bg-canvas flex items-center justify-center">
          <div className="animate-spin h-8 w-8 text-accent border-4 border-t-transparent border-accent/20 rounded-full" />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const calledRef = useRef(false);
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    // Prevent double-fire in Strict Mode.
    if (calledRef.current) return;
    calledRef.current = true;

    async function verifyPayment() {
      const storedData = sessionStorage.getItem("phonepe_checkout");
      if (!storedData) {
        setStatus("failed");
        setMessage("No payment session found. Please try again.");
        return;
      }

      const parsed = JSON.parse(storedData);
      const { merchantTransactionId, items, subtotal, deliveryFee, total, payment, address } =
        parsed;

      if (!merchantTransactionId) {
        setStatus("failed");
        setMessage("Invalid payment session. Please try again.");
        return;
      }

      // Show a more specific message based on URL params.
      const code = searchParams?.get("code");
      if (code) {
        setMessage("Payment received. Confirming your transaction...");
      }

      try {
        const response = await fetch("/api/phonepe/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            subtotal,
            deliveryFee,
            total,
            payment,
            address,
            merchantTransactionId,
          }),
        });

        const data = (await response.json()) as {
          error?: string;
          order?: { id: string };
        };

        const orderId = data.order?.id;
        if ((response.ok || response.status === 409) && orderId) {
          setStatus("success");
          sessionStorage.removeItem("phonepe_checkout");
          setTimeout(() => {
            router.replace(`/order-success?id=${orderId}`);
          }, 1200);
        } else {
          setStatus("failed");
          setMessage(data.error || "Payment could not be verified.");
          sessionStorage.removeItem("phonepe_checkout");
        }
      } catch {
        setStatus("failed");
        setMessage("Could not reach the server. Please check your connection.");
        sessionStorage.removeItem("phonepe_checkout");
      }
    }

    verifyPayment();
  }, [router, searchParams]);

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen min-h-dvh bg-white">
        <div className="page-wrap flex flex-col items-center py-20 text-center sm:py-24">
          {status === "loading" && (
            <>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent-soft text-accent shadow-lg shadow-accent/20">
                <Loader2 size={48} strokeWidth={2} className="animate-spin" />
              </div>
              <h1 className="mt-8 text-3xl font-black text-ink-950 sm:text-4xl">
                Verifying Payment
              </h1>
              <p className="body-copy mt-4 max-w-md">{message}</p>
              <div className="mt-10 h-2 w-48 overflow-hidden rounded-full bg-accent-soft">
                <div className="h-full w-full animate-pulse rounded-full bg-accent" />
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-200">
                  <CheckCircle2 size={48} strokeWidth={2.5} />
                </div>
              </div>
              <h1 className="mt-8 text-3xl font-black text-ink-950 sm:text-4xl">
                Payment Confirmed!
              </h1>
              <p className="body-copy mt-4 max-w-md">
                Your payment was successful. Redirecting to your order summary...
              </p>
            </>
          )}

          {status === "failed" && (
            <>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-lg shadow-red-100">
                <XCircle size={48} strokeWidth={2.5} />
              </div>
              <h1 className="mt-8 text-3xl font-black text-ink-950 sm:text-4xl">
                Payment Failed
              </h1>
              <p className="body-copy mt-4 max-w-md">{message}</p>
              <p className="mt-2 text-sm text-ink-500">
                Don&apos;t worry — no amount has been deducted.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => router.replace("/checkout")}
                  className="rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-white hover:bg-accent-deep transition-all duration-300 hover:shadow-[0_8px_24px_-8px_rgba(6,182,212,0.5)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 inline-flex items-center gap-2"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={() => router.replace("/")}
                  className="rounded-full bg-white border-2 border-accent px-8 py-3.5 text-sm font-bold text-accent hover:bg-accent hover:text-white transition-all duration-300 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 inline-flex items-center gap-2"
                >
                  Return Home
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
