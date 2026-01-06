import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    badRequestResponse,
    parseGoalPayload,
    resolveAuthenticatedUser,
    serializeGoal,
    unauthorizedResponse,
} from "./helpers";

export async function GET() {
    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return unauthorizedResponse();

    const goals = await prisma.goal.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: goals.map(serializeGoal) });
}

export async function POST(request: Request) {
    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return unauthorizedResponse();

    const payload = await request.json().catch(() => null);
    const { data, error } = parseGoalPayload(payload);
    if (error || !data) return badRequestResponse(error ?? "Invalid payload");

    const goal = await prisma.goal.create({
        data: {
            ...data,
            userId: dbUser.id,
            status: data.status.toUpperCase() as any,
        },
    });

    return NextResponse.json({ data: serializeGoal(goal) }, { status: 201 });
}
