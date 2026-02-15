"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Nav() {
  const { data } = useSession();
  const pathname = usePathname();
  const role = data?.user?.role;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-extrabold tracking-tight text-gray-900"
        >
          SafeNest
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {!data?.user ? (
            <>
              <NavLink href="/login" active={pathname === "/login"}>
                Login
              </NavLink>
              <Link
                href="/register"
                className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {/* Role Badge */}
              <RoleBadge role={role} />

              {/* Role-specific links */}
              {role === "FAMILY" && (
                <NavLink href="/dashboard" active={pathname.startsWith("/dashboard")}>
                  Dashboard
                </NavLink>
              )}

              {role === "ADMIN" && (
                <NavLink href="/admin" active={pathname.startsWith("/admin")}>
                  Admin
                </NavLink>
              )}

              {role === "CASEWORKER" && (
                <NavLink
                  href="/caseworker/children"
                  active={pathname.startsWith("/caseworker")}
                >
                  Caseworker
                </NavLink>
              )}

              <button
                className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-gray-900 text-white"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </Link>
  );
}

function RoleBadge({ role }) {
  if (!role) return null;

  const styles = {
    FAMILY: "bg-blue-100 text-blue-700",
    ADMIN: "bg-red-100 text-red-700",
    CASEWORKER: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`hidden rounded-full px-3 py-1 text-xs font-semibold md:inline-block ${
        styles[role] || "bg-gray-100 text-gray-700"
      }`}
    >
      {role}
    </span>
  );
}
