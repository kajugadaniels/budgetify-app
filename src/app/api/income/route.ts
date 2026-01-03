import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function parseNumber(value: unknown) {
    const num = typeof value === "string" ? Number(value) : NaN;
    return Number.isFinite(num) ? num : null;
}

export async function GET(request: Request) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const month = parseNumber(searchParams.get("month"));
    const year = parseNumber(searchParams.get("year"));

    const incomes = await prisma.income.findMany({
        where: {
            userId,
            ...(month ? { month } : {}),
            ...(year ? { year } : {}),
            ...(search
                ? {
                      OR: [
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

    return NextResponse.json(
        incomes.map((income) => ({
            id: income.id,
            amount: Number(income.amount),
            month: income.month,
            year: income.year,
            note: income.note,
            createdAt: income.createdAt,
            updatedAt: income.updatedAt,
        }))
    );
}

export async function POST(request: Request) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const amount = parseNumber(body?.amount);
    const month = parseNumber(body?.month);
    const year = parseNumber(body?.year);
    const note = typeof body?.note === "string" ? body.note.trim() : undefined;

    if (!amount || !month || !year) {
        return NextResponse.json(
            { error: "Amount, month, and year are required." },
            { status: 400 }
        );
    }

    try {
        const income = await prisma.income.create({
            data: {
                userId,
                amount: new Prisma.Decimal(amount),
                month,
                year,
                note,
            },
        });

        return NextResponse.json(
            {
                id: income.id,
                amount: Number(income.amount),
                month: income.month,
                year: income.year,
                note: income.note,
                createdAt: income.createdAt,
                updatedAt: income.updatedAt,
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                { error: "Income for this month and year already exists." },
                { status: 409 }
            );
        }

        console.error("Create income failed", error);
        return NextResponse.json(
            { error: "Unable to create income." },
            { status: 500 }
        );
    }
}
