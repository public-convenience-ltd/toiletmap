import { NextRequest, NextResponse } from 'next/server';

// run only on homepage
export const config = {
  matcher: '/',
};

export async function middleware(req: NextRequest) {
  const { nextUrl: url, geo } = req;
  console.log(geo);
  if (!url.searchParams.has('lat') && geo && geo.latitude && geo.longitude) {
    url.searchParams.append('lat', geo.latitude);
    url.searchParams.append('lng', geo.longitude);
    return NextResponse.redirect(url);
  }
}
