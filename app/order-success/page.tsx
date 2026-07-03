import { Suspense } from "react";
import OrderSuccessClient from "./ordersuccessclient";

export default function OrderSuccessPage() {
  return (
    <Suspense>
      <OrderSuccessClient />
    </Suspense>
  );
}
