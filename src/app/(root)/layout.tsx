import { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import { syncUser } from "@/lib/actions/user";

export default async function RootAreaLayout({
    children,
}: {
    children: ReactNode;
}) {
    const { userId } = auth();
    if (!userId) {
        redirect("/");
    }

    await syncUser();

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </div>
    );
}
