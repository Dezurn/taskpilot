"use client";

import { useMemo, useState } from "react";
import { TaskForm } from "@/components/TaskForm";
import { TaskColumn } from "@/components/TaskColumn";
import type { Task, TaskStatus } from "@/types/task";

type TaskColumnConfig = {
  title: string;
  status: TaskStatus;
  accentClassName: string;
};

const taskColumns: TaskColumnConfig[] = [
  {
    title: "Backlog",
    status: "BACKLOG",
    accentClassName: "border-t-cyan-500",
  },
  {
    title: "Today",
    status: "TODAY",
    accentClassName: "border-t-amber-500",
  },
  {
    title: "In Progress",
    status: "IN_PROGRESS",
    accentClassName: "border-t-violet-500",
  },
  {
    title: "Done",
    status: "DONE",
    accentClassName: "border-t-emerald-500",
  },
];

const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Map onboarding flow",
    description:
      "Outline the first-run checklist and identify the key empty states for new workspace owners.",
    deadline: "Jun 24",
    estimatedMinutes: 75,
    priority: "HIGH",
    status: "BACKLOG",
  },
  {
    id: "task-2",
    title: "Draft notification copy",
    description:
      "Write concise reminders for overdue tasks, daily planning, and completed milestone summaries.",
    deadline: "Jun 27",
    estimatedMinutes: 45,
    priority: "MEDIUM",
    status: "BACKLOG",
  },
  {
    id: "task-3",
    title: "Review keyboard shortcuts",
    description:
      "Define the first set of navigation and task creation shortcuts for the dashboard experience.",
    deadline: "Jul 1",
    estimatedMinutes: 35,
    priority: "LOW",
    status: "BACKLOG",
  },
  {
    id: "task-4",
    title: "Finalize dashboard layout",
    description:
      "Tune responsive column behavior and card density for mobile, tablet, and desktop breakpoints.",
    deadline: "Today",
    estimatedMinutes: 90,
    priority: "HIGH",
    status: "TODAY",
  },
  {
    id: "task-5",
    title: "Define task data shape",
    description:
      "Confirm the local TypeScript model before connecting future storage or server actions.",
    deadline: "Today",
    estimatedMinutes: 40,
    priority: "MEDIUM",
    status: "TODAY",
  },
  {
    id: "task-6",
    title: "Collect beta feedback",
    description:
      "Summarize notes from early users into usability issues and quick follow-up tasks.",
    deadline: "Today",
    estimatedMinutes: 55,
    priority: "MEDIUM",
    status: "TODAY",
  },
  {
    id: "task-7",
    title: "Build task card components",
    description:
      "Create reusable UI pieces for title, description, deadline, estimate, and priority metadata.",
    deadline: "Jun 20",
    estimatedMinutes: 65,
    priority: "HIGH",
    status: "IN_PROGRESS",
  },
  {
    id: "task-8",
    title: "Audit responsive spacing",
    description:
      "Check board gutters, card padding, and column height on compact laptop screens.",
    deadline: "Jun 21",
    estimatedMinutes: 50,
    priority: "MEDIUM",
    status: "IN_PROGRESS",
  },
  {
    id: "task-9",
    title: "Prepare release notes",
    description:
      "Capture the initial dashboard scope and known limitations for the first internal preview.",
    deadline: "Jun 23",
    estimatedMinutes: 30,
    priority: "LOW",
    status: "IN_PROGRESS",
  },
  {
    id: "task-10",
    title: "Create project shell",
    description:
      "Initialize the App Router project with TypeScript, Tailwind, linting, and base app files.",
    deadline: "Jun 18",
    estimatedMinutes: 120,
    priority: "HIGH",
    status: "DONE",
  },
  {
    id: "task-11",
    title: "Choose visual direction",
    description:
      "Settle on a quiet operational interface with clear scan paths and practical task metadata.",
    deadline: "Jun 18",
    estimatedMinutes: 35,
    priority: "MEDIUM",
    status: "DONE",
  },
  {
    id: "task-12",
    title: "Name the workspace",
    description:
      "Confirm TaskPilot as the product name for the initial planning dashboard.",
    deadline: "Jun 17",
    estimatedMinutes: 10,
    priority: "LOW",
    status: "DONE",
  },
];

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const totalTasks = tasks.length;
  const totalEstimatedMinutes = tasks.reduce(
    (minutes, task) => minutes + task.estimatedMinutes,
    0,
  );

  const tasksByStatus = useMemo(() => {
    return taskColumns.reduce<Record<TaskStatus, Task[]>>(
      (groupedTasks, column) => {
        groupedTasks[column.status] = tasks.filter(
          (task) => task.status === column.status,
        );

        return groupedTasks;
      },
      {
        BACKLOG: [],
        TODAY: [],
        IN_PROGRESS: [],
        DONE: [],
      },
    );
  }, [tasks]);

  function handleCreateTask(task: Task) {
    setTasks((currentTasks) => [task, ...currentTasks]);
  }

  return (
    <section aria-labelledby="task-board-heading" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="task-board-heading"
            className="text-xl font-semibold text-slate-950"
          >
            Active work
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {totalTasks} tasks, {totalEstimatedMinutes} estimated minutes.
          </p>
        </div>
      </div>

      <TaskForm onCreateTask={handleCreateTask} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {taskColumns.map((column) => (
          <TaskColumn
            key={column.status}
            accentClassName={column.accentClassName}
            tasks={tasksByStatus[column.status]}
            title={column.title}
          />
        ))}
      </div>
    </section>
  );
}
