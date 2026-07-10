import { redirect } from "next/navigation";

// The Aerobuds launch page now lives at the site root. Keep the old /charger
// path working by redirecting it home so no shared/old link 404s.
export default function ChargerLaunchPage() {
  redirect("/");
}
