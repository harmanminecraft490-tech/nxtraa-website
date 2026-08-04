import BannerClient from "./banner-client";
import { getSessionUser, isAdminEmail } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Manage Banners - Nxteraa Admin",
};

export default async function BannersAdminPage() {
  const user = await getSessionUser();
  if (!user || !isAdminEmail(user.email)) {
    redirect("/admin");
  }

  return <BannerClient />;
}
