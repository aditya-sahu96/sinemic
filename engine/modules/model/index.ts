import type { ContextPack, ModelResult, ProviderConfig, FilePatch } from "../../contracts/types";

type ErrorInfo = { kind: "quota" | "network" | "invalid_output" | "other"; message: string };

// Some models wrap JSON in ```json fences. Remove them before parsing.
function stripFences(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return match ? match[1] : trimmed;
}

export async function complete(
  pack: ContextPack,
  task: string,
  providers: ProviderConfig[],
): Promise<ModelResult> {
  let lastError: ErrorInfo = { kind: "network", message: "no providers configured" };
  let lastProvider: ProviderConfig | null = null;

  for (const provider of providers) {
    lastProvider = provider;

    const apiKey = process.env[provider.apiKeyEnv];
    if (!apiKey) {
      lastError = { kind: "network", message: `missing api key env ${provider.apiKeyEnv}` };
      continue;
    }

    const url = provider.baseUrl.replace(/\/$/, "") + "/chat/completions";
    const body = {
      model: provider.modelId,
      messages: [
        {
          role: "system",
          content:
            'You are a code assistant. Return JSON only, in this shape: {"patches":[{"path":string,"newContent":string}]}',
        },
        { role: "user", content: `${pack.text}\n\nTask: ${task}` },
      ],
      response_format: { type: "json_object" },
    };

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(body),
      });
    } catch (e) {
      lastError = { kind: "network", message: String(e) };
      continue;
    }

    if (res.status === 429) {
      lastError = { kind: "quota", message: "HTTP 429" };
      continue;
    }

    // 401, 404, 5xx and other failures: move on to the next provider
    if (!res.ok) {
      lastError = { kind: "other", message: `HTTP ${res.status}` };
      continue;
    }

    let json: any;
    try {
      json = await res.json();
    } catch {
      lastError = { kind: "invalid_output", message: "provider response was not JSON" };
      continue;
    }

    // Errors can arrive inside a 200 response. Check the error field, not the model's text.
    if (json?.error) {
      const msg = String(json.error?.message ?? "provider error");
      const code = Number(json.error?.code);
      const isQuota = code === 429 || /quota|rate limit/i.test(msg);
      lastError = { kind: isQuota ? "quota" : "other", message: msg };
      continue;
    }

    const tokensUsed =
      typeof json?.usage?.total_tokens === "number" ? json.usage.total_tokens : undefined;
    const content = json?.choices?.[0]?.message?.content;

    let parsed: any;
    try {
      parsed = JSON.parse(stripFences(String(content ?? "")));
    } catch {
      // Bad output from a working model: do not fall back, report it.
      return {
        ok: false,
        provider: provider.provider,
        modelId: provider.modelId,
        tokensUsed,
        error: { kind: "invalid_output", message: "could not parse model output as JSON" },
      };
    }

    const patches: FilePatch[] = Array.isArray(parsed?.patches)
      ? parsed.patches
          .filter((p: any) => typeof p?.path === "string" && typeof p?.newContent === "string")
          .map((p: any) => ({ path: p.path as string, newContent: p.newContent as string }))
      : [];

    if (patches.length === 0) {
      return {
        ok: false,
        provider: provider.provider,
        modelId: provider.modelId,
        tokensUsed,
        error: { kind: "invalid_output", message: "model returned no valid patches" },
      };
    }

    return {
      ok: true,
      provider: provider.provider,
      modelId: provider.modelId,
      patches,
      tokensUsed,
    };
  }

  // Every provider failed. Return the last error, with the provider that produced it.
  return {
    ok: false,
    provider: lastProvider?.provider ?? null,
    modelId: lastProvider?.modelId ?? null,
    error: lastError,
  };
}