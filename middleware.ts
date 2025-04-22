import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req });
    const path = req.nextUrl.pathname;
    const referer = req.headers.get("referer");

    if (token && path === "/auth/login") {
        return NextResponse.redirect(new URL("/", req.url));
    }

    const protectedPaths = [
        "/admin",
    ];
    const isProtected = protectedPaths.some((p) => path.startsWith(p));
    if (!token && isProtected) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
        const redirectUrl = referer ? new URL(referer) : new URL("/unauthorized", req.url);
        redirectUrl.searchParams.set("error", "no-access");
        return NextResponse.redirect(redirectUrl);
    }

    if (
        (path.startsWith("/editor") || path.includes("/edit")) &&
        !(token?.role === "ADMIN" || token?.role === "EDITOR")
    ) {
        const redirectUrl = referer ? new URL(referer) : new URL("/unauthorized", req.url);
        redirectUrl.searchParams.set("error", "no-access");
        return NextResponse.redirect(redirectUrl);
    }

    if (
        path.startsWith("/blog/create") &&
        !(token?.role === "ADMIN" || token?.role === "EDITOR")
    ) {
        const redirectUrl = referer ? new URL(referer) : new URL("/unauthorized", req.url);
        redirectUrl.searchParams.set("error", "no-access");
        return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/auth/login",
    ],
};
