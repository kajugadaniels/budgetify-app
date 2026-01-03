import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-up(.*)", "/sign-out(.*)"]);

export default clerkMiddleware((auth, req) => {
    const { userId } = auth();

    if (req.nextUrl.pathname === "/" && userId) {
        const dashboardUrl = new URL("/dashboard", req.url);
        return NextResponse.redirect(dashboardUrl);
    }

    if (!isPublicRoute(req)) {
        auth.protect();
    }
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
