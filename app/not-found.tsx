import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-zinc-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-zinc-800 mb-2">Page Not Found</h2>
          <p className="text-zinc-600">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <Link
          href="/en"
          className="inline-block rounded-2xl bg-olive-600 px-8 py-4 text-white font-semibold hover:bg-olive-700 transition-colors"
        >
          Back to Home
        </Link>

        <div className="mt-8 text-sm text-zinc-500">
          <p>Need help? Contact our support team.</p>
        </div>
      </div>
    </div>
  );
}
