import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveAuthenticatedUser } from "../incomes/helpers";

const mapBudget = (budget: any) => ({
    id: budget.id,
    name: budget.name,
    category: budget.category,
    amount: Number(budget.amount),
    spent: Number(budget.spent),
    month: budget.month,
    year: budget.year,
    note: budget.note ?? "",
    createdAt: budget.createdAt,
    updatedAt: budget.updatedAt,
});

export async function GET(req: Request) {
    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const month = searchParams.get("month") ? Number(searchParams.get("month")) : undefined;
    const year = searchParams.get("year") ? Number(searchParams.get("year")) : undefined;
    const category = searchParams.get("category") || undefined;

    const budgets = await prisma.budget.findMany({
        where: {
            userId: dbUser.id,
            ...(month ? { month } : {}),
            ...(year ? { year } : {}),
            ...(category ? { category } : {}),
            ...(search
                ? {
                      OR: [
                          { name: { contains: search, mode: "insensitive" } },
                          { note: { contains: search, mode: "insensitive" } },
                      ],
                  }
                : {}),
        },
        orderBy: [
            { year: "desc" },
            { month: "desc" },
            { createdAt: "desc" },
        ],
    });

    return NextResponse.json({ data: budgets.map(mapBudget) });
}

export async function POST(req: Request) {
    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const name = body?.name?.trim();
    const category = body?.category?.trim() || "General";
    const amount = body?.amount ? Number(body.amount) : null;
    const spent = body?.spent ? Number(body.spent) : 0;
    const month = body?.month ? Number(body.month) : null;
    const year = body?.year ? Number(body.year) : null;
    const note = body?.note?.trim() || undefined;

    if (!name || !amount || !month || !year) {
        return NextResponse.json(
            { error: "Name, amount, month, and year are required." },
            { status: 400 }
        );
    }

    try {
        const budget = await prisma.budget.create({
            data: {
                userId: dbUser.id,
                name,
                category,
                amount: new Prisma.Decimal(amount),
                spent: new Prisma.Decimal(spent),
                month,
                year,
                note,
            },
        });

        return NextResponse.json({ data: mapBudget(budget) }, { status: 201 });
    } catch (error: unknown) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                { error: "Budget with this name already exists for that period." },
                { status: 409 }
            );
        }

        console.error("Create budget failed", error);
        return NextResponse.json({ error: "Unable to create budget." }, { status: 500 });
    }
}
