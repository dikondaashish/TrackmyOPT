"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type CasePendingDelete = {
  id: string;
  receipt_number: string;
} | null;

type CaseStatusDeleteDialogProps = {
  casePendingDelete: CasePendingDelete;
  isRemoving: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function CaseStatusDeleteDialog({
  casePendingDelete,
  isRemoving,
  onOpenChange,
  onConfirm,
}: CaseStatusDeleteDialogProps) {
  return (
    <AlertDialog
      open={casePendingDelete !== null}
      onOpenChange={(open) => {
        if (!open && !isRemoving) onOpenChange(false);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Stop tracking this case?</AlertDialogTitle>
          <AlertDialogDescription>
            {casePendingDelete ? (
              <>
                Remove{" "}
                <span className="font-mono font-semibold text-foreground">
                  {casePendingDelete.receipt_number}
                </span>{" "}
                from your dashboard. You can add it again later.
              </>
            ) : (
              "This will remove the case from your dashboard."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={Boolean(isRemoving)}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={Boolean(isRemoving)}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {isRemoving ? "Removing…" : "Stop tracking"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
