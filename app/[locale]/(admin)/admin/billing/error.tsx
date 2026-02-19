"use client";

export default function BillingError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="px-4 pb-16 pt-4 pl-16 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="mb-4 text-5xl font-extrabold text-zinc-300">!</div>
        <h2 className="text-xl font-semibold text-zinc-800 mb-2">出咗啲問題</h2>
        <p className="text-zinc-500 mb-6">載入帳單時發生錯誤，請重試。</p>
        <button
          onClick={() => reset()}
          className="inline-block rounded-2xl bg-zinc-900 px-6 py-3 text-white font-semibold hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          重試
        </button>
      </div>
    </div>
  );
}
