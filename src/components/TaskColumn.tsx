import { TaskCard } from "@/components/TaskCard";
import type { Task, TaskStatus } from "@/types/task";

type TaskColumnProps = {
  accentClassName: string;
  isTaskPending: (taskId: string) => boolean;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  tasks: Task[];
  title: string;
};

export function TaskColumn({
  accentClassName,
  isTaskPending,
  onDeleteTask,
  onUpdateTaskStatus,
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
          <TaskCard
            key={task.id}
            isPending={isTaskPending(task.id)}
            onDeleteTask={onDeleteTask}
            onUpdateTaskStatus={onUpdateTaskStatus}
            task={task}
          />
        ))}
        {tasks.length === 0 ? (
          <div className="flex min-h-28 items-center justify-center border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
            No tasks here yet.
          </div>
        ) : null}
      </div>
    </section>
  );
}
