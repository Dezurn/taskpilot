import { ScheduleGenerator } from "@/components/ScheduleGenerator";

export default function SchedulePage() {
  return (
    <main className="flex-1 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-cyan-700">
            TaskPilot
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Schedule
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Turn active backlog and today tasks into dated study sessions based
            on your availability.
          </p>
        </header>

        <ScheduleGenerator />
      </div>
    </main>
  );
}
