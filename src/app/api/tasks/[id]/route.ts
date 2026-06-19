import {
  isPrismaNotFoundError,
  jsonError,
  readJson,
  validationError,
} from "@/lib/apiResponses";
import { prisma } from "@/lib/prisma";
import { taskUpdateSchema } from "@/lib/taskValidation";

type TaskRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: TaskRouteContext) {
  const { id } = await params;

  if (!id) {
    return jsonError("Task id is required.", 400);
  }

  const body = await readJson(request);

  if (body.error) {
    return body.error;
  }

  const result = taskUpdateSchema.safeParse(body.data);

  if (!result.success) {
    return validationError(result.error);
  }

  try {
    const task = await prisma.task.update({
      where: { id },
      data: result.data,
    });

    return Response.json({ task });
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      return jsonError("Task not found.", 404);
    }

    return jsonError("Failed to update task.", 500);
  }
}

export async function DELETE(_request: Request, { params }: TaskRouteContext) {
  const { id } = await params;

  if (!id) {
    return jsonError("Task id is required.", 400);
  }

  try {
    const task = await prisma.task.delete({
      where: { id },
    });

    return Response.json({ task });
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      return jsonError("Task not found.", 404);
    }

    return jsonError("Failed to delete task.", 500);
  }
}
