import { useState, type FormEvent } from "react";
import type { GeneratedScheduleResponse } from "@/lib/scheduleSchemas";

type ScheduleFormValues = {
  availableMinutesPerDay: string;
  startDate: string;
  endDate: string;
  excludedWeekdays: number[];
};

const initialValues: ScheduleFormValues = {
  availableMinutesPerDay: "120",
  startDate: "",
  endDate: "",
  excludedWeekdays: [],
};

const weekdays = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

async function readApiError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { error?: string };

    return body.error ?? fallback;
  } catch {
    return fallback;
  }
}

export function ScheduleGenerator() {
  const [values, setValues] = useState<ScheduleFormValues>(initialValues);
  const [schedule, setSchedule] = useState<GeneratedScheduleResponse | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleWeekday(weekday: number) {
    setValues((current) => ({
      ...current,
      excludedWeekdays: current.excludedWeekdays.includes(weekday)
        ? current.excludedWeekdays.filter((value) => value !== weekday)
        : [...current.excludedWeekdays, weekday],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGenerating(true);
    setError(null);
    setSchedule(null);

    try {
      const response = await fetch("/api/schedule/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          availableMinutesPerDay: values.availableMinutesPerDay,
          startDate: values.startDate,
          endDate: values.endDate,
          excludedWeekdays: values.excludedWeekdays,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Failed to generate schedule."),
        );
      }

      setSchedule((await response.json()) as GeneratedScheduleResponse);
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "Failed to generate schedule.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section
      aria-labelledby="schedule-generator-heading"
      className="border-t-4 border-t-emerald-600 bg-white p-4 shadow-sm ring-1 ring-slate-200"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="schedule-generator-heading"
          className="text-lg font-semibold text-slate-950"
        >
          Schedule Generator
        </h2>
        <p className="text-sm text-slate-600">
          Distribute backlog and today tasks into study sessions based on your
          daily capacity.
        </p>
      </div>

      <form className="mt-4 grid gap-4 lg:grid-cols-4" onSubmit={handleSubmit}>
        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="schedule-minutes"
          >
            Minutes per day
          </label>
          <input
            className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            id="schedule-minutes"
            min="1"
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                availableMinutesPerDay: event.target.value,
              }))
            }
            required
            type="number"
            value={values.availableMinutesPerDay}
          />
        </div>

        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="schedule-start"
          >
            Start date
          </label>
          <input
            className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            id="schedule-start"
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                startDate: event.target.value,
              }))
            }
            required
            type="date"
            value={values.startDate}
          />
        </div>

        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="schedule-end"
          >
            End date
          </label>
          <input
            className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            id="schedule-end"
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                endDate: event.target.value,
              }))
            }
            required
            type="date"
            value={values.endDate}
          />
        </div>

        <div className="flex items-end">
          <button
            className="h-10 w-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isGenerating}
            type="submit"
          >
            {isGenerating ? "Generating..." : "Generate schedule"}
          </button>
        </div>

        <fieldset className="lg:col-span-4">
          <legend className="text-sm font-medium text-slate-700">
            Excluded weekdays
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {weekdays.map((weekday) => (
              <label
                className="flex items-center gap-2 border border-slate-200 px-3 py-2 text-sm text-slate-700"
                key={weekday.value}
              >
                <input
                  checked={values.excludedWeekdays.includes(weekday.value)}
                  className="h-4 w-4"
                  onChange={() => toggleWeekday(weekday.value)}
                  type="checkbox"
                />
                {weekday.label}
              </label>
            ))}
          </div>
        </fieldset>
      </form>

      {error ? (
        <div className="mt-4 border-l-4 border-rose-500 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      {schedule ? (
        <div className="mt-5 grid gap-4">
          {schedule.schedule.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {schedule.schedule.map((day) => (
                <section
                  className="border border-slate-200 bg-slate-50 p-4"
                  key={day.date}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-slate-950">
                      {day.date}
                    </h3>
                    <span className="text-sm text-slate-600">
                      {day.totalPlannedMinutes} min
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {day.sessions.map((session) => (
                      <article
                        className="bg-white p-3 shadow-sm ring-1 ring-slate-200"
                        key={session.id}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-sm font-semibold text-slate-950">
                            {session.taskTitle}
                          </h4>
                          <span className="text-xs font-semibold text-slate-500">
                            {session.taskPriority}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          {session.plannedMinutes} planned minutes
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
              No study sessions were created. The selected tasks may already be
              fully scheduled.
            </div>
          )}

          {schedule.unscheduledTasks.length > 0 ? (
            <div className="border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-semibold">Unscheduled remaining work</p>
              <ul className="mt-2 grid gap-1">
                {schedule.unscheduledTasks.map((task) => (
                  <li key={task.taskId}>
                    {task.title}: {task.remainingMinutes} min
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
