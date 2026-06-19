import type { Task, TaskPriority } from "@/types/task";

type TaskCardProps = {
  task: Task;
};

const priorityStyles: Record<TaskPriority, string> = {
  HIGH: "bg-rose-50 text-rose-700 ring-rose-200",
  MEDIUM: "bg-amber-50 text-amber-700 ring-amber-200",
  LOW: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const priorityLabels: Record<TaskPriority, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <article className="flex flex-col gap-4 bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-base font-semibold leading-6 text-slate-950">
            {task.title}
          </h4>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${priorityStyles[task.priority]}`}
          >
            {priorityLabels[task.priority]}
          </span>
        </div>
        <p className="text-sm leading-6 text-slate-600">{task.description}</p>
      </div>

      <dl className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
            Deadline
          </dt>
          <dd className="mt-1 font-medium text-slate-700">{task.deadline}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
            Estimate
          </dt>
          <dd className="mt-1 font-medium text-slate-700">
            {task.estimatedMinutes} min
          </dd>
        </div>
      </dl>
    </article>
  );
}
