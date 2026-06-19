import { useState, type FormEvent, type ReactNode } from "react";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";

type TaskFormProps = {
  onCreateTask: (task: Task) => void;
};

type TaskFormValues = {
  title: string;
  description: string;
  deadline: string;
  estimatedMinutes: string;
  priority: TaskPriority | "";
  status: TaskStatus | "";
};

type TaskFormErrors = Partial<Record<keyof TaskFormValues, string>>;

const initialValues: TaskFormValues = {
  title: "",
  description: "",
  deadline: "",
  estimatedMinutes: "",
  priority: "MEDIUM",
  status: "BACKLOG",
};

const priorityOptions: Array<{ label: string; value: TaskPriority }> = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
];

const statusOptions: Array<{ label: string; value: TaskStatus }> = [
  { label: "Backlog", value: "BACKLOG" },
  { label: "Today", value: "TODAY" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Done", value: "DONE" },
];

function createTaskId() {
  return globalThis.crypto?.randomUUID?.() ?? `task-${Date.now()}`;
}

function validateTaskForm(values: TaskFormValues) {
  const errors: TaskFormErrors = {};
  const estimatedMinutes = Number(values.estimatedMinutes);

  if (!values.title.trim()) {
    errors.title = "Title is required.";
  }

  if (!values.description.trim()) {
    errors.description = "Description is required.";
  }

  if (!values.deadline.trim()) {
    errors.deadline = "Deadline is required.";
  }

  if (!values.estimatedMinutes.trim()) {
    errors.estimatedMinutes = "Estimated minutes is required.";
  } else if (!Number.isFinite(estimatedMinutes) || estimatedMinutes <= 0) {
    errors.estimatedMinutes = "Enter a positive number of minutes.";
  }

  if (!values.priority) {
    errors.priority = "Priority is required.";
  }

  if (!values.status) {
    errors.status = "Status is required.";
  }

  return errors;
}

export function TaskForm({ onCreateTask }: TaskFormProps) {
  const [values, setValues] = useTaskFormValues();
  const [errors, setErrors] = useTaskFormErrors();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateTaskForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onCreateTask({
      id: createTaskId(),
      title: values.title.trim(),
      description: values.description.trim(),
      deadline: values.deadline,
      estimatedMinutes: Number(values.estimatedMinutes),
      priority: values.priority as TaskPriority,
      status: values.status as TaskStatus,
    });

    setValues(initialValues);
  }

  return (
    <form
      className="grid gap-4 bg-white p-4 shadow-sm ring-1 ring-slate-200 lg:grid-cols-6"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="lg:col-span-2">
        <FieldLabel htmlFor="task-title">Title</FieldLabel>
        <input
          id="task-title"
          className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              title: event.target.value,
            }))
          }
          required
          type="text"
          value={values.title}
        />
        <FieldError message={errors.title} />
      </div>

      <div className="lg:col-span-4">
        <FieldLabel htmlFor="task-description">Description</FieldLabel>
        <input
          id="task-description"
          className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          required
          type="text"
          value={values.description}
        />
        <FieldError message={errors.description} />
      </div>

      <div className="sm:col-span-2 lg:col-span-1">
        <FieldLabel htmlFor="task-deadline">Deadline</FieldLabel>
        <input
          id="task-deadline"
          className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              deadline: event.target.value,
            }))
          }
          placeholder="Jun 25"
          required
          type="text"
          value={values.deadline}
        />
        <FieldError message={errors.deadline} />
      </div>

      <div className="sm:col-span-2 lg:col-span-1">
        <FieldLabel htmlFor="task-estimate">Minutes</FieldLabel>
        <input
          id="task-estimate"
          className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
          min="1"
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              estimatedMinutes: event.target.value,
            }))
          }
          required
          type="number"
          value={values.estimatedMinutes}
        />
        <FieldError message={errors.estimatedMinutes} />
      </div>

      <div className="sm:col-span-2 lg:col-span-1">
        <FieldLabel htmlFor="task-priority">Priority</FieldLabel>
        <select
          id="task-priority"
          className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              priority: event.target.value as TaskPriority,
            }))
          }
          required
          value={values.priority}
        >
          {priorityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError message={errors.priority} />
      </div>

      <div className="sm:col-span-2 lg:col-span-1">
        <FieldLabel htmlFor="task-status">Status</FieldLabel>
        <select
          id="task-status"
          className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              status: event.target.value as TaskStatus,
            }))
          }
          required
          value={values.status}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError message={errors.status} />
      </div>

      <div className="flex items-end sm:col-span-2 lg:col-span-2">
        <button
          className="h-10 w-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
          type="submit"
        >
          Add task
        </button>
      </div>
    </form>
  );
}

function FieldLabel({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <label className="text-sm font-medium text-slate-700" htmlFor={htmlFor}>
      {children}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-sm text-rose-600">{message}</p>;
}

function useTaskFormValues() {
  return useState<TaskFormValues>(initialValues);
}

function useTaskFormErrors() {
  return useState<TaskFormErrors>({});
}
