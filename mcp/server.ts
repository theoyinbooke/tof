import { loadEnvConfig } from "@next/env";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createTofServer, runSelfCheck } from "./tof";

loadEnvConfig(process.cwd());

const server = createTofServer({
  name: "tof-local",
  profile: "local",
});

async function main() {
  if (process.argv.includes("--self-check")) {
    await runSelfCheck();
    return;
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TOF MCP server running on stdio");
}

main().catch((error) => {
  console.error("TOF MCP server failed:", error);
  process.exit(1);
});
