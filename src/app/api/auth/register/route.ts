import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
        }

        const primaryEmail = user.emailAddresses[0]?.emailAddress;
        if (!primaryEmail) {
            return NextResponse.json(
                { error: "Email address is required." },
                { status: 400 }
            );
        }

        const dbUser = await prisma.user.upsert({
            where: { clerkId: user.id },
            update: {
                email: primaryEmail,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phoneNumbers[0]?.phoneNumber ?? null,
            },
            create: {
                clerkId: user.id,
                email: primaryEmail,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phoneNumbers[0]?.phoneNumber ?? null,
            },
        });

        return NextResponse.json({
            message: "Account verified. Welcome to Budgetify.",
            user: dbUser,
        });
    } catch (error) {
        console.error("Register user failed.", error);
        return NextResponse.json(
            { error: "Unable to register user right now." },
            { status: 500 }
        );
    }
}
