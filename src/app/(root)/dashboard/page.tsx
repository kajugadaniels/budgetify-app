export default function DashboardPage() {
    return (
        <div className="mx-auto max-w-6xl px-6 py-8">
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
