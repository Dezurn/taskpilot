import type { Task, TaskPriority, TaskStatus } from "@/types/task";

type TaskCardProps = {
  isPending: boolean;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
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

const statusOptions: Array<{ label: string; value: TaskStatus }> = [
  { label: "Backlog", value: "BACKLOG" },
  { label: "Today", value: "TODAY" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Done", value: "DONE" },
];

function formatDeadline(deadline: string) {
  const timestamp = Date.parse(deadline);

  if (Number.isNaN(timestamp)) {
    return deadline;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
}

export function TaskCard({
  isPending,
  onDeleteTask,
  onUpdateTaskStatus,
  task,
}: TaskCardProps) {
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
          <dd className="mt-1 font-medium text-slate-700">
            {formatDeadline(task.deadline)}
          </dd>
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

      <div className="grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-[1fr_auto]">
        <div>
          <label
            className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400"
            htmlFor={`task-status-${task.id}`}
          >
            Status
          </label>
          <select
            className="mt-1 w-full border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            disabled={isPending}
            id={`task-status-${task.id}`}
            onChange={(event) =>
              onUpdateTaskStatus(task.id, event.target.value as TaskStatus)
            }
            value={task.status}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          className="self-end border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          onClick={() => onDeleteTask(task.id)}
          type="button"
        >
          {isPending ? "Working..." : "Delete"}
        </button>
      </div>
    </article>
  );
}
