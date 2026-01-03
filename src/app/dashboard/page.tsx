import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { syncUser } from "@/lib/actions/user";

export default async function Dashboard() {
    const user = await currentUser();

    // the best way of syncing => webhooks
    await syncUser();

    // redirect auth user to dashboard
    if (user) redirect("/dashboard");

    return (
        <div className="min-h-screen bg-background">
            Dashboard here
        </div>
    );
}