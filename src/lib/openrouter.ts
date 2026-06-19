import "server-only";

import OpenAI from "openai";

export const OPENROUTER_DEFAULT_MODEL = "~openai/gpt-latest";

export function getOpenRouterModel() {
  return process.env.OPENROUTER_MODEL ?? OPENROUTER_DEFAULT_MODEL;
}

export function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required.");
  }

  return new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "X-OpenRouter-Title": "TaskPilot",
    },
  });
}
