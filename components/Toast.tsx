"use client";

import { useEffect, useState } from "react";

type ToastProps = {
  message: string;
  show: boolean;
  onClose: () => void;
  duration?: number;
};

export default function Toast({ message, show, onClose, duration = 2000 }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, onClose, duration]);

  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 transform animate-fade-in">
      <div className="rounded-lg bg-zinc-900 px-4 py-3 text-white shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-green-400">✓</span>
          <span className="text-sm font-medium">{message}</span>
        </div>
      </div>
    </div>
  );
}
