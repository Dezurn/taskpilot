import { jsonError, readJson, validationError } from "@/lib/apiResponses";
import { parseGoalWithOpenRouter } from "@/lib/aiGoalParser";
import { aiGoalRequestSchema } from "@/lib/aiPlannerSchemas";

export async function POST(request: Request) {
  const body = await readJson(request);

  if (body.error) {
    return body.error;
  }

  const requestResult = aiGoalRequestSchema.safeParse(body.data);

  if (!requestResult.success) {
    return validationError(requestResult.error);
  }

  try {
    const parsedGoal = await parseGoalWithOpenRouter(requestResult.data.goal);

    if (parsedGoal.error) {
      return jsonError(parsedGoal.error, 500, parsedGoal.details);
    }

    return Response.json(parsedGoal.data);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("OPENROUTER_API_KEY")
    ) {
      return jsonError("OpenRouter is not configured.", 500);
    }

    return jsonError("Failed to parse goal.", 500);
  }
}
