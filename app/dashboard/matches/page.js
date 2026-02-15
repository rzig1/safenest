"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function MatchesPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);

  const reqIdRef = useRef(0);

  async function load(signal) {
    const myReqId = ++reqIdRef.current;
    setErr("");

    try {
      const res = await fetch("/api/matches/suggestions", { signal });
      const data = await res.json().catch(() => ({}));

      if (myReqId !== reqIdRef.current) return;

      if (!res.ok) {
        setErr(data.error || `Cannot load matches (${res.status})`);
        setItems([]);
        return;
      }

      setItems(data.suggestions || []);
    } catch (e) {
      if (e?.name === "AbortError") return;
      setErr("Network error while loading matches.");
      setItems([]);
    } finally {
      if (myReqId === reqIdRef.current) setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, []);

  const isLocked =
    err.toLowerCase().includes("verify") ||
    err.toLowerCase().includes("not verified") ||
    err.toLowerCase().includes("forbidden");

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
                Match Suggestions
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Private, non-identifying summaries. Only verified families can access match suggestions.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Pill>Child identity protected</Pill>
                <Pill>Compatibility score</Pill>
                <Pill>Reasons explained</Pill>
              </div>
            </div>

            <button
              className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-50"
              onClick={() => {
                setLoading(true);
                const controller = new AbortController();
                load(controller.signal);
              }}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {/* Error banner */}
          {!loading && err && (
            <div className={`mt-5 rounded-2xl border p-4 text-sm ${isLocked ? "border-yellow-200 bg-yellow-50 text-yellow-900" : "border-red-200 bg-red-50 text-red-900"}`}>
              <div className="font-semibold">
                {isLocked ? "Matches are locked" : "Could not load matches"}
              </div>
              <div className="mt-1 text-sm opacity-90">{err}</div>

              {isLocked && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
                    href="/dashboard/verification"
                  >
                    Go to verification
                  </Link>
                  <Link
                    className="rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-white"
                    href="/dashboard/profile"
                  >
                    Update profile
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <>
            {!err && items.length === 0 && (
              <div className="mt-6 rounded-3xl border bg-white p-6 text-sm text-gray-700 shadow-sm">
                <div className="font-semibold text-gray-900">No matches found (yet)</div>
                <p className="mt-2 text-gray-600">
                  Try adjusting your preferences or adding more details in your family profile.
                </p>
                <div className="mt-4 flex gap-2">
                  <Link
                    className="rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                    href="/dashboard/profile"
                  >
                    Edit profile
                  </Link>
                  <Link
                    className="rounded-xl border px-4 py-2 text-xs font-semibold hover:bg-gray-50"
                    href="/dashboard/verification"
                  >
                    Check verification
                  </Link>
                </div>
              </div>
            )}

            {!err && items.length > 0 && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {items.map((s) => (
                  <MatchCard key={s.childId} s={s} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function MatchCard({ s }) {
  const score = Number(s.score || 0);
  const scoreTone =
    score >= 80 ? "bg-green-100 text-green-800 border-green-200" :
    score >= 60 ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
    "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-900">
            Child (private)
          </div>
          <div className="mt-1 text-sm text-gray-600">
            {s.city} • age {s.ageMin}-{s.ageMax}
          </div>
        </div>

        <div className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${scoreTone}`}>
          Score {score}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs font-semibold text-gray-500">Why this matches</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(s.reasons || []).slice(0, 6).map((r, i) => (
            <Tag key={i}>{r}</Tag>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-2 md:grid-cols-2">
        <button className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
          Shortlist
        </button>
        <button className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50">
          Not now
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        *Child identity and sensitive details remain hidden until caseworker-approved next steps.
      </p>
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="rounded-full border bg-gray-50 px-3 py-1 text-xs text-gray-700">
      {children}
    </span>
  );
}

function Pill({ children }) {
  return (
    <span className="rounded-full border bg-white px-3 py-1 text-xs text-gray-700">
      {children}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
          <div className="mt-2 h-4 w-40 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-7 w-20 animate-pulse rounded-full bg-gray-100" />
      </div>

      <div className="mt-5">
        <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
        <div className="mt-3 flex flex-wrap gap-2">
          <div className="h-7 w-20 animate-pulse rounded-full bg-gray-100" />
          <div className="h-7 w-28 animate-pulse rounded-full bg-gray-100" />
          <div className="h-7 w-24 animate-pulse rounded-full bg-gray-100" />
        </div>
      </div>

      <div className="mt-5 grid gap-2 md:grid-cols-2">
        <div className="h-10 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-10 animate-pulse rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}
