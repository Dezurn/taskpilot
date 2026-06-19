import { z } from "zod";

export const studySessionReviewSchema = z.object({
  completedMinutes: z.coerce
    .number()
    .int("Completed minutes must be a whole number.")
    .min(0, "Completed minutes cannot be negative."),
  notes: z.string().trim().max(1000).optional(),
  markTaskDone: z.boolean().optional().default(false),
});

export type StudySessionReviewInput = z.infer<
  typeof studySessionReviewSchema
>;
