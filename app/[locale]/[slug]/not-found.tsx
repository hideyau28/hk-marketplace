import Link from "next/link";

export default function StoreNotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-7xl font-bold text-orange-500 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-white mb-2">
            呢間店唔存在
          </h2>
          <p className="text-zinc-400">
            搵唔到呢間店鋪，可能已經關閉或者網址有誤。
          </p>
        </div>

        <Link
          href="/en/start"
          className="inline-block rounded-2xl bg-orange-500 px-8 py-4 text-white font-semibold hover:bg-orange-600 transition-colors"
        >
          免費開店
        </Link>
      </div>
    </div>
  );
}
