import { auth } from "@/auth";
import AdminClient from "./admin-client";
import Link from "next/link";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="mx-auto max-w-md px-5 py-12 text-center">
          <div className="card-premium p-8">
            <h1 className="text-3xl font-black text-ink-950">Access Denied</h1>
            <p className="mt-4 text-ink-500">
              You need to be signed in as the admin to access this page.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/account" className="btn btn-primary">
                Sign In
              </Link>
              <p className="text-xs text-ink-400">
                Admin email: {process.env.ADMIN_EMAIL || "not set"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <AdminClient />;
}
