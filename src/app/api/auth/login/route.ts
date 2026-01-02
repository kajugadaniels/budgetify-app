import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id },
        });

        if (!dbUser) {
            return NextResponse.json(
                { error: "No account found. Please sign up first." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Welcome back to Budgetify.",
            user: dbUser,
        });
    } catch (error) {
        console.error("Login failed.", error);
        return NextResponse.json(
            { error: "Unable to sign you in right now." },
            { status: 500 }
        );
    }
}
