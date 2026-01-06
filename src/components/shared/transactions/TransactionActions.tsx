"use client";

import { Eye, PencilLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type TransactionActionsProps = {
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

const TransactionActions = ({ onView, onEdit, onDelete }: TransactionActionsProps) => {
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
                aria-label="View transaction details"
            >
                <Eye className="h-4 w-4" aria-hidden />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-primary"
                onClick={handleClick(onEdit)}
                aria-label="Edit transaction"
            >
                <PencilLine className="h-4 w-4" aria-hidden />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={handleClick(onDelete)}
                aria-label="Delete transaction"
            >
                <Trash2 className="h-4 w-4" aria-hidden />
            </Button>
        </div>
    );
};

export default TransactionActions;
