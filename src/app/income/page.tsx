import { prisma } from "@/lib/prisma";
import IncomePageClient, {
    type IncomeRecord,
} from "@/components/shared/income/IncomePageClient";

export default async function IncomePage() {
    const incomes = await prisma.income.findMany({
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
        <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-semibold">Income</h1>
                <p className="text-sm text-muted-foreground">
                    Track monthly earnings to keep budgets and goals in sync.
                </p>
            </div>
            <IncomePageClient initialIncomes={initialData} />
        </div>
    );
}
