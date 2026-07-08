import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";
import SignInForm from "./signinform";
import AnnouncementBar from "../../components/layout/announcementbar";
import Navbar from "../../components/layout/navbar";
import Footer from "../../components/layout/footer";

type SignInPageProps = {
  searchParams: Promise<{
    next?: string;
    mode?: string;
  }>;
};

function getSafeNext(value: string | undefined) {
  if (!value) return "/account";
  if (!value.startsWith("/")) return "/account";
  if (value.startsWith("//")) return "/account";
  return value;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const next = getSafeNext(params.next);
  const initialMode = params.mode === "register" ? "register" : "signin";

  const existing = await getSessionUser();
  if (existing) {
    redirect(next);
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen min-h-dvh bg-canvas">
        <div className="mx-auto flex w-full max-w-md flex-col px-5 py-12 sm:px-8 sm:py-16">
          <div className="card-premium p-8 sm:p-10">
            <p className="eyebrow">Nxteraa account</p>
            <h1 className="mt-3 text-3xl font-black text-ink-950">
              {initialMode === "register" ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-3 text-sm font-medium text-ink-500">
              {initialMode === "register"
                ? "Save addresses, track orders and check out faster."
                : "Sign in to view your orders, wishlist and saved addresses."}
            </p>

            <div className="mt-8">
              <SignInForm next={next} initialMode={initialMode} />
            </div>
          </div>

          <p className="mt-6 text-center text-xs font-medium text-ink-400">
            By continuing you agree to Nxteraa&apos;s{" "}
            <a href="/support" className="text-ink-700 underline-offset-2 hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="/support" className="text-ink-700 underline-offset-2 hover:underline">
              Privacy
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
