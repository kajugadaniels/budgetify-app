"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../prisma";

export async function syncUser() {
    try {
        const user = await currentUser();
        if (!user) return null;

        const primaryEmail =
            user.emailAddresses.find(
                (email) => email.id === user.primaryEmailAddressId
            )?.emailAddress ?? user.emailAddresses[0]?.emailAddress;

        if (!primaryEmail) return null;

        const userData = {
            clerkId: user.id,
            email: primaryEmail,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phoneNumbers[0]?.phoneNumber ?? null,
        };

        const dbUser = await prisma.user.upsert({
            where: { clerkId: user.id },
            update: userData,
            create: userData,
        });

        return dbUser;
    } catch (error) {
        console.error("Error in syncUser server action", error);
        return null;
    }
}
