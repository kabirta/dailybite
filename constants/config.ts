/**
 * Replace N8N_WEBHOOK_URL with your deployed n8n webhook endpoint.
 *
 * Expected n8n response shape:
 * {
 *   "messages": MessageContent[]   // see types/chat.ts
 * }
 */
export const N8N_WEBHOOK_URL =
  "https://your-n8n-instance.com/webhook/health-chat";

export const N8N_TIMEOUT_MS = 30_000;

export const CHAT_MAX_HISTORY = 20;
