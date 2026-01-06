"use client";

import { Eye, PencilLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type GoalActionsProps = {
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

const GoalActions = ({ onView, onEdit, onDelete }: GoalActionsProps) => {
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
                aria-label="View goal details"
            >
                <Eye className="h-4 w-4" aria-hidden />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-primary"
                onClick={handleClick(onEdit)}
                aria-label="Edit goal"
            >
                <PencilLine className="h-4 w-4" aria-hidden />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={handleClick(onDelete)}
                aria-label="Delete goal"
            >
                <Trash2 className="h-4 w-4" aria-hidden />
            </Button>
        </div>
    );
};

export default GoalActions;
