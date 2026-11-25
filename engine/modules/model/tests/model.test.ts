import { describe, it, expect } from "vitest";
import http from "node:http";
import { complete } from "../index";
import type { ContextPack, ProviderConfig } from "../../../contracts/types";

const pack: ContextPack = { text: "ctx", tokenEstimate: 1, budget: 100, included: [], dropped: [], doNotRePropose: [] };

function startServer(handler: (req: http.IncomingMessage, res: http.ServerResponse) => void): Promise<{ url: string; close: () => void }> {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address() as { port: number };
      resolve({ url: `http://127.0.0.1:${addr.port}`, close: () => server.close() });
    });
  });
}

describe("model gateway", () => {
  it("falls back from 429 to valid second provider", async () => {
    const s1 = await startServer((_req, res) => { res.statusCode = 429; res.end(JSON.stringify({ error: "rate" })); });
    const s2 = await startServer((_req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ patches: [{ path: "a.ts", newContent: "x" }] }) } }] }));
    });
    process.env.KEY1 = "secret1";
    process.env.KEY2 = "secret2";
    const providers: ProviderConfig[] = [
      { provider: "p1", baseUrl: s1.url + "/v1", apiKeyEnv: "KEY1", modelId: "m1" },
      { provider: "p2", baseUrl: s2.url + "/v1", apiKeyEnv: "KEY2", modelId: "m2" },
    ];
    const res = await complete(pack, "task", providers);
    expect(res.ok).toBe(true);
    expect(res.provider).toBe("p2");
    expect(res.patches?.[0].path).toBe("a.ts");
    s1.close(); s2.close();
  });

  it("returns invalid_output on bad json (no fallback)", async () => {
    const s = await startServer((_req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ choices: [{ message: { content: "not json" } }] }));
    });
    process.env.KEYX = "secretx";
    const providers: ProviderConfig[] = [{ provider: "px", baseUrl: s.url + "/v1", apiKeyEnv: "KEYX", modelId: "mx" }];
    const res = await complete(pack, "task", providers);
    expect(res.ok).toBe(false);
    expect(res.error?.kind).toBe("invalid_output");
    s.close();
  });

  it("does not leak api key", async () => {
    const s = await startServer((_req, res) => {
      res.statusCode = 429; res.end("rate");
    });
    process.env.KEYL = "supersecret";
    const providers: ProviderConfig[] = [{ provider: "pl", baseUrl: s.url + "/v1", apiKeyEnv: "KEYL", modelId: "ml" }];
    const res = await complete(pack, "task", providers);
    const str = JSON.stringify(res);
    expect(str).not.toContain("supersecret");
    s.close();
  });
});
