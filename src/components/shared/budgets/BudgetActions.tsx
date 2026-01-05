"use client";

import { Eye, PencilLine, ReceiptText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type BudgetActionsProps = {
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onAddTransaction: () => void;
};

const BudgetActions = ({ onView, onEdit, onDelete, onAddTransaction }: BudgetActionsProps) => {
    const handleClick =
        (action: () => void) => (event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            action();
        };

    return (
        <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-primary"
                onClick={handleClick(onView)}
                aria-label="View details"
            >
                <Eye className="h-4 w-4" aria-hidden />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-primary"
                onClick={handleClick(onEdit)}
                aria-label="Edit budget"
            >
                <PencilLine className="h-4 w-4" aria-hidden />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-primary"
                onClick={handleClick(onAddTransaction)}
                aria-label="Add transaction"
            >
                <ReceiptText className="h-4 w-4" aria-hidden />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={handleClick(onDelete)}
                aria-label="Delete budget"
            >
                <Trash2 className="h-4 w-4" aria-hidden />
            </Button>
        </div>
    );
};

export default BudgetActions;
