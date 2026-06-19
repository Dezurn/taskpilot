"use client";

import { useState, type FormEvent } from "react";

type ReviewSession = {
  id: string;
  taskTitle: string;
  plannedMinutes: number;
  completedMinutes: number | null;
  notes: string | null;
  taskStatus: string;
};

type DailyReviewFormProps = {
  sessions: ReviewSession[];
};

type ReviewValues = Record<
  string,
  {
    completedMinutes: string;
    markTaskDone: boolean;
    notes: string;
  }
>;

function getInitialValues(sessions: ReviewSession[]) {
  return sessions.reduce<ReviewValues>((values, session) => {
    values[session.id] = {
      completedMinutes: String(session.completedMinutes ?? ""),
      markTaskDone: false,
      notes: session.notes ?? "",
    };

    return values;
  }, {});
}

async function readApiError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { error?: string };

    return body.error ?? fallback;
  } catch {
    return fallback;
  }
}

export function DailyReviewForm({ sessions }: DailyReviewFormProps) {
  const [values, setValues] = useState(() => getInitialValues(sessions));
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
    session: ReviewSession,
  ) {
    event.preventDefault();
    setPendingSessionId(session.id);
    setMessage(null);
    setError(null);

    const sessionValues = values[session.id];

    try {
      const response = await fetch(`/api/study-sessions/${session.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completedMinutes: sessionValues.completedMinutes,
          markTaskDone: sessionValues.markTaskDone,
          notes: sessionValues.notes,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Failed to save daily review."),
        );
      }

      setMessage(`Saved review for ${session.taskTitle}.`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save daily review.",
      );
    } finally {
      setPendingSessionId(null);
    }
  }

  if (sessions.length === 0) {
    return (
      <p className="border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
        No study sessions scheduled for today.
      </p>
    );
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

      {sessions.map((session) => {
        const completedMinutes = Number(
          values[session.id]?.completedMinutes ?? 0,
        );
        const canMarkDone = completedMinutes >= session.plannedMinutes;
        const isPending = pendingSessionId === session.id;

        return (
          <form
            className="grid gap-4 bg-white p-4 shadow-sm ring-1 ring-slate-200"
            key={session.id}
            onSubmit={(event) => handleSubmit(event, session)}
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  {session.taskTitle}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Planned: {session.plannedMinutes} minutes
                </p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {session.taskStatus}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
              <div>
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor={`completed-${session.id}`}
                >
                  Completed minutes
                </label>
                <input
                  className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  id={`completed-${session.id}`}
                  min="0"
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [session.id]: {
                        ...current[session.id],
                        completedMinutes: event.target.value,
                      },
                    }))
                  }
                  required
                  type="number"
                  value={values[session.id]?.completedMinutes ?? ""}
                />
              </div>

              <div>
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor={`notes-${session.id}`}
                >
                  Notes
                </label>
                <textarea
                  className="mt-1 min-h-24 w-full resize-y border border-slate-300 px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  id={`notes-${session.id}`}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [session.id]: {
                        ...current[session.id],
                        notes: event.target.value,
                      },
                    }))
                  }
                  value={values[session.id]?.notes ?? ""}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  checked={values[session.id]?.markTaskDone ?? false}
                  disabled={!canMarkDone}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [session.id]: {
                        ...current[session.id],
                        markTaskDone: event.target.checked,
                      },
                    }))
                  }
                  type="checkbox"
                />
                Mark task as DONE
              </label>

              <button
                className="h-10 bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Saving..." : "Save review"}
              </button>
            </div>

            {!canMarkDone ? (
              <p className="text-sm text-slate-500">
                Complete at least {session.plannedMinutes} minutes to mark this
                task as DONE.
              </p>
            ) : null}
          </form>
        );
      })}
    </div>
  );
}
