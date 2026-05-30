import { createServer } from "node:http";
import { config } from "./config.js";
import { createAppContext } from "./composition-root.js";
import { handleRequest } from "./routes.js";

const context = createAppContext();
const server = createServer((request, response) => {
  void handleRequest(context, request, response);
});

server.listen(config.apiPort, () => {
  console.log(`LifeOS API listening on http://localhost:${config.apiPort}`);
  console.log(`Health check: http://localhost:${config.apiPort}/health`);
});
