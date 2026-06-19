import { useState, type FormEvent } from "react";
import type { AiParsedGoal } from "@/lib/aiPlannerSchemas";
import type { Task } from "@/types/task";

type TaskDraft = Omit<Task, "id" | "createdAt" | "updatedAt">;

type AIPlannerProps = {
  isCreatingTasks: boolean;
  onCreateTasks: (tasks: TaskDraft[]) => Promise<boolean>;
};

async function readApiError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { error?: string };

    return body.error ?? fallback;
  } catch {
    return fallback;
  }
}

export function AIPlanner({ isCreatingTasks, onCreateTasks }: AIPlannerProps) {
  const [goal, setGoal] = useState("");
  const [parsedGoal, setParsedGoal] = useState<AiParsedGoal | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGeneratePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (goal.trim().length < 10) {
      setError("Enter a goal with at least 10 characters.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setParsedGoal(null);

    try {
      const response = await fetch("/api/ai/parse-goal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goal }),
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Failed to generate plan."),
        );
      }

      const data = (await response.json()) as AiParsedGoal;
      setParsedGoal(data);
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "Failed to generate plan.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleConfirmPlan() {
    if (!parsedGoal) {
      return;
    }

    const taskDrafts: TaskDraft[] = [
      {
        title: parsedGoal.title,
        description: parsedGoal.description,
        deadline: parsedGoal.deadline,
        estimatedMinutes: parsedGoal.estimatedMinutes,
        priority: parsedGoal.priority,
        status: "BACKLOG",
      },
      ...parsedGoal.subtasks.map((subtask) => ({
        title: subtask.title,
        description: subtask.description,
        deadline: parsedGoal.deadline,
        estimatedMinutes: subtask.estimatedMinutes,
        priority: parsedGoal.priority,
        status: "BACKLOG" as const,
      })),
    ];

    const wasCreated = await onCreateTasks(taskDrafts);

    if (wasCreated) {
      setParsedGoal(null);
      setGoal("");
    }
  }

  return (
    <section
      aria-labelledby="ai-planner-heading"
      className="border-t-4 border-t-slate-950 bg-white p-4 shadow-sm ring-1 ring-slate-200"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="ai-planner-heading"
          className="text-lg font-semibold text-slate-950"
        >
          AI Planner
        </h2>
        <p className="text-sm text-slate-600">
          Turn a free-form goal into a task preview before adding anything to
          the board.
        </p>
      </div>

      <form className="mt-4 grid gap-3" onSubmit={handleGeneratePlan}>
        <label className="text-sm font-medium text-slate-700" htmlFor="ai-goal">
          Goal
        </label>
        <textarea
          className="min-h-28 w-full resize-y border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
          id="ai-goal"
          onChange={(event) => setGoal(event.target.value)}
          placeholder="I have a math exam in 10 days, 6 topics left, I can study 2 hours per day"
          value={goal}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            className="h-10 bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isGenerating}
            type="submit"
          >
            {isGenerating ? "Generating..." : "Generate plan"}
          </button>
          {parsedGoal ? (
            <button
              className="h-10 border border-emerald-200 px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isCreatingTasks}
              onClick={handleConfirmPlan}
              type="button"
            >
              {isCreatingTasks ? "Creating tasks..." : "Confirm tasks"}
            </button>
          ) : null}
        </div>
      </form>

      {error ? (
        <div className="mt-4 border-l-4 border-rose-500 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      {parsedGoal ? (
        <div className="mt-5 grid gap-4">
          <div className="border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
              Preview
            </h3>
            <h4 className="mt-2 text-base font-semibold text-slate-950">
              {parsedGoal.title}
            </h4>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {parsedGoal.description}
            </p>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                  Deadline
                </dt>
                <dd className="mt-1 text-slate-700">{parsedGoal.deadline}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                  Estimate
                </dt>
                <dd className="mt-1 text-slate-700">
                  {parsedGoal.estimatedMinutes} min
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                  Priority
                </dt>
                <dd className="mt-1 text-slate-700">{parsedGoal.priority}</dd>
              </div>
            </dl>
          </div>

          {parsedGoal.subtasks.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {parsedGoal.subtasks.map((subtask) => (
                <article
                  className="bg-white p-4 shadow-sm ring-1 ring-slate-200"
                  key={`${subtask.title}-${subtask.estimatedMinutes}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold leading-6 text-slate-950">
                      {subtask.title}
                    </h3>
                    <span className="shrink-0 bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                      Subtask
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {subtask.description}
                  </p>
                  <p className="mt-3 border-t border-slate-100 pt-3 text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                    {subtask.estimatedMinutes} min
                  </p>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
