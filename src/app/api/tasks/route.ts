import { jsonError, readJson, validationError } from "@/lib/apiResponses";
import { prisma } from "@/lib/prisma";
import { taskCreateSchema } from "@/lib/taskValidation";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json({ tasks });
  } catch {
    return jsonError("Failed to fetch tasks.", 500);
  }
}

export async function POST(request: Request) {
  const body = await readJson(request);

  if (body.error) {
    return body.error;
  }

  const result = taskCreateSchema.safeParse(body.data);

  if (!result.success) {
    return validationError(result.error);
  }

  try {
    const task = await prisma.task.create({
      data: result.data,
    });

    return Response.json({ task }, { status: 201 });
  } catch {
    return jsonError("Failed to create task.", 500);
  }
}
