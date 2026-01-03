import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import IncomePageClient, {
    IncomeRecord,
} from "@/components/shared/income/income-page-client";

export default async function IncomePage() {
    const { userId } = auth();
    if (!userId) {
        redirect("/");
    }

    const incomes = await prisma.income.findMany({
        where: { userId },
        orderBy: [
            { year: "desc" },
            { month: "desc" },
            { createdAt: "desc" },
        ],
    });

    const initialData: IncomeRecord[] = incomes.map((income) => ({
        id: income.id,
        amount: Number(income.amount),
        month: income.month,
        year: income.year,
        note: income.note ?? "",
        createdAt: income.createdAt.toISOString(),
        updatedAt: income.updatedAt.toISOString(),
    }));

    return (
        <div className="mx-auto max-w-6xl px-6 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-semibold">Income</h1>
                <p className="text-sm text-muted-foreground">
                    Track monthly earnings to keep budgets and goals in sync.
                </p>
            </div>
            <IncomePageClient initialIncomes={initialData} />
        </div>
    );
}
