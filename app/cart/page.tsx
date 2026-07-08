import { Suspense } from "react";
import CartPageClient from "./cartclient";

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen min-h-dvh bg-canvas flex items-center justify-center">
        <div className="animate-spin h-8 w-8 text-accent border-4 border-t-transparent border-accent/20 rounded-full" />
      </div>
    }>
      <CartPageClient />
    </Suspense>
  );
}
