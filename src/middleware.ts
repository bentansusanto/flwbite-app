import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define which routes are protected and which are public
const protectedRoutes = ["/", "/items-services", "/orders", "/inventory", "/suppliers", "/marketing", "/finance", "/reports", "/customers", "/audit-log", "/user-management", "/branches", "/tenants", "/notifications", "/settings"];
const publicRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const token = request.cookies.get("flwbite_token")?.value;

  console.log(`Middleware Debug: Path: ${pathname}, Host: ${hostname}, HasToken: ${!!token}`);



  // 1. Logika Subdomain (Multi-tenancy)
  // Ubah flwbite.com menjadi domain utama Anda
  const rootDomain = "flwbite.com";
  const isLocalhost = hostname.includes("localhost");
  
  let subdomain = "";
  if (isLocalhost) {
    // Untuk testing di localhost (misal: tenant1.localhost:3000)
    const hostParts = hostname.split(".");
    if (hostParts.length > 1) {
      subdomain = hostParts[0];
    }
  } else if (hostname.endsWith(`.${rootDomain}`)) {
    // Untuk di production (misal: tenant1.flwbite.com)
    subdomain = hostname.replace(`.${rootDomain}`, "");
  }

  // Jika ini adalah akses ke subdomain (tenant), kita bisa tambahkan logic khusus di sini 
  // atau mengirimkan informasi tenant lewat header ke internal aplikasi
  if (subdomain && subdomain !== "www") {
    // Opsional: Anda bisa melakukan rewrite ke folder khusus tenant jika menggunakan struktur [slug]
    // return NextResponse.rewrite(new URL(`/tenant/${subdomain}${pathname}`, request.url));
  }

  // 2. Logika Authentication (Existing)
  
  // If trying to access a protected route without a token, redirect to login
  const isProtectedRoute = protectedRoutes.some(route => pathname === route || pathname.startsWith(route + "/"));
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    // Jika ada subdomain, pastikan redirect kembali ke domain yang benar
    return NextResponse.redirect(loginUrl);
  }

  // Teruskan request dengan informasi hostname di header agar aplikasi bisa baca
  const response = NextResponse.next();
  if (subdomain) {
    response.headers.set("x-tenant-subdomain", subdomain);
  }

  // 3. Logika RBAC Khusus (Role Based Access Control)
  const role = request.cookies.get("flwbite_role")?.value;
  
  // Jika cashier mencoba mengakses root (dashboard), arahkan ke halaman POS
  if (pathname === "/" && role === "cashier") {
    return NextResponse.redirect(new URL("/orders/new", request.url));
  }
  
  // Arahkan admin/owner dari halaman public login ke dashboard (atau halaman lain jika cashier)
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"));
  if (isPublicRoute && token) {
    if (role === "cashier") {
      return NextResponse.redirect(new URL("/orders/new", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  return response;
}

// Matching Paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    "/((?!_next/static|_next/image|favicon.ico|images|manifest.json).*)",
  ],
};
