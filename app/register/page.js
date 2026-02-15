"use client";
import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");

    if (!email.trim()) return setMsg("Email is required.");
    if (!isEmail(email.trim())) return setMsg("Please enter a valid email.");
    if (password.length < 8) return setMsg("Password must be at least 8 characters.");

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.error || `Registration failed (${res.status})`);
        return;
      }

      // Auto-login
      const login = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: true,
        callbackUrl: "/dashboard",
      });

      if (login?.error) setMsg("Registered but login failed. Please login manually.");
    } catch {
      setMsg("Network error while registering.");
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
            Families start unverified • Verification required
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            You’ll complete your family profile and submit verification documents before seeing matches.
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-4">
           <label className="block">
  <div className="text-sm font-semibold text-gray-900">Email</div>
  <input
    type="email"
    placeholder="you@example.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    autoComplete="email"
    className="mt-1 w-full rounded-xl border bg-white p-3 text-sm text-gray-900 outline-none focus:border-gray-900"
  />
</label>


            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-900">Password</label>
                <button
                  type="button"
                  className="text-xs font-semibold text-gray-700 underline hover:opacity-80"
                  onClick={() => setShowPass((s) => !s)}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>

              <input
                className="mt-1 w-full rounded-xl text-gray-900 border bg-white p-3 text-sm outline-none focus:border-gray-900"
                placeholder="Min 8 characters"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />

              {/* Strength */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700">Password strength</span>
                  <span className="text-gray-600">{strength.label}</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${strength.percent}%` }}
                  />
                </div>
                <ul className="mt-3 space-y-1 text-xs text-gray-600">
                  <li>• Use 8+ characters</li>
                  <li>• Mix letters and numbers</li>
                  <li>• Add a symbol for extra strength</li>
                </ul>
              </div>
            </div>

            <button
              className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          {msg && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {msg}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between text-sm">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link className="font-semibold text-gray-900 underline" href="/login">
                Login
              </Link>
            </p>

            <Link className="text-xs font-semibold text-gray-700 underline" href="/">
              Back home
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          By registering, you agree to provide accurate information for verification.
        </p>
      </div>
    </main>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, autoComplete }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-gray-900">{label}</div>
      <input
        className="mt-1 w-full rounded-xl border bg-white p-3 text-sm outline-none focus:border-gray-900"
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const percent = Math.min(100, Math.round((score / 5) * 100));
  const label =
    percent >= 80 ? "Strong" :
    percent >= 50 ? "Medium" :
    percent >= 20 ? "Weak" : "Very weak";

  return { percent, label };
}
