import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createTofServer } from "../../../../mcp/tof";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DEFAULT_ALLOWED_ORIGINS = ["https://claude.ai", "https://claude.com"];
const ALLOWED_METHODS = "GET, POST, DELETE, OPTIONS";
const ALLOWED_HEADERS = [
  "Content-Type",
  "Authorization",
  "Last-Event-ID",
  "Mcp-Protocol-Version",
  "Mcp-Session-Id",
];

function isEnabled() {
  return process.env.TOF_REMOTE_MCP_ENABLED === "true";
}

function getAllowedOrigins() {
  const raw = process.env.TOF_REMOTE_MCP_ALLOWED_ORIGINS?.trim();
  if (!raw) {
    return DEFAULT_ALLOWED_ORIGINS;
  }

  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function applyCorsHeaders(response: Response, request: Request) {
  const origin = request.headers.get("origin");
  const allowedOrigins = getAllowedOrigins();
  const headers = new Headers(response.headers);

  if (origin && allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }

  headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
  headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS.join(", "));
  headers.set(
    "Access-Control-Expose-Headers",
    "Mcp-Protocol-Version, Mcp-Session-Id",
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function notFound(request: Request) {
  return applyCorsHeaders(new Response("Not Found", { status: 404 }), request);
}

function methodNotAllowed(request: Request) {
  return applyCorsHeaders(
    new Response("Method Not Allowed", { status: 405 }),
    request,
  );
}

export async function OPTIONS(request: Request) {
  if (!isEnabled()) {
    return notFound(request);
  }

  return applyCorsHeaders(new Response(null, { status: 204 }), request);
}

async function handle(request: Request) {
  if (!isEnabled()) {
    return notFound(request);
  }

  if (!["GET", "POST", "DELETE"].includes(request.method)) {
    return methodNotAllowed(request);
  }

  const transport = new WebStandardStreamableHTTPServerTransport();
  const server = createTofServer({
    name: "tof-remote",
    profile: "remote",
  });

  try {
    await server.connect(transport);
    const response = await transport.handleRequest(request);
    return applyCorsHeaders(response, request);
  } catch (error) {
    console.error("TOF remote MCP request failed:", error);
    return applyCorsHeaders(
      new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
          id: null,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
      request,
    );
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

export async function DELETE(request: Request) {
  return handle(request);
}
