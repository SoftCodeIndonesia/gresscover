import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // console.log(pathname);

  // // Jika path adalah '/login', tidak perlu autentikasi
  // if (pathname === '/login') {
  //   return NextResponse.next();
  // }

  // // Cek token autentikasi di cookie
  // const token = req.cookies.get('token');

  // if (!token) {
  //   // Jika tidak ada token, redirect ke halaman login
  //   const loginUrl = new URL('/login', req.url);
  //   return NextResponse.redirect(loginUrl);
  // }

  // Jika ada token, izinkan akses
  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'], // Terapkan middleware ke semua jalur
};
