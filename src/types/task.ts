export type TaskStatus = "BACKLOG" | "TODAY" | "IN_PROGRESS" | "DONE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type Task = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  estimatedMinutes: number;
  priority: TaskPriority;
  status: TaskStatus;
};
