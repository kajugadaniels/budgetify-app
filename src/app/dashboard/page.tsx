import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { syncUser } from "@/lib/actions/user";

export default async function Dashboard() {
    const { userId } = auth();
    if (!userId) {
        redirect("/");
    }

    await syncUser();

    return (
        <div className="min-h-screen bg-background">Dashboard here</div>
    );
}
