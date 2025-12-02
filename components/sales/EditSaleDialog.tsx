"use client";

import * as React from "react";
import {
  type SaleWithItems,
  updateSaleItem,
  removeSaleItem,
} from "@/app/actions/sales";
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
import {
  Pencil,
  Receipt,
  Minus,
  Plus,
  Trash2,
  ImageOff,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface EditSaleDialogProps {
  sale: SaleWithItems;
}

export function EditSaleDialog({ sale: initialSale }: EditSaleDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [sale, setSale] = React.useState(initialSale);
  const [loadingItemId, setLoadingItemId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setSale(initialSale);
      setError(null);
    }
  }, [open, initialSale]);

  const handleQuantityChange = async (itemId: string, delta: number) => {
    const item = sale.items.find((i) => i.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    setLoadingItemId(itemId);
    setError(null);

    const result = await updateSaleItem(itemId, newQuantity);

    if (result.success && result.data) {
      setSale(result.data);
    } else {
      setError(result.error || "Failed to update quantity");
    }

    setLoadingItemId(null);
  };

  const handleRemoveItem = async (itemId: string) => {
    if (sale.items.length === 1) {
      setError("Cannot remove the last item. Delete the entire sale instead.");
      return;
    }

    setLoadingItemId(itemId);
    setError(null);

    const result = await removeSaleItem(itemId);

    if (result.success) {
      if (result.data) {
        setSale(result.data);
      } else {
        // Sale was deleted because it was the last item
        setOpen(false);
      }
    } else {
      setError(result.error || "Failed to remove item");
    }

    setLoadingItemId(null);
  };

  const totalItems = sale.items.reduce((sum, item) => sum + item.quantity, 0);

  // Back-calculate tax (assuming 12% was applied)
  const taxRate = 0.12;
  const originalSubtotal = sale.totalAmount / (1 + taxRate);
  const tax = sale.totalAmount - originalSubtotal;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setOpen(true)}
        title="Edit sale"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Pencil className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Edit Sale</DialogTitle>
              <DialogDescription>
                Modify quantities or remove items. Stock will be adjusted.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Transaction ID */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Transaction:</span>
            <span className="font-mono text-sm">{sale.id.slice(0, 8)}...</span>
          </div>

          {/* Items List */}
          <div>
            <h4 className="text-sm font-medium mb-3">
              Items ({totalItems} {totalItems === 1 ? "item" : "items"})
            </h4>
            <div className="space-y-3">
              {sale.items.map((item) => {
                const isLoading = loadingItemId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border border-border ${
                      isLoading ? "opacity-60" : ""
                    }`}
                  >
                    {item.book.imgUrl ? (
                      <img
                        src={item.book.imgUrl}
                        alt={item.book.title}
                        className="h-14 w-10 rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-14 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                        <ImageOff className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm line-clamp-1">
                        {item.book.title}
                      </h5>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.priceAtSale)} each
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.id, -1)}
                        disabled={isLoading || item.quantity <= 1}
                      >
                        {isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                      </Button>
                      <span className="w-8 text-center font-medium text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.id, 1)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Plus className="h-3 w-3" />
                        )}
                      </Button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right shrink-0 w-24">
                      <p className="font-bold text-sm">
                        {formatCurrency(item.priceAtSale * item.quantity)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isLoading || sale.items.length === 1}
                      title={
                        sale.items.length === 1
                          ? "Cannot remove last item"
                          : "Remove item"
                      }
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Updated Totals */}
          <div className="rounded-lg border border-border p-4 bg-muted/30">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(originalSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">VAT (12%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span>New Total</span>
                <span className="text-emerald-500">
                  {formatCurrency(sale.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Reducing quantities will return stock to inventory.
            Increasing quantities will deduct from current stock.
          </p>
        </div>

        <DialogFooter className="pt-4 border-t border-border">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

