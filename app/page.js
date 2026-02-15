import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border bg-white p-8 shadow-sm md:p-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-black/5 blur-3xl" />
          <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-black/5 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs text-gray-700">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Child-first • Verified families • Private by default
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              SafeNest
              <span className="block text-gray-600">
                Adoption matching with safety controls built-in.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
              A protected adoption platform that matches children with suitable families while enforcing
              verification, privacy, and risk prevention — so kids only meet safe, responsible guardians.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                Get started
                <Arrow />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Login
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl border bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Go to dashboard
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-2 text-xs text-gray-600">
              <Pill>Role-based access (Family / Caseworker / Admin)</Pill>
              <Pill>Verification pipeline</Pill>
              <Pill>Audit logs + risk events</Pill>
              <Pill>No public child browsing</Pill>
            </div>
          </div>
        </div>

        {/* Feature grid */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={<ShieldIcon />}
            title="Privacy-first by design"
            text="Children aren’t publicly searchable. Only verified families can see limited, non-identifying summaries."
          />
          <FeatureCard
            icon={<CheckIcon />}
            title="Verification pipeline"
            text="Document submissions + admin review to ensure adopters are safe, responsible, and capable."
          />
          <FeatureCard
            icon={<AlertIcon />}
            title="Risk prevention"
            text="Account lock/ban tools + risk event tracking to block suspicious behavior and harmful intent."
          />
        </div>

        {/* How it works */}
        <div className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">How it works</h2>
              <p className="mt-2 text-sm text-gray-600">
                A simple flow that keeps children protected at every step.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <StepCard
              step="01"
              title="Create a family profile"
              text="Tell us about your household, preferences, and the supports you can provide."
            />
            <StepCard
              step="02"
              title="Submit verification documents"
              text="Upload required documents and move to manual review by a trusted admin."
            />
            <StepCard
              step="03"
              title="Get safe match suggestions"
              text="Once verified, receive compatibility-based suggestions without exposing child identities."
            />
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-14 rounded-3xl border bg-gray-900 p-8 text-white md:p-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h3 className="text-xl font-bold">Ready to demo?</h3>
              <p className="mt-2 text-sm text-white/80">
                Create a family account, submit verification, then approve it from the admin dashboard.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-white/90"
              >
                Create family account
              </Link>
              <Link
                href="/admin"
                className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15"
              >
                Admin dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pb-6 text-center text-xs text-gray-500">
          SafeNest • Hackathon MVP • Built with Next.js + Prisma + PostgreSQL
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-gray-50">
          {icon}
        </div>
        <div className="font-semibold text-gray-900">{title}</div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-gray-700">{text}</p>
    </div>
  );
}

function StepCard({ step, title, text }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-gray-500">STEP</div>
        <div className="rounded-full border bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700">
          {step}
        </div>
      </div>
      <div className="mt-3 text-lg font-semibold text-gray-900">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-gray-700">{text}</p>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="rounded-full border bg-white px-3 py-1">
      {children}
    </span>
  );
}

function Arrow() {
  return (
    <svg
      className="ml-2 h-4 w-4"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
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

/* Simple inline icons (no extra deps) */
function ShieldIcon() {
  return (
    <svg className="h-5 w-5 text-gray-900" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
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

function AlertIcon() {
  return (
    <svg className="h-5 w-5 text-gray-900" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 9v5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 17h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10.3 4.3L2.7 19.7c-.5 1 0 2.3 1.2 2.3h16.2c1.2 0 1.7-1.3 1.2-2.3L13.7 4.3c-.6-1.1-2.2-1.1-3.4 0z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
