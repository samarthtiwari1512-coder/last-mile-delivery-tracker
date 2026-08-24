"use client";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm text-slate-600 hover:text-brand px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
    >
      Log out
    </button>
  );
}
