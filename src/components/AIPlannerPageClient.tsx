"use client";

import { useState } from "react";
import { AIPlanner } from "@/components/AIPlanner";
import type { Task } from "@/types/task";

type TaskDraft = Omit<Task, "id" | "createdAt" | "updatedAt">;

type TaskResponse = {
  task: Task;
};

async function readApiError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { error?: string };

    return body.error ?? fallback;
  } catch {
    return fallback;
  }
}

export function AIPlannerPageClient() {
  const [isCreatingTasks, setIsCreatingTasks] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    return ((await response.json()) as TaskResponse).task;
  }

  async function handleCreateTasks(taskInputs: TaskDraft[]) {
    setIsCreatingTasks(true);
    setMessage(null);
    setError(null);

    try {
      for (const taskInput of taskInputs) {
        await createTask(taskInput);
      }

      setMessage(`${taskInputs.length} task${taskInputs.length === 1 ? "" : "s"} created.`);

      return true;
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to create tasks.",
      );

      return false;
    } finally {
      setIsCreatingTasks(false);
    }
  }

  return (
    <div className="grid gap-4">
      {message ? (
        <div className="border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="border-l-4 border-rose-500 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <AIPlanner
        isCreatingTasks={isCreatingTasks}
        onCreateTasks={handleCreateTasks}
      />
    </div>
  );
}
