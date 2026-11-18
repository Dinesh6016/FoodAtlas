"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Invalid credentials");
      }

      // Check role redirection
      if (data.data.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (data.data.role === "OWNER") {
        router.push("/owner/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-stone-50">
      <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200 p-8 shadow-xl shadow-stone-200/50 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Compass className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-2xl font-black tracking-tight text-stone-900">
              Food<span className="text-orange-600">Atlas</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-stone-500">Sign in to your account to save favorites and leave reviews.</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-600 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? "Signing in..." : "Sign In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login Pills */}
        <div className="pt-4 border-t border-stone-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 text-center mb-2.5">
            Quick Demo Logins
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <button
              type="button"
              onClick={() => handleDemoLogin("admin@foodatlas.com", "admin123")}
              className="px-2 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("owner@foodatlas.com", "owner123")}
              className="px-2 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold"
            >
              Owner
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("user@foodatlas.com", "password123")}
              className="px-2 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold"
            >
              User
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-stone-500">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-bold text-orange-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
