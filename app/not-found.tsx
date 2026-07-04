import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      <h1 className="text-8xl font-extrabold text-gray-900">404</h1>

      <h2 className="mt-4 text-3xl font-bold text-gray-900">
        Page Not Found
      </h2>

      <p className="mt-3 max-w-md text-gray-600">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div className="mt-8 flex gap-4">
        <Link
          href="/shop"
          className="rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-600"
        >
          🛍 Go to Shop
        </Link>

        <Link
          href="/"
          className="rounded-xl border border-gray-300 px-6 py-3 font-semibold transition hover:bg-gray-100"
        >
          🏠 Home
        </Link>
      </div>
    </main>
  );
}