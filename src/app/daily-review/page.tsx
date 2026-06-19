import { DailyReviewForm } from "@/components/DailyReviewForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function startOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function DailyReviewPage() {
  const today = startOfUtcDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(today.getUTCDate() + 1);

  const sessions = await prisma.studySession.findMany({
    where: {
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      task: true,
    },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  return (
    <main className="flex-1 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-cyan-700">
              TaskPilot
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Daily Review
            </h1>
            <p className="mt-2 text-sm text-slate-600">{formatDate(today)}</p>
          </div>
        </header>

        <DailyReviewForm
          sessions={sessions.map((session) => ({
            id: session.id,
            taskTitle: session.task.title,
            plannedMinutes: session.plannedMinutes,
            completedMinutes: session.completedMinutes,
            notes: session.notes,
            taskStatus: session.task.status,
          }))}
        />
      </div>
    </main>
  );
}
