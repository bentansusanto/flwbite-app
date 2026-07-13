import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

async function proxy(req: NextRequest, context: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  // Await params to support both Next.js 14 and 15
  const resolvedParams = await Promise.resolve(context.params);
  const pathArray = resolvedParams?.path || [];
  
  const internalApiUrl = process.env.INTERNAL_API_URL;
  if (!internalApiUrl) {
    console.error("Proxy Error: INTERNAL_API_URL is not set in environment variables");
    return NextResponse.json({ error: "INTERNAL_API_URL is not set" }, { status: 500 });
  }

  const path = pathArray.join("/");
  const search = req.nextUrl.search;
  const targetUrl = `${internalApiUrl.replace(/\/$/, "")}/${path}${search}`;

  const headers = new Headers(req.headers);
  // Remove host header to allow fetch to set the correct host for the target URL
  headers.delete("host");
  // Remove connection header which can cause issues with some proxies
  headers.delete("connection");
  // CRITICAL: Remove accept-encoding to prevent backend from gzipping. 
  // If backend gzips, Next.js might gzip it again, breaking JSON parsing in the browser!
  headers.delete("accept-encoding");

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: (req.method !== "GET" && req.method !== "HEAD") ? await req.blob() : undefined,
      // @ts-ignore - duplex is needed for streaming body in fetch
      duplex: (req.method !== "GET" && req.method !== "HEAD") ? "half" : undefined,
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("transfer-encoding");
    responseHeaders.delete("connection");
    responseHeaders.delete("keep-alive");

    // Create a new response using the fetch response body
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`Proxy Error for ${targetUrl}:`, error);
    return NextResponse.json({ error: "Proxy Error" }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;
