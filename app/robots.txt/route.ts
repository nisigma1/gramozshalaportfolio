import type { NextRequest } from "next/server";

export function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const body = `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
