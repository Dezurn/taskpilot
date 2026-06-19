import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const priorityLabels = ["HIGH", "MEDIUM", "LOW"];

function startOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function getWeekRange(referenceDate: Date) {
  const today = startOfUtcDay(referenceDate);
  const dayOfWeek = today.getUTCDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  const weekStart = new Date(today);
  weekStart.setUTCDate(today.getUTCDate() - daysSinceMonday);

  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 7);

  return { today, weekStart, weekEnd };
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export default async function PlanVsRealityPage() {
  const { today, weekStart, weekEnd } = getWeekRange(new Date());

  const [sessions, overdueTasksCount, completedTasks] = await Promise.all([
    prisma.studySession.findMany({
      where: {
        date: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
      include: {
        task: true,
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    }),
    prisma.task.count({
      where: {
        deadline: {
          lt: today,
        },
        status: {
          not: "DONE",
        },
      },
    }),
    prisma.task.findMany({
      where: {
        status: "DONE",
        updatedAt: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
      select: {
        priority: true,
      },
    }),
  ]);

  const totalPlannedMinutes = sessions.reduce(
    (minutes, session) => minutes + session.plannedMinutes,
    0,
  );
  const totalCompletedMinutes = sessions.reduce(
    (minutes, session) => minutes + (session.completedMinutes ?? 0),
    0,
  );
  const completionPercentage =
    totalPlannedMinutes > 0
      ? (totalCompletedMinutes / totalPlannedMinutes) * 100
      : 0;
  const incompleteSessions = sessions.filter(
    (session) => (session.completedMinutes ?? 0) < session.plannedMinutes,
  );
  const completedTasksByPriority = priorityLabels.map((priority) => ({
    priority,
    count: completedTasks.filter((task) => task.priority === priority).length,
  }));

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-cyan-700">
              TaskPilot
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Plan vs Reality
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {formatDate(weekStart)} to {formatDate(new Date(weekEnd.getTime() - 1))}
            </p>
          </div>
          <Link
            className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-900"
            href="/"
          >
            Back to dashboard
          </Link>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Planned this week"
            value={`${totalPlannedMinutes} min`}
          />
          <MetricCard
            label="Completed this week"
            value={`${totalCompletedMinutes} min`}
          />
          <MetricCard
            label="Completion"
            value={formatPercent(completionPercentage)}
          />
          <MetricCard label="Overdue tasks" value={overdueTasksCount} />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-950">
              Tasks Completed By Priority
            </h2>
            <div className="mt-4 grid gap-3">
              {completedTasksByPriority.map((item) => (
                <div
                  className="flex items-center justify-between border border-slate-200 px-3 py-2"
                  key={item.priority}
                >
                  <span className="text-sm font-medium text-slate-700">
                    {item.priority}
                  </span>
                  <span className="text-lg font-semibold text-slate-950">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-950">
              Under-Completed Sessions
            </h2>
            <div className="mt-4 grid gap-3">
              {incompleteSessions.length > 0 ? (
                incompleteSessions.map((session) => (
                  <article
                    className="border border-slate-200 p-3"
                    key={session.id}
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="text-sm font-semibold text-slate-950">
                        {session.task.title}
                      </h3>
                      <span className="text-xs font-medium text-slate-500">
                        {formatDate(session.date)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      Completed {session.completedMinutes ?? 0} of{" "}
                      {session.plannedMinutes} planned minutes.
                    </p>
                    {session.notes ? (
                      <p className="mt-2 text-sm text-slate-500">
                        {session.notes}
                      </p>
                    ) : null}
                  </article>
                ))
              ) : (
                <p className="border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                  No under-completed sessions this week.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}
