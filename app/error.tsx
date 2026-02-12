"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-7xl font-bold text-orange-500 mb-4">500</h1>
          <h2 className="text-2xl font-semibold text-white mb-2">
            出咗啲問題
          </h2>
          <p className="text-zinc-400">
            伺服器出現錯誤，請稍後再試。
          </p>
        </div>

        <button
          onClick={() => reset()}
          className="inline-block rounded-2xl bg-orange-500 px-8 py-4 text-white font-semibold hover:bg-orange-600 transition-colors cursor-pointer"
        >
          重試
        </button>
      </div>
    </div>
  );
}
