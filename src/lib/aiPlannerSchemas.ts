import { z } from "zod";

export const aiGoalRequestSchema = z.object({
  goal: z
    .string()
    .trim()
    .min(10, "Goal must be at least 10 characters.")
    .max(2000, "Goal must be 2000 characters or fewer."),
});

export const aiGoalSubtaskSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  estimatedMinutes: z.number().int().positive().max(480),
});

export const aiParsedGoalSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  deadline: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Deadline must use YYYY-MM-DD."),
  estimatedMinutes: z.number().int().positive().max(480),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  subtasks: z.array(aiGoalSubtaskSchema).max(20),
});

export type AiGoalRequest = z.infer<typeof aiGoalRequestSchema>;
export type AiParsedGoal = z.infer<typeof aiParsedGoalSchema>;
export type AiGoalSubtask = z.infer<typeof aiGoalSubtaskSchema>;
