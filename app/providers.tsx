"use client";

import { CartProvider } from "./components/lib/cartcontext";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return <CartProvider>{children}</CartProvider>;
}
