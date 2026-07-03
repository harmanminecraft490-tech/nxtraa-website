"use client";

import { CartProvider } from "./components/lib/cartcontext";
import { AuthProvider } from "./authcontext";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
