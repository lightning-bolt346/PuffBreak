import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const OWNER_COOKIE = 'pb_owner_access';

async function digestSecret(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash))
    .map((part) => part.toString(16).padStart(2, '0'))
    .join('');
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (!pathname.startsWith('/owner/')) {
    return NextResponse.next();
  }

  const expectedSlug = process.env.PUFFBREAK_OWNER_PAGE_SLUG;
  const expectedKey = process.env.PUFFBREAK_OWNER_PAGE_KEY;

  if (!expectedSlug || !expectedKey) {
    return new NextResponse('Not found', { status: 404 });
  }

  if (pathname !== `/owner/${expectedSlug}`) {
    return new NextResponse('Not found', { status: 404 });
  }

  const expectedDigest = await digestSecret(expectedKey);
  const existingCookie = request.cookies.get(OWNER_COOKIE)?.value;

  if (existingCookie === expectedDigest) {
    return NextResponse.next();
  }

  const suppliedKey = searchParams.get('key');

  if (suppliedKey === expectedKey) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.searchParams.delete('key');

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set({
      name: OWNER_COOKIE,
      value: expectedDigest,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  }

  return new NextResponse('Not found', { status: 404 });
}

export const config = {
  matcher: ['/owner/:path*'],
};
