"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

import AnnouncementBar from "@/app/components/layout/announcementbar";
import Navbar from "@/app/components/layout/navbar";
import Footer from "@/app/components/layout/footer";
import { useCart } from "@/app/components/lib/cartcontext";

/**
 * Cashfree Return Status Page
 *
 * Cashfree redirects the browser here (GET) after the payment reaches a
 * terminal state. The query params are NEVER trusted — this page asks the
 * server (/api/cashfree/verify) to re-check the order state with Cashfree and
 * then routes to /order-success or /payment/failed.
 */
export default function CashfreeStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen min-h-dvh bg-canvas flex items-center justify-center">
          <div className="animate-spin h-8 w-8 text-accent border-4 border-t-transparent border-accent/20 rounded-full" />
        </div>
      }
    >
      <CashfreeStatusContent />
    </Suspense>
  );
}

function CashfreeStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const calledRef = useRef(false);
  const [status, setStatus] = useState<"loading" | "success" | "failed" | "pending">("loading");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    // Prevent double-fire in Strict Mode.
    if (calledRef.current) return;
    calledRef.current = true;

    async function verifyPayment() {
      const orderId = searchParams?.get("order_id") || "";

      if (!orderId) {
        setStatus("failed");
        setMessage("No order reference found. Please try again.");
        return;
      }

      try {
        const response = await fetch("/api/cashfree/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });

        const data = (await response.json()) as {
          verified?: boolean;
          paymentStatus?: string;
          error?: string;
        };

        if (!response.ok || !data.verified) {
          setStatus("failed");
          setMessage(data.error || "Payment could not be verified.");
          return;
        }

        if (data.paymentStatus === "PAID") {
          clearCart();
          setStatus("success");
          setMessage("Your payment was successful. Redirecting to your order summary...");
          setTimeout(() => {
            router.replace(`/order-success?id=${encodeURIComponent(orderId)}`);
          }, 1200);
        } else if (data.paymentStatus === "PENDING") {
          setStatus("pending");
          setMessage("Your payment is still being processed. This can take a moment.");
        } else {
          setStatus("failed");
          setMessage("Payment was not completed. No amount has been deducted.");
        }
      } catch {
        setStatus("failed");
        setMessage("Could not reach the server. Please check your connection.");
      }
    }

    verifyPayment();
  }, [router, searchParams, clearCart]);

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
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-200">
                <CheckCircle2 size={48} strokeWidth={2.5} />
              </div>
              <h1 className="mt-8 text-3xl font-black text-ink-950 sm:text-4xl">
                Payment Confirmed!
              </h1>
              <p className="body-copy mt-4 max-w-md">{message}</p>
            </>
          )}

          {status === "pending" && (
            <>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-50 text-amber-500 shadow-lg shadow-amber-100">
                <Clock size={48} strokeWidth={2.5} />
              </div>
              <h1 className="mt-8 text-3xl font-black text-ink-950 sm:text-4xl">
                Payment Pending
              </h1>
              <p className="body-copy mt-4 max-w-md">{message}</p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    calledRef.current = false;
                    setStatus("loading");
                    verifyAgain();
                  }}
                  className="rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-white hover:bg-accent-deep transition-all duration-300 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  Check again
                </button>
                <button
                  type="button"
                  onClick={() => router.replace("/checkout")}
                  className="rounded-full bg-white border-2 border-accent px-8 py-3.5 text-sm font-bold text-accent hover:bg-accent hover:text-white transition-all duration-300 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  Return to checkout
                </button>
              </div>
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

  // Extracted so the pending state's "Check again" button can re-run it.
  function verifyAgain() {
    const orderId = searchParams?.get("order_id") || "";
    if (!orderId) return;

    fetch("/api/cashfree/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    })
      .then(async (response) => {
        const data = (await response.json()) as {
          verified?: boolean;
          paymentStatus?: string;
          error?: string;
        };
        if (!response.ok || !data.verified) {
          setStatus("failed");
          setMessage(data.error || "Payment could not be verified.");
          return;
        }
        if (data.paymentStatus === "PAID") {
          clearCart();
          router.replace(`/order-success?id=${encodeURIComponent(orderId)}`);
        } else if (data.paymentStatus === "PENDING") {
          setMessage("Still processing. Please check again in a moment.");
        } else {
          setStatus("failed");
          setMessage("Payment was not completed. No amount has been deducted.");
        }
      })
      .catch(() => {
        setStatus("failed");
        setMessage("Could not reach the server. Please check your connection.");
      });
  }
}
