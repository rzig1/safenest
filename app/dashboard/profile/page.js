"use client";
import { useEffect, useRef, useState } from "react";

export default function FamilyProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [householdSize, setHouseholdSize] = useState(2);
  const [incomeRange, setIncomeRange] = useState("middle");
  const [experience, setExperience] = useState("");

  const [ageMin, setAgeMin] = useState(3);
  const [ageMax, setAgeMax] = useState(16);
  const [acceptsSiblings, setAcceptsSiblings] = useState(false);
  const [canRelocate, setCanRelocate] = useState(false);
  const [supports, setSupports] = useState({
    medical: false,
    therapy: false,
    disability: false,
  });

  const reqIdRef = useRef(0);

  async function load(signal) {
    const myReqId = ++reqIdRef.current;
    setErr("");
    setMsg("");

    try {
      const res = await fetch("/api/family/profile", { signal });
      const data = await res.json().catch(() => ({}));

      if (myReqId !== reqIdRef.current) return;

      if (!res.ok) {
        setErr(data.error || `Failed to load (${res.status})`);
        return;
      }

      if (data.profile) {
        const p = data.profile;
        setFullName(p.fullName || "");
        setCity(p.city || "");
        setHouseholdSize(Number(p.householdSize || 2));
        setIncomeRange(p.incomeRange || "middle");
        setExperience(p.experience || "");

        const pref = p.preferences || {};
        setAgeMin(pref.ageMin ?? 3);
        setAgeMax(pref.ageMax ?? 16);
        setAcceptsSiblings(!!pref.acceptsSiblings);
        setCanRelocate(!!pref.canRelocate);

        const sup = new Set(pref.supports || []);
        setSupports({
          medical: sup.has("medical"),
          therapy: sup.has("therapy"),
          disability: sup.has("disability"),
        });
      }
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

  const completion = calcCompletion({
    fullName,
    city,
    householdSize,
    incomeRange,
    ageMin,
    ageMax,
  });

  async function save() {
    setErr("");
    setMsg("");

    if (!fullName.trim()) return setErr("Full name is required.");
    if (!city.trim()) return setErr("City is required.");
    if (Number(householdSize) < 1) return setErr("Household size must be at least 1.");
    if (Number(ageMin) < 0 || Number(ageMax) < 0) return setErr("Age must be positive.");
    if (Number(ageMin) > Number(ageMax)) return setErr("Preferred age min must be ≤ age max.");

    setSaving(true);
    try {
      const pref = {
        ageMin: Number(ageMin),
        ageMax: Number(ageMax),
        acceptsSiblings,
        canRelocate,
        supports: Object.entries(supports).filter(([, v]) => v).map(([k]) => k),
      };

      const res = await fetch("/api/family/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          city: city.trim(),
          householdSize: Number(householdSize),
          incomeRange,
          experience,
          preferences: pref,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || `Save failed (${res.status})`);
        return;
      }

      setMsg("✅ Profile saved successfully");
    } catch {
      setErr("Network error while saving.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
                Family Profile
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Complete your information for safer matching. Children are protected by default — only verified families
                see limited summaries.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Pill>Private by default</Pill>
                <Pill>Verification required</Pill>
                <Pill>Compatibility matching</Pill>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CompletionPill percent={completion} />
              <button
                onClick={save}
                disabled={saving || loading}
                className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {loading && <SkeletonBar />}

          {!loading && msg && (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              {msg}
            </div>
          )}
          {!loading && err && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {err}
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="mt-6 grid gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            <Section title="Basic information" subtitle="Helps ensure stability and suitability.">
              <div className="grid gap-3 md:grid-cols-2">
                <Input label="Full name" value={fullName} onChange={setFullName} placeholder="e.g., Hedi Ben Salah" />
                <Input label="City" value={city} onChange={setCity} placeholder="e.g., Tunis" />
                <Input
                  label="Household size"
                  type="number"
                  value={householdSize}
                  onChange={(v) => setHouseholdSize(Number(v))}
                  min={1}
                />
                <Select
                  label="Income range"
                  value={incomeRange}
                  onChange={setIncomeRange}
                  options={[
                    ["low", "Low"],
                    ["middle", "Middle"],
                    ["high", "High"],
                  ]}
                />
              </div>

              <TextArea
                label="Experience (optional)"
                value={experience}
                onChange={setExperience}
                placeholder="Parenting experience, caregiving experience, training, etc."
              />
            </Section>

            <Section title="Preferences" subtitle="Used to compute safe matching suggestions.">
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  label="Preferred age min"
                  type="number"
                  value={ageMin}
                  onChange={(v) => setAgeMin(Number(v))}
                  min={0}
                />
                <Input
                  label="Preferred age max"
                  type="number"
                  value={ageMax}
                  onChange={(v) => setAgeMax(Number(v))}
                  min={0}
                />
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <Switch label="Accept siblings" checked={acceptsSiblings} onChange={setAcceptsSiblings} />
                <Switch label="Can relocate" checked={canRelocate} onChange={setCanRelocate} />
              </div>

              <div className="mt-2">
                <div className="text-sm font-semibold text-gray-900">Supports offered</div>
                <p className="mt-1 text-sm text-gray-600">
                  Select the supports your household can reliably provide.
                </p>

                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  <Switch
                    label="Medical"
                    checked={supports.medical}
                    onChange={(v) => setSupports((s) => ({ ...s, medical: v }))}
                  />
                  <Switch
                    label="Therapy"
                    checked={supports.therapy}
                    onChange={(v) => setSupports((s) => ({ ...s, therapy: v }))}
                  />
                  <Switch
                    label="Disability"
                    checked={supports.disability}
                    onChange={(v) => setSupports((s) => ({ ...s, disability: v }))}
                  />
                </div>
              </div>
            </Section>
          </div>
        )}
      </div>

      {/* Sticky save bar */}
      {!loading && (
        <div className="sticky bottom-0 w-full border-t bg-white/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-6 py-3">
            <div className="flex items-center gap-3">
              <CompletionPill percent={completion} />
              <span className="hidden text-sm text-gray-600 md:inline">
                Keep your profile accurate to improve safety and matching quality.
              </span>
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-7">
      <div>
        <div className="text-lg font-bold text-gray-900">{title}</div>
        {subtitle && <div className="mt-1 text-sm text-gray-600">{subtitle}</div>}
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, min }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-gray-900">{label}</div>
      <input
        className="mt-1 w-full text-gray-900 rounded-xl border bg-white p-3 text-sm outline-none focus:border-gray-900"
        type={type}
        value={value}
        min={min}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-gray-900">{label}</div>
      <textarea
        className="mt-1 w-full text-gray-900 rounded-xl border bg-white p-3 text-sm outline-none focus:border-gray-900"
        rows={5}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-gray-900">{label}</div>
      <select
        className="mt-1 text-gray-900 w-full rounded-xl border bg-white p-3 text-sm outline-none focus:border-gray-900"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
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

function CompletionPill({ percent }) {
  return (
    <div className="rounded-full border bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">
      Profile: {percent}%
    </div>
  );
}

function Pill({ children }) {
  return <span className="rounded-full border bg-white px-3 py-1 text-xs text-gray-700">{children}</span>;
}

function SkeletonBar() {
  return (
    <div className="mt-5 h-10 w-full animate-pulse rounded-2xl bg-gray-100" />
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="h-5 w-44 animate-pulse rounded bg-gray-100" />
      <div className="mt-3 h-4 w-72 animate-pulse rounded bg-gray-100" />
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
      </div>
      <div className="mt-4 h-28 animate-pulse rounded-xl bg-gray-100" />
    </div>
  );
}

function calcCompletion(fields) {
  const checks = [
    !!fields.fullName?.trim(),
    !!fields.city?.trim(),
    Number(fields.householdSize) >= 1,
    !!fields.incomeRange,
    Number(fields.ageMin) >= 0,
    Number(fields.ageMax) >= 0,
  ];
  const ok = checks.filter(Boolean).length;
  return Math.round((ok / checks.length) * 100);
}
