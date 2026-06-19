import { Prisma } from "@/generated/prisma/client";
import { ZodError } from "zod";

export function jsonError(
  message: string,
  status: number,
  details?: unknown,
) {
  return Response.json(
    {
      error: message,
      ...(details ? { details } : {}),
    },
    { status },
  );
}

export async function readJson(request: Request) {
  try {
    return {
      data: await request.json(),
      error: null,
    };
  } catch {
    return {
      data: null,
      error: jsonError("Request body must be valid JSON.", 400),
    };
  }
}

export function validationError(error: ZodError) {
  return jsonError("Invalid request body.", 400, error.flatten());
}

export function isPrismaNotFoundError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}
