import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-up(.*)",
    "/sign-in(.*)",
    "/sign-out(.*)",
]);

export default clerkMiddleware((auth, req) => {
    if (isPublicRoute(req)) return;

    const authResult = auth();
    if (!authResult.userId) {
        return authResult.redirectToSignIn({ returnBackUrl: req.url });
    }
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
