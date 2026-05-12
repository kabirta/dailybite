import { N8N_TIMEOUT_MS, N8N_WEBHOOK_URL } from "../constants/config";
import { MessageContent, N8nRequest, N8nResponse } from "../types/chat";

async function postWithTimeout<T>(
  url: string,
  body: unknown,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`n8n returned HTTP ${res.status}: ${res.statusText}`);
    }

    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function sendToN8n(
  request: N8nRequest
): Promise<MessageContent[]> {
  const raw = await postWithTimeout<N8nResponse>(
    N8N_WEBHOOK_URL,
    request,
    N8N_TIMEOUT_MS
  );

  if (!Array.isArray(raw?.messages)) {
    throw new Error("Invalid response from n8n: expected messages[]");
  }

  return raw.messages;
}
