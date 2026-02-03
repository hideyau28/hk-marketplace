"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { useToast } from "@/components/Toast";

type AdminNote = {
  timestamp: string;
  note: string;
  author: string;
};

type AdminNotesProps = {
  orderId: string;
  notes: AdminNote[];
  locale: Locale;
};

export default function AdminNotes({ orderId, notes, locale }: AdminNotesProps) {
  const router = useRouter();
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: newNote.trim() }),
      });

      if (res.ok) {
        showToast(locale === "zh-HK" ? "備註已新增" : "Note added!");
        setNewNote("");
        router.refresh();
      } else {
        const data = await res.json();
        showToast(data.error?.message || (locale === "zh-HK" ? "新增失敗" : "Failed to add note"));
      }
    } catch (e) {
      showToast(locale === "zh-HK" ? "網絡錯誤" : "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
      <h3 className="text-lg font-semibold text-zinc-900 mb-4">
        {locale === "zh-HK" ? "管理備註" : "Admin Notes"}
      </h3>

      {/* Add new note form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder={locale === "zh-HK" ? "新增備註..." : "Add a note..."}
          rows={2}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
        />
        <button
          type="submit"
          disabled={isSubmitting || !newNote.trim()}
          className="mt-2 rounded-xl bg-olive-600 px-4 py-2 text-sm font-semibold text-white hover:bg-olive-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting
            ? (locale === "zh-HK" ? "新增中..." : "Adding...")
            : (locale === "zh-HK" ? "新增備註" : "Add Note")}
        </button>
      </form>

      {/* Notes list */}
      {notes.length > 0 ? (
        <div className="space-y-3">
          {notes.slice().reverse().map((note, index) => (
            <div key={index} className="p-3 bg-zinc-50 rounded-lg">
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                <span>{note.author}</span>
                <span>{new Date(note.timestamp).toLocaleString()}</span>
              </div>
              <div className="text-sm text-zinc-900">{note.note}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-zinc-400 text-sm py-4">
          {locale === "zh-HK" ? "沒有備註" : "No notes yet"}
        </div>
      )}
    </div>
  );
}
