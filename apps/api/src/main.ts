import { InMemoryMemoryRepository } from "@lifeos/adapters";
import { CaptureMemoryUseCase } from "@lifeos/application";
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";

const memories = new InMemoryMemoryRepository();
const captureMemory = new CaptureMemoryUseCase(memories);

const port = Number(process.env.PORT ?? 4000);

const server = createServer(
  async (request: IncomingMessage, response: ServerResponse) => {
  if (request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ ok: true, service: "lifeos-api" }));
    return;
  }

  if (request.url === "/memories/sample" && request.method === "POST") {
    const memory = await captureMemory.execute({
      content: "LifeOS project initialized with clean architecture.",
      tags: ["setup", "architecture"],
      privacyScope: "private"
    });

    response.writeHead(201, { "content-type": "application/json" });
    response.end(JSON.stringify(memory));
    return;
  }

  response.writeHead(404, { "content-type": "application/json" });
  response.end(JSON.stringify({ error: "Not found" }));
  }
);

server.listen(port, () => {
  console.log(`LifeOS API listening on http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
});
