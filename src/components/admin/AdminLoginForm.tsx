"use client";

import { useState, type FormEvent } from "react";
import { AuthField, AuthSubmit } from "@/components/AuthFields"; 

export default function AdminLoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const phone = form.get("admin-phone");
    const password = form.get("admin-password");

    if (!phone || !password) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send phone instead of email
        body: JSON.stringify({ phone, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? "Failed to connect to the authentication server.");
        return;
      }

      // Redirect directly to the admin panel
      window.location.href = "/admin";
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      
      <AuthField 
        id="admin-phone" 
        label="Phone Number" 
        type="tel" 
        autoComplete="tel" 
        digitsOnly 
      />
      
      <AuthField 
        id="admin-password" 
        label="Password" 
        type="password" 
        autoComplete="current-password" 
      />
      
      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
          <p className="text-sm text-red-800 font-medium">
            {error}
          </p>
        </div>
      )}

      <div className="mt-4">
        <AuthSubmit disabled={loading}>
          {loading ? "Authenticating..." : "Sign in to Dashboard"}
        </AuthSubmit>
      </div>
    </form>
  );
}