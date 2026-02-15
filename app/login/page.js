"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");

    if (!email.trim() || !password) {
      setMsg("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (!res?.ok) {
        setMsg(res?.error || "Invalid credentials.");
        return;
      }

      // Fetch updated session (with role)
      const session = await getSession();
      const role = session?.user?.role;

      if (role === "ADMIN") {
        router.replace("/admin");
        return;
      }

      if (role === "CASEWORKER") {
        router.replace("/caseworker/children");
        return;
      }

      // Default: FAMILY
      router.replace("/dashboard/");

    } catch (err) {
      console.error("Login error:", err);
      setMsg("Something went wrong. Check console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto flex max-w-md flex-col px-6 py-12">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs text-gray-700">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Secure sign-in • Role-based access
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Login to continue to your SafeNest dashboard.
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">

          {/* Demo accounts */}
          <div className="mb-4 rounded-2xl border bg-gray-50 p-4">
            <div className="text-xs font-semibold text-gray-700">
              Demo accounts
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2">
              <button
                type="button"
                className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                onClick={() => {
                  setEmail("admin@safenest.local");
                  setPassword("Password123!");
                }}
              >
                Admin
              </button>

              <button
                type="button"
                className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                onClick={() => {
                  setEmail("caseworker@safenest.local");
                  setPassword("Password123!");
                }}
              >
                Caseworker
              </button>

              <button
                type="button"
                className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                onClick={() => {
                  setEmail("hedi@gmail.com");
                  setPassword("azertyazerty");
                }}
              >
                Family
              </button>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">

            {/* Email */}
            <label className="block">
              <div className="text-sm font-semibold text-gray-900">Email</div>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="mt-1 w-full rounded-xl border bg-white p-3 text-sm text-gray-800 outline-none focus:border-gray-900"
              />
            </label>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-900">
                  Password
                </label>

                <button
                  type="button"
                  className="text-xs font-semibold text-gray-700 underline"
                  onClick={() => setShowPass((s) => !s)}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>

              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="mt-1 w-full rounded-xl border bg-white p-3 text-sm text-gray-800 outline-none focus:border-gray-900"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* Error */}
          {msg && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {msg}
            </div>
          )}

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between text-sm">
            <p className="text-gray-600">
              New here?{" "}
              <Link
                className="font-semibold text-gray-900 underline"
                href="/register"
              >
                Create account
              </Link>
            </p>

            <Link
              className="text-xs font-semibold text-gray-700 underline"
              href="/"
            >
              Back home
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          SafeNest • Secure, role-based access for families, caseworkers, and admins.
        </p>
      </div>
    </main>
  );
}
