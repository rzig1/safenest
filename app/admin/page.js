"use client";
import { useEffect, useMemo, useRef, useState } from "react";

export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState({}); // { [userId]: true }

  const reqIdRef = useRef(0);

  async function load(signal) {
    const myReqId = ++reqIdRef.current;
    setLoading(true);
    setErr("");

    try {
      const res = await fetch("/api/admin/verifications", { signal });
      const data = await res.json().catch(() => ({}));

      if (myReqId !== reqIdRef.current) return;

      if (!res.ok) {
        setErr(data.error || `Failed to load (${res.status})`);
        setItems([]);
        return;
      }

      setItems(data.users || []);
    } catch (e) {
      if (e?.name === "AbortError") return;
      setErr("Network error while loading.");
    } finally {
      if (myReqId === reqIdRef.current) setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, []);

  async function verify(userId) {
    setMsg("");
    setErr("");

    const res = await fetch(`/api/admin/verify/${userId}`, { method: "POST" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error || "Verify failed");
      return;
    }
    setMsg("✅ Verified");

    const controller = new AbortController();
    load(controller.signal);
  }

  async function ban(userId) {
    setMsg("");
    setErr("");

    const res = await fetch(`/api/admin/ban/${userId}`, { method: "POST" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error || "Ban failed");
      return;
    }
    setMsg("✅ Banned");

    const controller = new AbortController();
    load(controller.signal);
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((u) => {
      const city = u.familyProfile?.city || "";
      return (
        (u.email || "").toLowerCase().includes(s) ||
        (u.verification || "").toLowerCase().includes(s) ||
        (u.status || "").toLowerCase().includes(s) ||
        city.toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  const counts = useMemo(() => {
    const c = { total: items.length, pending: 0, verified: 0, banned: 0 };
    for (const u of items) {
      if (String(u.status).toUpperCase() === "BANNED") c.banned++;
      if (String(u.verification).toUpperCase() === "VERIFIED") c.verified++;
      if (String(u.verification).toUpperCase() === "PENDING_REVIEW") c.pending++;
    }
    return c;
  }, [items]);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
                Admin: Verification Queue
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Review family submissions, verify trusted accounts, and block unsafe users.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Pill>Pending: {counts.pending}</Pill>
                <Pill>Verified: {counts.verified}</Pill>
                <Pill>Banned: {counts.banned}</Pill>
                <Pill>Total: {counts.total}</Pill>
              </div>
            </div>

            <div className="flex flex-col gap-2 md:items-end">
              <button
                className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                onClick={() => {
                  const controller = new AbortController();
                  load(controller.signal);
                }}
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh"}
              </button>

              <input
                className="w-full rounded-xl border bg-white p-3 text-sm outline-none focus:border-gray-900 md:w-72"
                placeholder="Search email, city, status..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>

          {msg && (
            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              {msg}
            </div>
          )}
          {err && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {err}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="mt-6 rounded-3xl border bg-white p-0 shadow-sm">
          <div className="overflow-hidden rounded-3xl">
            <div className="grid grid-cols-12 gap-2 bg-gray-50 px-5 py-3 text-xs font-semibold text-gray-600">
              <div className="col-span-5">Family</div>
              <div className="col-span-3">Verification</div>
              <div className="col-span-2">Account</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {loading ? (
              <div className="p-5 space-y-3">
                <RowSkeleton />
                <RowSkeleton />
                <RowSkeleton />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-5 text-sm text-gray-600">
                {items.length === 0 ? "No families yet." : "No results for your search."}
              </div>
            ) : (
              filtered.map((u) => {
                const open = !!expanded[u.id];
                return (
                  <div key={u.id} className="border-t">
                    {/* Row */}
                    <div className="grid grid-cols-12 gap-2 px-5 py-4 hover:bg-gray-50">
  {/* Clickable area (toggle expand) */}
  <button
    type="button"
    onClick={() => setExpanded((s) => ({ ...s, [u.id]: !s[u.id] }))}
    className="col-span-10 grid grid-cols-10 gap-2 text-left"
  >
    <div className="col-span-5">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-900">{u.email}</span>
        <Chevron open={open} />
      </div>
      <div className="mt-1 text-xs text-gray-600">
        {u.familyProfile?.city ? (
          <>
            City: <b>{u.familyProfile.city}</b> • Household:{" "}
            <b>{u.familyProfile.householdSize}</b>
          </>
        ) : (
          "No profile yet"
        )}
      </div>
    </div>

    <div className="col-span-3">
      <StatusPill kind="verification" value={u.verification} />
    </div>

    <div className="col-span-2">
      <StatusPill kind="account" value={u.status} />
    </div>
  </button>

  {/* Actions (real buttons, not nested) */}
  <div className="col-span-2 flex justify-end gap-2">
    <button
      type="button"
      className="rounded-xl bg-black px-3 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
      onClick={() => verify(u.id)}
      disabled={loading}
    >
      Verify
    </button>

    <button
      type="button"
      className="rounded-xl border px-3 py-2 text-xs font-semibold text-gray-900 hover:bg-white disabled:opacity-50"
      onClick={() => ban(u.id)}
      disabled={loading}
    >
      Ban
    </button>
  </div>
</div>


                    {/* Expanded panel */}
                    {open && (
                      <div className="bg-white px-5 pb-5">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-2xl border bg-gray-50 p-4">
                            <div className="text-sm font-bold text-gray-900">Family profile</div>
                            {u.familyProfile ? (
                              <div className="mt-3 text-sm text-gray-800 space-y-1">
                                <div><b>Name:</b> {u.familyProfile.fullName}</div>
                                <div><b>City:</b> {u.familyProfile.city}</div>
                                <div><b>Household:</b> {u.familyProfile.householdSize}</div>
                                <div><b>Income:</b> {u.familyProfile.incomeRange}</div>
                              </div>
                            ) : (
                              <div className="mt-3 text-sm text-gray-600">No profile yet.</div>
                            )}
                          </div>

                          <div className="rounded-2xl border bg-gray-50 p-4">
                            <div className="text-sm font-bold text-gray-900">Documents</div>
                            <div className="mt-3 space-y-2">
                              {(u.documents || []).length === 0 ? (
                                <div className="text-sm text-gray-600">No docs</div>
                              ) : (
                                u.documents.map((d) => (
                                  <div key={d.id} className="rounded-xl border bg-white p-3 text-sm">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="font-semibold text-gray-900">{d.type}</div>
                                      <StatusPill kind="doc" value={d.status} />
                                    </div>
                                    <a
                                      className="mt-2 inline-flex text-xs font-semibold text-gray-900 underline"
                                      href={d.url}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Open link
                                    </a>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* UI helpers */

function Pill({ children }) {
  return (
    <span className="rounded-full border bg-white px-3 py-1 text-xs text-gray-700">
      {children}
    </span>
  );
}

function StatusPill({ kind, value }) {
  const v = String(value || "").toUpperCase();

  let cls = "bg-gray-100 text-gray-700 border-gray-200";

  if (kind === "verification") {
    if (v === "VERIFIED") cls = "bg-green-100 text-green-800 border-green-200";
    else if (v === "PENDING_REVIEW") cls = "bg-yellow-100 text-yellow-800 border-yellow-200";
    else if (v === "REJECTED") cls = "bg-red-100 text-red-800 border-red-200";
  }

  if (kind === "account") {
    if (v === "ACTIVE") cls = "bg-green-100 text-green-800 border-green-200";
    else if (v === "BANNED" || v === "LOCKED") cls = "bg-red-100 text-red-800 border-red-200";
  }

  if (kind === "doc") {
    if (v === "APPROVED") cls = "bg-green-100 text-green-800 border-green-200";
    else if (v === "PENDING") cls = "bg-yellow-100 text-yellow-800 border-yellow-200";
    else if (v === "REJECTED") cls = "bg-red-100 text-red-800 border-red-200";
  }

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      {v || "—"}
    </span>
  );
}

function Chevron({ open }) {
  return (
    <span className={`inline-flex transition ${open ? "rotate-180" : ""}`} aria-hidden="true">
      <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="none">
        <path
          d="M6 8l4 4 4-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function RowSkeleton() {
  return (
    <div className="rounded-2xl border p-4">
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-5 h-4 animate-pulse rounded bg-gray-100" />
        <div className="col-span-3 h-4 animate-pulse rounded bg-gray-100" />
        <div className="col-span-2 h-4 animate-pulse rounded bg-gray-100" />
        <div className="col-span-2 h-4 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}
