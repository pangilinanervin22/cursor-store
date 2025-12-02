"use client";

import * as React from "react";
import { type SaleWithItems } from "@/app/actions/sales";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Receipt, Banknote, ImageOff } from "lucide-react";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

interface ViewSaleDialogProps {
  sale: SaleWithItems;
}

export function ViewSaleDialog({ sale }: ViewSaleDialogProps) {
  const [open, setOpen] = React.useState(false);

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
        title="View sale details"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Receipt className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <DialogTitle className="text-xl">Sale Details</DialogTitle>
              <DialogDescription>
                Transaction #{sale.id.slice(0, 8)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Transaction Info */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50 border border-border">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Date & Time</p>
              <p className="font-medium mt-1">
                {formatDate(sale.createdAt)}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatTime(sale.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Payment Method</p>
              <div className="flex items-center gap-2 mt-1">
                <Banknote className="h-4 w-4 text-emerald-500" />
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">
                  {sale.paymentMethod}
                </Badge>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div>
            <h4 className="text-sm font-medium mb-3">
              Items Purchased ({totalItems} {totalItems === 1 ? "item" : "items"})
            </h4>
            <div className="space-y-3">
              {sale.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border"
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
                    <h5 className="font-medium text-sm line-clamp-1">{item.book.title}</h5>
                    <p className="text-xs text-muted-foreground">{item.book.author}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      ISBN: {item.book.isbn}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm">
                      {formatCurrency(item.priceAtSale)} × {item.quantity}
                    </p>
                    <p className="font-bold text-sm">
                      {formatCurrency(item.priceAtSale * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
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
                <span>Total Paid</span>
                <span className="text-emerald-500">{formatCurrency(sale.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
