import { redirect } from "next/navigation";

// Keep legacy /charger links working after removing the old launch experience.
export default function ChargerLaunchPage() {
  redirect("/home");
}
