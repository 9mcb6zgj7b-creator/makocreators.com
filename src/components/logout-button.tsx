"use client";

import { useState } from "react";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function signOut() {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.assign("/login");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button className="logout-button" type="button" onClick={signOut} disabled={isLoading}>
      {isLoading ? "Signing out..." : "Sign out"}
    </button>
  );
}
