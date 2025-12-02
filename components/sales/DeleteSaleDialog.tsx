"use client";

import * as React from "react";
import { deleteSale, type SaleWithItems } from "@/app/actions/sales";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, AlertTriangle, Package } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DeleteSaleDialogProps {
  sale: SaleWithItems;
}

export function DeleteSaleDialog({ sale }: DeleteSaleDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const totalItems = sale.items.reduce((sum, item) => sum + item.quantity, 0);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    const result = await deleteSale(sale.id);

    if (result.success) {
      setOpen(false);
    } else {
      setError(result.error || "Failed to delete sale");
    }

    setIsDeleting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => setOpen(true)}
        title="Delete sale"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete Sale</DialogTitle>
              <DialogDescription>
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive mb-4">
              {error}
            </div>
          )}

          {/* Sale Summary */}
          <div className="rounded-lg border border-border p-4 bg-muted/50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-mono text-xs text-muted-foreground">
                  #{sale.id.slice(0, 8)}
                </p>
                <p className="font-medium">
                  {formatDate(new Date(sale.createdAt))}
                </p>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">
                {sale.paymentMethod}
              </Badge>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4" />
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </div>
              <p className="font-bold text-emerald-500">
                {formatCurrency(sale.totalAmount)}
              </p>
            </div>
          </div>

          {/* Items Preview */}
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Items in this sale:</p>
            <ul className="text-sm space-y-1">
              {sale.items.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span className="truncate mr-2">{item.book.title}</span>
                  <span className="text-muted-foreground shrink-0">×{item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-sm text-yellow-600 dark:text-yellow-500">
              <strong>Warning:</strong> Deleting this sale will return {totalItems}{" "}
              {totalItems === 1 ? "item" : "items"} back to inventory.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Sale"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

