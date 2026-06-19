import { z } from "zod";

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD.");

export const scheduleGenerateSchema = z
  .object({
    availableMinutesPerDay: z.coerce
      .number()
      .int("Available minutes must be a whole number.")
      .positive("Available minutes must be greater than 0.")
      .max(1440, "Available minutes cannot exceed 1440."),
    startDate: dateStringSchema,
    endDate: dateStringSchema,
    excludedWeekdays: z.array(z.coerce.number().int().min(0).max(6)).max(7),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "Start date must be before or equal to end date.",
    path: ["endDate"],
  });

export type ScheduleGenerateInput = z.infer<typeof scheduleGenerateSchema>;

export type GeneratedScheduleItem = {
  id: string;
  taskId: string;
  taskTitle: string;
  taskPriority: string;
  date: string;
  plannedMinutes: number;
};

export type GeneratedScheduleDay = {
  date: string;
  totalPlannedMinutes: number;
  sessions: GeneratedScheduleItem[];
};

export type GeneratedScheduleResponse = {
  schedule: GeneratedScheduleDay[];
  unscheduledTasks: Array<{
    taskId: string;
    title: string;
    remainingMinutes: number;
  }>;
};
