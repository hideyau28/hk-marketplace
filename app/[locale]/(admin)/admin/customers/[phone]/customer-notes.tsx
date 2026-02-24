"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

type CustomerNote = {
  id: string;
  note: string;
  createdAt: string;
};

type Props = {
  phone: string;
  locale: Locale;
};

export default function CustomerNotes({ phone, locale }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/customers/${encodeURIComponent(phone)}/notes`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setNotes(data.data.notes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/admin/customers/${encodeURIComponent(phone)}/notes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: newNote.trim() }),
        },
      );

      const data = await res.json();
      if (data.ok) {
        setNotes((prev) => [data.data.note, ...prev]);
        setNewNote("");
      }
    } catch {
      // 網絡錯誤
    } finally {
      setIsSubmitting(false);
    }
  };

  const isZh = locale === "zh-HK";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-zinc-900 mb-4">
        {isZh ? "客戶備註" : "Customer Notes"}
      </h3>

      {/* 新增備註 */}
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder={isZh ? "新增備註..." : "Add a note..."}
          rows={2}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
        />
        <button
          type="submit"
          disabled={isSubmitting || !newNote.trim()}
          className="mt-2 rounded-xl bg-olive-600 px-4 py-2 text-sm font-semibold text-white hover:bg-olive-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting
            ? isZh
              ? "儲存中..."
              : "Saving..."
            : isZh
              ? "儲存備註"
              : "Save Note"}
        </button>
      </form>

      {/* 備註列表 */}
      {loading ? (
        <div className="text-center text-zinc-400 text-sm py-4">
          {isZh ? "載入中..." : "Loading..."}
        </div>
      ) : notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((n) => (
            <div key={n.id} className="p-3 bg-zinc-50 rounded-lg">
              <div className="text-xs text-zinc-500 mb-1">
                {new Date(n.createdAt).toLocaleString(
                  isZh ? "zh-HK" : "en-HK",
                )}
              </div>
              <div className="text-sm text-zinc-900 whitespace-pre-wrap">
                {n.note}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-zinc-400 text-sm py-4">
          {isZh ? "暫無備註" : "No notes yet"}
        </div>
      )}
    </div>
  );
}
