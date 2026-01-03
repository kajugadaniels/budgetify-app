import {
    LayoutDashboard,
    Wallet,
    Receipt,
    Target,
    PieChart,
    WalletCards,
} from "lucide-react";

type NavItem = {
    label: string;
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Budgets", href: "/budgets", icon: Wallet },
    { label: "Income", href: "/income", icon: WalletCards },
    { label: "Transactions", href: "/transactions", icon: Receipt },
    { label: "Goals", href: "/goals", icon: Target },
    { label: "Reports", href: "/reports", icon: PieChart },
];
