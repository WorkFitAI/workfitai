// Dev-only API proxy: forwards browser requests to the backend server-to-server.
// This solves cross-origin cookie issues when FE (localhost:3000) and BE (different host)
// are on different domains — the browser sees all requests as same-origin (localhost:3000),
// so HttpOnly refresh cookies set by this proxy are stored and sent correctly.
//
// Enabled by: NEXT_PUBLIC_USE_API_PROXY=true in .env.local (dev only).
// Disabled in production: returns 403 unless NEXT_PUBLIC_APP_ENV=development.
import { type NextRequest, NextResponse } from 'next/server'

const BE_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9085'

// accept-encoding is stripped so Node.js fetch receives uncompressed content;
// forwarding it would cause the proxy to receive gzip and return it with the
// content-encoding header intact, causing ERR_CONTENT_DECODING_FAILED in the browser.
const BLOCKED_REQ_HEADERS = new Set(['host', 'connection', 'transfer-encoding', 'accept-encoding'])
const BLOCKED_RES_HEADERS = new Set(['connection', 'transfer-encoding', 'keep-alive'])

// Strip Domain attribute from Set-Cookie so the browser stores the cookie
// on the proxy origin (localhost:3000) rather than the upstream BE domain.
function stripDomainFromSetCookie(setCookie: string): string {
  return setCookie
    .split(';')
    .filter((part) => !part.trim().toLowerCase().startsWith('domain='))
    .join(';')
}

async function proxyToBackend(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  if (process.env.NEXT_PUBLIC_APP_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const { path } = await params
  const targetUrl = new URL(`/${path.join('/')}`, BE_BASE)
  request.nextUrl.searchParams.forEach((v, k) => targetUrl.searchParams.set(k, v))

  const reqHeaders = new Headers()
  request.headers.forEach((value, key) => {
    if (!BLOCKED_REQ_HEADERS.has(key.toLowerCase())) {
      reqHeaders.set(key, value)
    }
  })
  // Force identity encoding so Node.js fetch receives uncompressed content.
  // Without this, undici adds its own "accept-encoding: gzip" which causes the
  // backend to return gzip; the proxy then re-sends the decompressed body with
  // the original content-encoding header, causing ERR_CONTENT_DECODING_FAILED.
  reqHeaders.set('accept-encoding', 'identity')

  const body = ['GET', 'HEAD'].includes(request.method)
    ? undefined
    : await request.arrayBuffer()

  const beRes = await fetch(targetUrl.toString(), {
    method: request.method,
    headers: reqHeaders,
    body,
  })

  const resHeaders = new Headers()
  beRes.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return // handled separately below
    if (!BLOCKED_RES_HEADERS.has(key.toLowerCase())) {
      resHeaders.append(key, value)
    }
  })

  // Forward Set-Cookie headers with Domain stripped so cookies land on proxy origin
  const setCookies =
    typeof beRes.headers.getSetCookie === 'function'
      ? beRes.headers.getSetCookie()
      : beRes.headers.get('set-cookie')
        ? [beRes.headers.get('set-cookie')!]
        : []
  for (const cookie of setCookies) {
    resHeaders.append('set-cookie', stripDomainFromSetCookie(cookie))
  }

  return new NextResponse(await beRes.arrayBuffer(), {
    status: beRes.status,
    headers: resHeaders,
  })
}

export const GET = proxyToBackend
export const POST = proxyToBackend
export const PUT = proxyToBackend
export const PATCH = proxyToBackend
export const DELETE = proxyToBackend
