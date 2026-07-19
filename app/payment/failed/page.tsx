"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { XCircle, RefreshCw, Home } from "lucide-react";

import AnnouncementBar from "@/app/components/layout/announcementbar";
import Navbar from "@/app/components/layout/navbar";
import Footer from "@/app/components/layout/footer";

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen min-h-dvh bg-canvas flex items-center justify-center">
          <div className="animate-spin h-8 w-8 text-accent border-4 border-t-transparent border-accent/20 rounded-full" />
        </div>
      }
    >
      <PaymentFailedContent />
    </Suspense>
  );
}

function PaymentFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams?.get("reason") || "Payment was not completed.";
  const orderId = searchParams?.get("orderId") || "";

  const handleRetryPayment = () => {
    router.push("/checkout");
  };

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen min-h-dvh bg-white">
        <div className="page-wrap flex flex-col items-center py-20 text-center sm:py-24">
          {/* Error Icon */}
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-lg shadow-red-100">
            <XCircle size={48} strokeWidth={2.5} />
          </div>

          <h1 className="mt-8 text-3xl font-black text-ink-950 sm:text-4xl">
            Payment Failed
          </h1>
          <p className="body-copy mt-4 max-w-md">
            We couldn&apos;t process your payment. Don&apos;t worry — no amount has been
            deducted from your account.
          </p>

          {/* Error Details */}
          <div className="mt-8 w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-left">
            <h3 className="text-sm font-bold text-red-800 mb-2">What happened?</h3>
            <p className="text-sm text-red-700">{reason}</p>

            {orderId && (
              <p className="mt-3 text-xs text-red-600">
                Order reference: <span className="font-mono font-bold">{orderId}</span>
              </p>
            )}
          </div>

          {/* Common Reasons */}
          <div className="mt-8 w-full max-w-md rounded-2xl border border-line bg-canvas p-6 text-left">
            <h3 className="text-sm font-bold text-ink-900 mb-3">Common reasons for payment failure:</h3>
            <ul className="space-y-2 text-sm text-ink-600">
              <li className="flex items-start gap-2">
                <span className="text-ink-400 mt-0.5">•</span>
                Insufficient balance in your account
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ink-400 mt-0.5">•</span>
                Payment was cancelled or closed
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ink-400 mt-0.5">•</span>
                Network connection was interrupted
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ink-400 mt-0.5">•</span>
                Card or UPI limits exceeded
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ink-400 mt-0.5">•</span>
                Session timed out during payment
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={handleRetryPayment}
              className="rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-white hover:bg-accent-deep transition-all duration-300 hover:shadow-[0_8px_24px_-8px_rgba(6,182,212,0.5)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 inline-flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Retry Payment
            </button>
            <Link
              href="/"
              className="rounded-full bg-white border-2 border-accent px-8 py-3.5 text-sm font-bold text-accent hover:bg-accent hover:text-white transition-all duration-300 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 inline-flex items-center gap-2"
            >
              <Home size={16} />
              Return Home
            </Link>
          </div>

          {/* Support Note */}
          <p className="mt-8 text-xs text-ink-400">
            If money was deducted but the order wasn&apos;t placed, it will be
            automatically refunded within 5-7 business days.{" "}
            <Link href="/support" className="text-accent hover:underline">
              Contact support
            </Link>{" "}
            if you need help.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
