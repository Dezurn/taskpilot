import { z } from "zod";

const requiredString = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required.`);

const deadlineSchema = z
  .string()
  .trim()
  .min(1, "Deadline is required.")
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Deadline must be a valid date.",
  })
  .transform((value) => new Date(value));

export const taskCreateSchema = z.object({
  title: requiredString("Title"),
  description: requiredString("Description"),
  deadline: deadlineSchema,
  estimatedMinutes: z.coerce
    .number()
    .int("Estimated minutes must be a whole number.")
    .positive("Estimated minutes must be greater than 0."),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  status: z.enum(["BACKLOG", "TODAY", "IN_PROGRESS", "DONE"]),
});

export const taskUpdateSchema = taskCreateSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
  });

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
