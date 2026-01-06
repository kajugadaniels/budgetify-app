import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    badRequestResponse,
    notFoundResponse,
    parseGoalPayload,
    resolveAuthenticatedUser,
    serializeGoal,
    unauthorizedResponse,
} from "../helpers";

type Params = { id?: string } | Promise<{ id?: string }>;

export async function GET(_: Request, props: { params: Params }) {
    const { id } = await Promise.resolve(props.params);
    if (!id) return badRequestResponse("Goal id is required");

    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return unauthorizedResponse();

    const goal = await prisma.goal.findFirst({
        where: { id, userId: dbUser.id },
    });

    if (!goal) return notFoundResponse();
    return NextResponse.json({ data: serializeGoal(goal) });
}

export async function PATCH(request: Request, props: { params: Params }) {
    const { id } = await Promise.resolve(props.params);
    if (!id) return badRequestResponse("Goal id is required");

    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return unauthorizedResponse();

    const existing = await prisma.goal.findFirst({
        where: { id, userId: dbUser.id },
    });
    if (!existing) return notFoundResponse();

    const payload = await request.json().catch(() => null);
    const { data, error } = parseGoalPayload(payload);
    if (error || !data) return badRequestResponse(error ?? "Invalid payload");

    const goal = await prisma.goal.update({
        where: { id },
        data: {
            ...data,
            status: data.status.toUpperCase() as any,
        },
    });

    return NextResponse.json({ data: serializeGoal(goal) });
}

export async function DELETE(_: Request, props: { params: Params }) {
    const { id } = await Promise.resolve(props.params);
    if (!id) return badRequestResponse("Goal id is required");

    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return unauthorizedResponse();

    const existing = await prisma.goal.findFirst({
        where: { id, userId: dbUser.id },
    });
    if (!existing) return notFoundResponse();

    await prisma.goal.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
