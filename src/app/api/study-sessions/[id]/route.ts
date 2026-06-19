import {
  isPrismaNotFoundError,
  jsonError,
  readJson,
  validationError,
} from "@/lib/apiResponses";
import { prisma } from "@/lib/prisma";
import { studySessionReviewSchema } from "@/lib/studySessionValidation";

type StudySessionRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: StudySessionRouteContext,
) {
  const { id } = await params;

  if (!id) {
    return jsonError("Study session id is required.", 400);
  }

  const body = await readJson(request);

  if (body.error) {
    return body.error;
  }

  const result = studySessionReviewSchema.safeParse(body.data);

  if (!result.success) {
    return validationError(result.error);
  }

  try {
    const session = await prisma.studySession.findUniqueOrThrow({
      where: { id },
      include: { task: true },
    });

    if (
      result.data.markTaskDone &&
      result.data.completedMinutes < session.plannedMinutes
    ) {
      return jsonError(
        "Task can only be marked DONE when completed minutes meet planned minutes.",
        400,
      );
    }

    const updatedSession = await prisma.$transaction(async (transaction) => {
      const reviewedSession = await transaction.studySession.update({
        where: { id },
        data: {
          completedMinutes: result.data.completedMinutes,
          notes: result.data.notes ?? null,
        },
        include: { task: true },
      });

      if (result.data.markTaskDone) {
        await transaction.task.update({
          where: { id: reviewedSession.taskId },
          data: { status: "DONE" },
        });
      }

      return transaction.studySession.findUniqueOrThrow({
        where: { id },
        include: { task: true },
      });
    });

    return Response.json({ session: updatedSession });
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      return jsonError("Study session not found.", 404);
    }

    return jsonError("Failed to update study session.", 500);
  }
}
