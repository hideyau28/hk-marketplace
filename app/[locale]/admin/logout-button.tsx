"use client";

import { useRouter, useParams } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push(`/${locale}/admin/login`);
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg bg-zinc-100 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-200 transition-colors"
    >
      Logout
    </button>
  );
}
