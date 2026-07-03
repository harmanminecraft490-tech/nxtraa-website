import { Suspense } from "react";
import TrackOrderClient from "./trackorderclient";

export default function TrackOrderPage() {
  return (
    <Suspense>
      <TrackOrderClient />
    </Suspense>
  );
}
