import { TaskCard } from "@/components/TaskCard";
import type { Task } from "@/types/task";

type TaskColumnProps = {
  accentClassName: string;
  tasks: Task[];
  title: string;
};

export function TaskColumn({
  accentClassName,
  tasks,
  title,
}: TaskColumnProps) {
  const headingId = `${title.toLowerCase().replaceAll(" ", "-")}-heading`;

  return (
    <section
      className={`flex min-h-[22rem] flex-col gap-3 border-t-4 bg-slate-100 p-3 shadow-sm ${accentClassName}`}
      aria-labelledby={headingId}
    >
      <div className="flex items-center justify-between gap-3">
        <h3
          id={headingId}
          className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-700"
        >
          {title}
        </h3>
        <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-white px-2 text-xs font-semibold text-slate-700 shadow-sm">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}
