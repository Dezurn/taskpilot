import { TaskBoard } from "@/components/TaskBoard";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-cyan-700">
              TaskPilot
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Project dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Plan focused work, track active tasks, and keep completed work in
              view without adding persistence or authentication yet.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:flex">
            <div className="border-l-4 border-cyan-500 bg-white px-4 py-3 shadow-sm">
              <p className="font-semibold text-slate-950">Manual tasks</p>
              <p className="text-slate-500">Created locally</p>
            </div>
            <div className="border-l-4 border-amber-500 bg-white px-4 py-3 shadow-sm">
              <p className="font-semibold text-slate-950">API backed</p>
              <p className="text-slate-500">Prisma tasks</p>
            </div>
          </div>
        </header>

        <div className="flex flex-wrap justify-end gap-4">
          <Link
            className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-900"
            href="/daily-review"
          >
            Daily Review
          </Link>
          <Link
            className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-900"
            href="/plan-vs-reality"
          >
            View Plan vs Reality
          </Link>
        </div>

        <TaskBoard />
      </div>
    </main>
  );
}
