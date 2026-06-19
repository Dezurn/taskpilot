import "server-only";

import { aiParsedGoalSchema } from "@/lib/aiPlannerSchemas";
import { getOpenRouterClient, getOpenRouterModel } from "@/lib/openrouter";

const systemPrompt = `You are TaskPilot's deterministic goal parser.
Return JSON only. Do not include markdown, code fences, comments, or prose outside JSON.
Use this exact JSON shape:
{
  "title": "specific task title",
  "description": "specific task description",
  "deadline": "YYYY-MM-DD",
  "estimatedMinutes": 120,
  "priority": "LOW" | "MEDIUM" | "HIGH",
  "subtasks": [
    {
      "title": "specific subtask title",
      "description": "specific subtask description",
      "estimatedMinutes": 30
    }
  ]
}
Rules:
- Convert relative dates into concrete YYYY-MM-DD dates using today's date.
- estimatedMinutes must be a whole positive number.
- Use LOW, MEDIUM, or HIGH priority only.
- Include useful subtasks when the goal naturally has multiple steps.
- Keep titles concise and descriptions actionable.`;

export async function parseGoalWithOpenRouter(goal: string) {
  const openrouter = getOpenRouterClient();
  const completion = await openrouter.chat.completions.create({
    model: getOpenRouterModel(),
    temperature: 0,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `Today's date is ${new Date().toISOString().slice(0, 10)}. Parse this goal: ${goal}`,
      },
    ],
  });

  const content = completion.choices[0]?.message.content;

  if (!content) {
    return {
      data: null,
      error: "AI response was empty.",
    };
  }

  let parsedContent: unknown;

  try {
    parsedContent = JSON.parse(content);
  } catch {
    return {
      data: null,
      error: "AI response was not valid JSON.",
    };
  }

  const parsedGoal = aiParsedGoalSchema.safeParse(parsedContent);

  if (!parsedGoal.success) {
    return {
      data: null,
      error: "AI response did not match the expected goal format.",
      details: parsedGoal.error.flatten(),
    };
  }

  return {
    data: parsedGoal.data,
    error: null,
  };
}
