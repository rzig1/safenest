"use client";
import { useEffect, useRef, useState } from "react";

export default function VerificationPage() {
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState("UNVERIFIED");
  const [docs, setDocs] = useState([]);
  const [type, setType] = useState("ID");
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const reqIdRef = useRef(0);

  async function load(signal) {
    const myReqId = ++reqIdRef.current;
    setErr("");

    try {
      const res = await fetch("/api/family/verification", { signal });
      const data = await res.json().catch(() => ({}));

      if (myReqId !== reqIdRef.current) return;

      if (!res.ok) {
        setErr(data.error || `Failed to load (${res.status})`);
        return;
      }

      setVerification(data.verification || "UNVERIFIED");
      setDocs(data.docs || []);
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

  async function submit() {
    setMsg("");
    setErr("");

    if (!url.trim()) return setErr("Please paste a document link.");

    setLoading(true);
    try {
      const res = await fetch("/api/family/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, url }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || `Submit failed (${res.status})`);
        return;
      }

      setUrl("");
      setMsg("✅ Document submitted successfully");

      const controller = new AbortController();
      await load(controller.signal);
    } catch {
      setErr("Network error while submitting.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-3xl px-6 py-12">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-3xl px-6 py-8">

        {/* Header */}
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-gray-900">
              Verification
            </h1>

            <button
              onClick={() => {
                setLoading(true);
                const controller = new AbortController();
                load(controller.signal);
              }}
              className="rounded-xl border text-gray-900 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          <div className="mt-4">
            <StatusPill status={verification} />
          </div>

          {msg && (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              {msg}
            </div>
          )}

          {err && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {err}
            </div>
          )}
        </div>

        {/* Submit Card */}
        <div className="mt-6 rounded-3xl border bg-white p-6 shadow-sm">
          <div className="text-lg font-bold text-gray-900">
            Submit document
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Paste a secure document link. Files are reviewed by admins before approval.
          </p>

          <div className="mt-5 space-y-4">
            <label className="block">
              <div className="text-sm font-semibold text-gray-900">Type</div>
              <select
                className="mt-1 w-full rounded-xl border bg-white p-3 text-sm text-gray-700 outline-none focus:border-gray-900"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option>ID</option>
                <option>PROOF_OF_ADDRESS</option>
                <option>INCOME_PROOF</option>
                <option>REFERENCE</option>
              </select>
            </label>

            <label className="block">
              <div className="text-sm font-semibold text-gray-900">
                Document link
              </div>
              <input
                className="mt-1 w-full rounded-xl border bg-white p-3 text-sm text-gray-700 outline-none focus:border-gray-900"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
            </label>

            <button
              onClick={submit}
              disabled={loading}
              className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Documents */}
        <div className="mt-6 rounded-3xl border bg-white p-6 shadow-sm">
          <div className="text-lg font-bold text-gray-900">
            Submitted documents
          </div>

          <div className="mt-4 space-y-3">
            {docs.length === 0 ? (
              <div className="text-sm text-gray-600">
                No documents yet.
              </div>
            ) : (
              docs.map((d) => (
                <div
                  key={d.id}
                  className="rounded-2xl border bg-gray-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900">
                      {d.type}
                    </div>
                    <StatusPill status={d.status} />
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
    </main>
  );
}

/* Helpers */

function StatusPill({ status }) {
  const s = String(status).toUpperCase();

  let cls = "bg-gray-100 text-gray-700 border-gray-200";
  if (s === "VERIFIED" || s === "APPROVED")
    cls = "bg-green-100 text-green-800 border-green-200";
  else if (s === "PENDING" || s === "PENDING_REVIEW")
    cls = "bg-yellow-100 text-yellow-800 border-yellow-200";
  else if (s === "REJECTED")
    cls = "bg-red-100 text-red-800 border-red-200";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      {s}
    </span>
  );
}
