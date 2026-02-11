import Link from "next/link";

export default function StoreNotFound() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-[#FF9500] mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-white mb-2">呢間店唔存在</h2>
          <p className="text-zinc-400">
            你想搵嘅商店唔存在或已經關閉咗
          </p>
        </div>

        <Link
          href="/en/start"
          className="inline-block rounded-2xl bg-[#FF9500] px-8 py-4 text-white font-bold hover:bg-[#FF9500]/90 transition-all active:scale-[0.98]"
        >
          免費開店
        </Link>

        <div className="mt-6">
          <Link
            href="/en"
            className="inline-block text-zinc-400 hover:text-white transition-colors"
          >
            返回首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
