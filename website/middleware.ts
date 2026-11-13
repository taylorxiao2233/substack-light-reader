import {NextRequest,NextResponse} from 'next/server';
export function middleware(request:NextRequest){
  const headers=new Headers(request.headers);
  headers.set('x-site-locale',/^\/zh(?:\/|$)/.test(request.nextUrl.pathname)?'zh':'en');
  return NextResponse.next({request:{headers}});
}
export const config={matcher:['/((?!downloads/|_next/|favicon.svg|brand-icon.svg).*)']};
