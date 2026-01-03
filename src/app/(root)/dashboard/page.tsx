import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function DashboardPage() {
    const { userId } = auth();
    if (!userId) {
        redirect("/");
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-semibold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                    High-level view of your budgets, income, and goals.
                </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
                Add summary cards and charts here.
            </div>
        </div>
    );
}
