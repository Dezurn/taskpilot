"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/ai-planner", label: "AI Planner" },
  { href: "/schedule", label: "Schedule" },
  { href: "/plan-vs-reality", label: "Plan vs Reality" },
  { href: "/daily-review", label: "Daily Review" },
];

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <Link className="text-xl font-semibold text-slate-950" href="/">
            TaskPilot
          </Link>
          <p className="text-sm text-slate-500">
            Plan work, schedule study sessions, and review progress.
          </p>
        </div>
        <nav aria-label="Primary navigation" className="overflow-x-auto">
          <div className="flex min-w-max gap-2">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={`px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
