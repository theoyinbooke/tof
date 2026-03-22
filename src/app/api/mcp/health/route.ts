export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    ok: true,
    remoteMcpEnabled: process.env.TOF_REMOTE_MCP_ENABLED === "true",
  });
}
