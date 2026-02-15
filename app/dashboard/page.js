import Link from "next/link";
import { requireRole } from "@/app/lib/guards";

export default async function Dashboard() {
  const user = await requireRole(["FAMILY"]).catch(() => null);

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
          You must be logged in as a <b>Family</b> to access this page.
          <div className="mt-2 flex gap-2">
            <Link className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white" href="/login">
              Login
            </Link>
            <Link className="rounded-lg border px-3 py-2 text-xs font-semibold" href="/register">
              Register
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const status = user.verification || "UNVERIFIED";

  const statusUi = {
    UNVERIFIED: {
      badge: "bg-gray-100 text-gray-700 border-gray-200",
      title: "Unverified",
      hint: "Complete your family profile and submit verification documents to enter matching.",
      cta: { href: "/dashboard/verification", label: "Start verification" },
    },
    PENDING_REVIEW: {
      badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
      title: "Pending review",
      hint: "Your documents are submitted. An admin will review them soon.",
      cta: { href: "/dashboard/verification", label: "View submitted docs" },
    },
    VERIFIED: {
      badge: "bg-green-100 text-green-800 border-green-200",
      title: "Verified",
      hint: "You’re approved! You can now see safe match suggestions.",
      cta: { href: "/dashboard/matches", label: "View matches" },
    },
    REJECTED: {
      badge: "bg-red-100 text-red-800 border-red-200",
      title: "Rejected",
      hint: "Your verification was rejected. Please re-check documents and resubmit.",
      cta: { href: "/dashboard/verification", label: "Fix & resubmit" },
    },
  }[status] || {
    badge: "bg-gray-100 text-gray-700 border-gray-200",
    title: status,
    hint: "Update your profile and verification.",
    cta: { href: "/dashboard/verification", label: "Open verification" },
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-5xl p-6">
        {/* Header */}
        <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
                Family Dashboard
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage your profile, verification, and safe match suggestions.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 md:items-end">
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusUi.badge}`}>
                <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                {statusUi.title}
              </div>

              <Link
                href={statusUi.cta.href}
                className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                {statusUi.cta.label}
                <Arrow />
              </Link>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border bg-gray-50 p-4 text-sm text-gray-700">
            {statusUi.hint}
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <ActionCard
            href="/dashboard/profile"
            title="Family Profile"
            text="Tell us about your household and preferences."
            icon={<UserIcon />}
          />

          <ActionCard
            href="/dashboard/verification"
            title="Verification"
            text="Submit documents and track your verification status."
            icon={<CheckIcon />}
          />

          <ActionCard
            href="/dashboard/matches"
            title="Matches"
            text="See suggestions once you’re verified."
            icon={<SparkIcon />}
            disabled={status !== "VERIFIED"}
            disabledText="Available after verification"
          />
        </div>

        {/* Optional: steps */}
        <div className="mt-10 rounded-3xl border bg-white p-6 shadow-sm">
          <div className="text-lg font-bold text-gray-900">Next steps</div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Step step="1" title="Complete profile" doneHint={hasBasicProfile(user)} />
            <Step step="2" title="Submit docs" doneHint={status !== "UNVERIFIED"} />
            <Step step="3" title="View matches" doneHint={status === "VERIFIED"} />
          </div>
        </div>
      </div>
    </main>
  );
}

function ActionCard({ href, title, text, icon, disabled, disabledText }) {
  if (disabled) {
    return (
      <div className="rounded-2xl border bg-white p-5 opacity-70">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-gray-50">
            {icon}
          </div>
          <div className="font-semibold text-gray-900">{title}</div>
        </div>
        <p className="mt-3 text-sm text-gray-700">{text}</p>
        <div className="mt-4 rounded-xl border bg-gray-50 p-3 text-xs font-semibold text-gray-700">
          {disabledText || "Locked"}
        </div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-gray-50">
          {icon}
        </div>
        <div className="font-semibold text-gray-900">{title}</div>
      </div>
      <p className="mt-3 text-sm text-gray-700">{text}</p>
      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-900">
        Open <span className="transition group-hover:translate-x-0.5">→</span>
      </div>
    </Link>
  );
}

function Step({ step, title, doneHint }) {
  const done = !!doneHint;
  return (
    <div className="rounded-2xl border bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-gray-600">STEP {step}</div>
        <div className={`rounded-full border px-2 py-1 text-xs font-semibold ${done ? "bg-green-100 text-green-800 border-green-200" : "bg-white text-gray-700"}`}>
          {done ? "Done" : "Pending"}
        </div>
      </div>
      <div className="mt-3 font-semibold text-gray-900">{title}</div>
    </div>
  );
}

function hasBasicProfile(user) {
  // you can improve this later by fetching familyProfile in requireRole; for now, just show false
  return false;
}

function Arrow() {
  return (
    <svg className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M8 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="h-5 w-5 text-gray-900" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 21a8 8 0 10-16 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 13a4 4 0 100-8 4 4 0 000 8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5 text-gray-900" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg className="h-5 w-5 text-gray-900" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2l1.5 6L20 10l-6.5 2L12 22l-1.5-10L4 10l6.5-2L12 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
