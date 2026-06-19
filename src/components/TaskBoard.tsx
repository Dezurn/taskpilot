"use client";

import { useEffect, useMemo, useState } from "react";
import { AIPlanner } from "@/components/AIPlanner";
import { ScheduleGenerator } from "@/components/ScheduleGenerator";
import { TaskForm } from "@/components/TaskForm";
import { TaskColumn } from "@/components/TaskColumn";
import type { Task, TaskStatus } from "@/types/task";

type TaskDraft = Omit<Task, "id" | "createdAt" | "updatedAt">;

type TaskColumnConfig = {
  title: string;
  status: TaskStatus;
  accentClassName: string;
};

type TaskListResponse = {
  tasks: Task[];
};

type TaskResponse = {
  task: Task;
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

async function readApiError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { error?: string };

    return body.error ?? fallback;
  } catch {
    return fallback;
  }
}

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/tasks");

        if (!response.ok) {
          throw new Error(
            await readApiError(response, "Failed to load tasks."),
          );
        }

        const data = (await response.json()) as TaskListResponse;

        if (isMounted) {
          setTasks(data.tasks);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load tasks.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, []);

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

  async function createTask(taskInput: TaskDraft) {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskInput),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, "Failed to create task."));
    }

    const data = (await response.json()) as TaskResponse;
    return data.task;
  }

  async function handleCreateTask(taskInput: TaskDraft) {
    setIsCreating(true);
    setError(null);

    try {
      const task = await createTask(taskInput);
      setTasks((currentTasks) => [task, ...currentTasks]);

      return true;
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to create task.",
      );

      return false;
    } finally {
      setIsCreating(false);
    }
  }

  async function handleCreateTasks(taskInputs: TaskDraft[]) {
    setIsCreating(true);
    setError(null);

    const createdTasks: Task[] = [];

    try {
      for (const taskInput of taskInputs) {
        createdTasks.push(await createTask(taskInput));
      }

      setTasks((currentTasks) => [...createdTasks, ...currentTasks]);

      return true;
    } catch (createError) {
      if (createdTasks.length > 0) {
        setTasks((currentTasks) => [...createdTasks, ...currentTasks]);
      }

      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to create tasks.",
      );

      return false;
    } finally {
      setIsCreating(false);
    }
  }

  async function handleUpdateTaskStatus(taskId: string, status: TaskStatus) {
    setPendingTaskId(taskId);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Failed to update task."),
        );
      }

      const data = (await response.json()) as TaskResponse;
      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === taskId ? data.task : task)),
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update task.",
      );
    } finally {
      setPendingTaskId(null);
    }
  }

  async function handleDeleteTask(taskId: string) {
    setPendingTaskId(taskId);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Failed to delete task."),
        );
      }

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId),
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete task.",
      );
    } finally {
      setPendingTaskId(null);
    }
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
            {isLoading
              ? "Loading tasks..."
              : `${totalTasks} tasks, ${totalEstimatedMinutes} estimated minutes.`}
          </p>
        </div>
      </div>

      {error ? (
        <div className="border-l-4 border-rose-500 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <AIPlanner
        isCreatingTasks={isCreating}
        onCreateTasks={handleCreateTasks}
      />

      <ScheduleGenerator />

      <TaskForm
        isSubmitting={isCreating}
        onCreateTask={handleCreateTask}
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {taskColumns.map((column) => (
            <section
              key={column.status}
              className={`min-h-[22rem] border-t-4 bg-slate-100 p-3 shadow-sm ${column.accentClassName}`}
            >
              <div className="h-4 w-28 animate-pulse bg-slate-200" />
              <div className="mt-4 space-y-3">
                <div className="h-32 animate-pulse bg-white ring-1 ring-slate-200" />
                <div className="h-28 animate-pulse bg-white ring-1 ring-slate-200" />
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {taskColumns.map((column) => (
            <TaskColumn
              key={column.status}
              accentClassName={column.accentClassName}
              isTaskPending={(taskId) => pendingTaskId === taskId}
              onDeleteTask={handleDeleteTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              tasks={tasksByStatus[column.status]}
              title={column.title}
            />
          ))}
        </div>
      )}
    </section>
  );
}
