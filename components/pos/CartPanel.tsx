"use client";

import * as React from "react";
import { type CartItemData } from "./POSClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  Banknote,
  Receipt,
  CheckCircle2,
  X,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CartPanelProps {
  items: CartItemData[];
  onUpdateQuantity: (bookId: string, quantity: number) => void;
  onRemoveItem: (bookId: string) => void;
  onClearCart: () => void;
  onCompleteSale: () => void;
  isProcessing: boolean;
  saleComplete: string | null;
  onDismissNotification: () => void;
}

const TAX_RATE = 0.12; // 12% tax

export function CartPanel({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCompleteSale,
  isProcessing,
  saleComplete,
  onDismissNotification,
}: CartPanelProps) {
  const [cashReceived, setCashReceived] = React.useState<string>("");

  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0
  );
  const tax = subtotal * TAX_RATE;
  const grandTotal = subtotal + tax;

  // Calculate change
  const cashAmount = parseFloat(cashReceived) || 0;
  const change = cashAmount - grandTotal;
  const canComplete = items.length > 0 && cashAmount >= grandTotal;

  // Reset cash received when cart changes significantly
  React.useEffect(() => {
    if (items.length === 0) {
      setCashReceived("");
    }
  }, [items.length]);

  // Handle sale completion
  const handleComplete = () => {
    onCompleteSale();
    setCashReceived("");
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Current Sale</h2>
            {items.length > 0 && (
              <Badge variant="secondary">{items.length} items</Badge>
            )}
          </div>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearCart}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Sale Complete Notification */}
      {saleComplete && (
        <div className="m-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-emerald-500">Sale Complete!</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Transaction ID: {saleComplete.slice(0, 8)}...
              </p>
            </div>
            <button
              onClick={onDismissNotification}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Receipt className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium">Cart is empty</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Click on products to add them
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.book.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
              >
                {/* Book Image */}
                {item.book.imgUrl ? (
                  <img
                    src={item.book.imgUrl}
                    alt={item.book.title}
                    className="h-14 w-10 rounded object-cover shrink-0"
                  />
                ) : (
                  <div className="h-14 w-10 rounded bg-muted shrink-0" />
                )}

                {/* Book Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-1">
                    {item.book.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(item.book.price)} each
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      onUpdateQuantity(item.book.id, item.quantity - 1)
                    }
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-medium text-sm">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      onUpdateQuantity(item.book.id, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.book.stock}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {/* Item Total */}
                <div className="text-right shrink-0 w-20">
                  <p className="font-bold text-sm">
                    {formatCurrency(item.book.price * item.quantity)}
                  </p>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onRemoveItem(item.book.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Section */}
      <div className="border-t border-border bg-muted/30">
        {/* Totals */}
        <div className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (12%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
            <span>Grand Total</span>
            <span className="text-emerald-500">{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {/* Payment Section */}
        <div className="p-4 pt-0 space-y-4">
          {/* Payment Mode */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-background border border-border">
            <Banknote className="h-5 w-5 text-emerald-500" />
            <span className="font-medium">Payment Mode:</span>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">
              CASH
            </Badge>
          </div>

          {/* Cash Received Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cash Received</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                $
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                className="pl-7 h-12 text-lg font-bold"
                disabled={items.length === 0}
              />
            </div>
          </div>

          {/* Change Display */}
          <div
            className={`p-4 rounded-lg border ${
              cashAmount > 0 && change >= 0
                ? "bg-emerald-500/10 border-emerald-500/20"
                : cashAmount > 0 && change < 0
                ? "bg-destructive/10 border-destructive/20"
                : "bg-muted border-border"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">Change Due</span>
              <span
                className={`text-2xl font-bold ${
                  change >= 0 ? "text-emerald-500" : "text-destructive"
                }`}
              >
                {cashAmount > 0 ? formatCurrency(Math.max(0, change)) : "$0.00"}
              </span>
            </div>
            {cashAmount > 0 && change < 0 && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>
                  Insufficient amount (need {formatCurrency(Math.abs(change))} more)
                </span>
              </div>
            )}
          </div>

          {/* Complete Sale Button */}
          <Button
            className="w-full h-14 text-lg font-bold bg-emerald-600 hover:bg-emerald-700"
            onClick={handleComplete}
            disabled={!canComplete || isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Complete Sale
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

