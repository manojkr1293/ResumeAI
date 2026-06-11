import OpenAI from 'openai';
import env from './env';

const getOpenAIClient = (): OpenAI | null => {
  if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY === 'sk-your-openai-api-key') {
    // Return null in development if key is not configured, to prevent application startup crashes.
    // Modules requiring AI will dynamically check and throw specific, clean AppErrors.
    return null;
  }

  const options: Record<string, unknown> = {
    apiKey: env.OPENAI_API_KEY,
    maxRetries: env.OPENAI_MAX_RETRIES,
    timeout: env.OPENAI_TIMEOUT_MS,
  };

  if (env.OPENAI_BASE_URL) {
    options.baseURL = env.OPENAI_BASE_URL;
  }

  if (env.OPENAI_ORG_ID) {
    options.organization = env.OPENAI_ORG_ID;
  }

  return new OpenAI(options);
};

export const openaiClient = getOpenAIClient();

export default openaiClient;
