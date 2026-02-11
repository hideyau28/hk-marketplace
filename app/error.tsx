"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-[#FF9500] mb-4">⚠️</h1>
          <h2 className="text-2xl font-semibold text-white mb-2">出咗啲問題</h2>
          <p className="text-zinc-400">
            唔好意思，系統出現咗錯誤
          </p>
        </div>

        <button
          onClick={reset}
          className="inline-block rounded-2xl bg-[#FF9500] px-8 py-4 text-white font-bold hover:bg-[#FF9500]/90 transition-all active:scale-[0.98]"
        >
          重試
        </button>
      </div>
    </div>
  );
}
