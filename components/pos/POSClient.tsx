"use client";

import * as React from "react";
import { getBooksForPOS, processSale, type BookForPOS } from "@/app/actions/pos";
import { ProductGrid } from "./ProductGrid";
import { CartPanel } from "./CartPanel";

export interface CartItemData {
  book: BookForPOS;
  quantity: number;
}

interface POSClientProps {
  initialBooks: BookForPOS[];
}

export function POSClient({ initialBooks }: POSClientProps) {
  const [books, setBooks] = React.useState<BookForPOS[]>(initialBooks);
  const [cart, setCart] = React.useState<CartItemData[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [saleComplete, setSaleComplete] = React.useState<string | null>(null);

  // Search books
  const handleSearch = React.useCallback(async (query: string) => {
    setSearchQuery(query);
    const results = await getBooksForPOS(query);
    setBooks(results);
  }, []);

  // Add item to cart
  const addToCart = React.useCallback((book: BookForPOS) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.book.id === book.id);
      if (existing) {
        // Check if we can add more (stock limit)
        if (existing.quantity >= book.stock) {
          return prev;
        }
        return prev.map((item) =>
          item.book.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { book, quantity: 1 }];
    });
  }, []);

  // Update cart item quantity
  const updateQuantity = React.useCallback(
    (bookId: string, newQuantity: number) => {
      setCart((prev) => {
        if (newQuantity <= 0) {
          return prev.filter((item) => item.book.id !== bookId);
        }
        return prev.map((item) => {
          if (item.book.id === bookId) {
            // Limit to available stock
            const maxQty = Math.min(newQuantity, item.book.stock);
            return { ...item, quantity: maxQty };
          }
          return item;
        });
      });
    },
    []
  );

  // Remove item from cart
  const removeFromCart = React.useCallback((bookId: string) => {
    setCart((prev) => prev.filter((item) => item.book.id !== bookId));
  }, []);

  // Clear cart
  const clearCart = React.useCallback(() => {
    setCart([]);
  }, []);

  // Process sale
  const handleCompleteSale = React.useCallback(async () => {
    if (cart.length === 0) return;

    setIsProcessing(true);
    const items = cart.map((item) => ({
      bookId: item.book.id,
      quantity: item.quantity,
    }));

    const result = await processSale(items);

    if (result.success) {
      setSaleComplete(result.saleId!);
      setCart([]);
      // Refresh books to get updated stock
      const updatedBooks = await getBooksForPOS(searchQuery);
      setBooks(updatedBooks);
    } else {
      alert(result.error || "Failed to process sale");
    }

    setIsProcessing(false);
  }, [cart, searchQuery]);

  // Dismiss sale complete notification
  const dismissNotification = React.useCallback(() => {
    setSaleComplete(null);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-140px)]">
      {/* Left Column - Product List */}
      <div className="lg:col-span-3 flex flex-col min-h-0">
        <ProductGrid
          books={books}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onAddToCart={addToCart}
          cartItems={cart}
        />
      </div>

      {/* Right Column - Cart & Checkout */}
      <div className="lg:col-span-2 flex flex-col min-h-0">
        <CartPanel
          items={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          onCompleteSale={handleCompleteSale}
          isProcessing={isProcessing}
          saleComplete={saleComplete}
          onDismissNotification={dismissNotification}
        />
      </div>
    </div>
  );
}

