import { AIPlannerPageClient } from "@/components/AIPlannerPageClient";

export default function AIPlannerPage() {
  return (
    <main className="flex-1 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-cyan-700">
            TaskPilot
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            AI Planner
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Generate a structured task preview from a free-form goal, then
            choose whether to add it to the board.
          </p>
        </header>

        <AIPlannerPageClient />
      </div>
    </main>
  );
}
