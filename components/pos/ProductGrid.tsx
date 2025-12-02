"use client";

import * as React from "react";
import { type BookForPOS } from "@/app/actions/pos";
import { type CartItemData } from "./POSClient";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ImageOff, Plus, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProductGridProps {
  books: BookForPOS[];
  searchQuery: string;
  onSearch: (query: string) => void;
  onAddToCart: (book: BookForPOS) => void;
  cartItems: CartItemData[];
}

export function ProductGrid({
  books,
  searchQuery,
  onSearch,
  onAddToCart,
  cartItems,
}: ProductGridProps) {
  const [localSearch, setLocalSearch] = React.useState(searchQuery);
  const searchTimeout = React.useRef<NodeJS.Timeout>();

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      onSearch(value);
    }, 300);
  };

  // Get quantity in cart for a book
  const getCartQuantity = (bookId: string) => {
    const item = cartItems.find((i) => i.book.id === bookId);
    return item?.quantity || 0;
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border">
      {/* Search Header */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium">No books found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ? "Try a different search term" : "No books in stock"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {books.map((book) => {
              const inCartQty = getCartQuantity(book.id);
              const remainingStock = book.stock - inCartQty;
              const isMaxed = remainingStock <= 0;

              return (
                <button
                  key={book.id}
                  onClick={() => !isMaxed && onAddToCart(book)}
                  disabled={isMaxed}
                  className={`group relative flex flex-col rounded-lg border border-border bg-background p-3 text-left transition-all hover:border-primary/50 hover:shadow-md ${
                    isMaxed ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {/* Cart Quantity Badge */}
                  {inCartQty > 0 && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md">
                        {inCartQty}
                      </div>
                    </div>
                  )}

                  {/* Book Image */}
                  <div className="relative mb-3 aspect-[3/4] w-full overflow-hidden rounded-md bg-muted">
                    {book.imgUrl ? (
                      <img
                        src={book.imgUrl}
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageOff className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}
                    {/* Hover Overlay */}
                    {!isMaxed && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/80 opacity-0 transition-opacity group-hover:opacity-100">
                        <Plus className="h-8 w-8 text-primary-foreground" />
                      </div>
                    )}
                    {isMaxed && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <Check className="h-6 w-6 text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <h4 className="font-medium text-sm line-clamp-2 leading-tight mb-1">
                    {book.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                    {book.author}
                  </p>

                  {/* Price & Stock */}
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-bold text-emerald-500">
                      {formatCurrency(book.price)}
                    </span>
                    <Badge
                      variant={remainingStock <= 3 ? "destructive" : "secondary"}
                      className="text-[10px]"
                    >
                      {remainingStock} left
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Showing {books.length} products in stock
        </p>
      </div>
    </div>
  );
}

