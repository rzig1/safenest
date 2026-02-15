"use client";
import { useEffect, useRef, useState } from "react";

export default function CaseworkerChildren() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [ageMin, setAgeMin] = useState(6);
  const [ageMax, setAgeMax] = useState(12);
  const [city, setCity] = useState("Tunis");
  const [requiredSupports, setRequiredSupports] = useState({
    medical: false,
    therapy: false,
    disability: false,
  });

  const reqIdRef = useRef(0);

  async function load(signal) {
    const myReqId = ++reqIdRef.current;
    setLoading(true);
    setErr("");

    try {
      const res = await fetch("/api/caseworker/children", { signal });
      const data = await res.json().catch(() => ({}));

      if (myReqId !== reqIdRef.current) return;

      if (!res.ok) {
        setErr(data.error || `Failed to load (${res.status})`);
        setItems([]);
        return;
      }

      setItems(data.children || []);
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

  async function create() {
    setMsg("");
    setErr("");

    if (Number(ageMin) < 0 || Number(ageMax) < 0) return setErr("Age must be positive.");
    if (Number(ageMin) > Number(ageMax)) return setErr("Age min must be ≤ age max.");
    if (!city.trim()) return setErr("City is required.");

    const needs = {
      requiredSupports: Object.entries(requiredSupports)
        .filter(([, v]) => v)
        .map(([k]) => k),
    };

    setLoading(true);
    try {
      const res = await fetch("/api/caseworker/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageMin: Number(ageMin),
          ageMax: Number(ageMax),
          city: city.trim(),
          needs,
          preferences: {},
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || `Create failed (${res.status})`);
        return;
      }

      setMsg("✅ Child profile created");

      const controller = new AbortController();
      await load(controller.signal);
    } catch {
      setErr("Network error while creating.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
                Caseworker: Children
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Create private child profiles used for safe matching. No public browsing; summaries only.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Pill>Private profiles</Pill>
                <Pill>Needs-based matching</Pill>
                <Pill>Admin-controlled approvals</Pill>
              </div>
            </div>

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

        {/* Create Form */}
        <div className="mt-6 rounded-3xl border bg-white p-6 shadow-sm md:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-bold text-gray-900">Create child profile</div>
              <div className="mt-1 text-sm text-gray-600">
                Enter a safe, non-identifying summary (no names or photos).
              </div>
            </div>

            <button
              onClick={create}
              disabled={loading}
              className="hidden rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 md:inline-flex"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
           <label className="block">
  <div className="text-sm font-semibold text-gray-900">Age min</div>
  <input
    type="number"
    value={ageMin}
    onChange={(e) => setAgeMin(Number(e.target.value))}
    className="mt-1 w-full rounded-xl border bg-white p-3 text-sm text-gray-900 outline-none focus:border-gray-900"
  />
</label>

         <label className="block">
  <div className="text-sm font-semibold text-gray-900">Age max</div>
  <input
    type="number"
    value={ageMax}
    onChange={(e) => setAgeMax(Number(e.target.value))}
    className="mt-1 w-full rounded-xl border bg-white p-3 text-sm text-gray-900 outline-none focus:border-gray-900"
  />
</label>

            <label className="block">
  <div className="text-sm font-semibold text-gray-900">City</div>
  <input
    type="text"
    value={city}
    placeholder="e.g., Tunis"
    onChange={(e) => setCity(e.target.value)}
    className="mt-1 w-full rounded-xl border bg-white p-3 text-sm text-gray-900 outline-none focus:border-gray-900"
  />
</label>

          </div>

          <div className="mt-5">
            <div className="text-sm font-semibold text-gray-900">Required supports</div>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <Switch
                label="Medical"
                checked={requiredSupports.medical}
                onChange={(v) => setRequiredSupports((s) => ({ ...s, medical: v }))}
              />
              <Switch
                label="Therapy"
                checked={requiredSupports.therapy}
                onChange={(v) => setRequiredSupports((s) => ({ ...s, therapy: v }))}
              />
              <Switch
                label="Disability"
                checked={requiredSupports.disability}
                onChange={(v) => setRequiredSupports((s) => ({ ...s, disability: v }))}
              />
            </div>
          </div>

          <button
            onClick={create}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 md:hidden"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>

        {/* List */}
        <div className="mt-6 rounded-3xl border bg-white p-6 shadow-sm md:p-7">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-gray-900">Recent children</div>
              <div className="mt-1 text-sm text-gray-600">
                Latest 50 records (demo). Use matching suggestions after families are verified.
              </div>
            </div>

            <div className="rounded-full border bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">
              {items.length} total
            </div>
          </div>

          {loading ? (
            <div className="mt-5 grid gap-3">
              <RowSkeleton />
              <RowSkeleton />
              <RowSkeleton />
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-2xl border">
              <div className="grid grid-cols-12 gap-2 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600">
                <div className="col-span-4">City</div>
                <div className="col-span-3">Age range</div>
                <div className="col-span-3">Supports</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              {items.length === 0 && !err ? (
                <div className="p-4 text-sm text-gray-600">No children yet.</div>
              ) : (
                items.map((c) => {
                  const supports = (c.needs?.requiredSupports || []).join(", ") || "None";
                  return (
                    <div
                      key={c.id}
                      className="grid grid-cols-12 gap-2 border-t px-4 py-3 text-sm hover:bg-gray-50"
                    >
                      <div className="col-span-4 font-semibold text-gray-900">{c.city}</div>
                      <div className="col-span-3 text-gray-700">
                        {c.ageMin}-{c.ageMax}
                      </div>
                      <div className="col-span-3 text-gray-700">{supports}</div>
                      <div className="col-span-2 text-right">
                        <StatusPill status={c.status} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

/* UI helpers */

function Input({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-gray-900">{label}</div>
      <input
        className="mt-1 w-full rounded-xl border bg-white p-3 text-sm outline-none focus:border-gray-900"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Switch({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between rounded-xl border bg-white p-3 text-left"
    >
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <span
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          checked ? "bg-gray-900" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}

function StatusPill({ status }) {
  const s = String(status || "ACTIVE").toUpperCase();
  const cls =
    s === "ACTIVE"
      ? "bg-green-100 text-green-800 border-green-200"
      : s === "ARCHIVED"
      ? "bg-gray-100 text-gray-700 border-gray-200"
      : "bg-yellow-100 text-yellow-800 border-yellow-200";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      {s}
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

function RowSkeleton() {
  return (
    <div className="rounded-2xl border p-4">
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-4 h-4 animate-pulse rounded bg-gray-100" />
        <div className="col-span-3 h-4 animate-pulse rounded bg-gray-100" />
        <div className="col-span-3 h-4 animate-pulse rounded bg-gray-100" />
        <div className="col-span-2 h-4 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}
