"use client";

import * as React from "react";
import { type BookForPOS } from "@/app/actions/pos";
import { type CartItemData } from "./POSClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ImageOff,
  Plus,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SortAsc,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type SortField = "title" | "price" | "stock";
type SortDirection = "asc" | "desc";

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
  const [sortField, setSortField] = React.useState<SortField>("title");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");
  const searchTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      onSearch(value);
    }, 300);
  };

  // Get quantity in cart for a book
  const getCartQuantity = (bookId: string) => {
    const item = cartItems.find((i) => i.book.id === bookId);
    return item?.quantity || 0;
  };

  // Sort books
  const sortedBooks = React.useMemo(() => {
    return [...books].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "stock":
          const aRemaining = a.stock - getCartQuantity(a.id);
          const bRemaining = b.stock - getCartQuantity(b.id);
          comparison = aRemaining - bRemaining;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [books, sortField, sortDirection, cartItems]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortLabel = () => {
    const labels: Record<SortField, string> = {
      title: "Name",
      price: "Price",
      stock: "Stock",
    };
    return labels[sortField];
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border">
      {/* Search Header */}
      <div className="p-4 border-b border-border space-y-3">
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

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Sort by:</span>
          <div className="flex gap-1">
            <Button
              variant={sortField === "title" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => handleSort("title")}
            >
              Name
              {sortField === "title" && (
                sortDirection === "asc" ? (
                  <ArrowUp className="h-3 w-3 ml-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 ml-1" />
                )
              )}
            </Button>
            <Button
              variant={sortField === "price" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => handleSort("price")}
            >
              Price
              {sortField === "price" && (
                sortDirection === "asc" ? (
                  <ArrowUp className="h-3 w-3 ml-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 ml-1" />
                )
              )}
            </Button>
            <Button
              variant={sortField === "stock" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => handleSort("stock")}
            >
              Stock
              {sortField === "stock" && (
                sortDirection === "asc" ? (
                  <ArrowUp className="h-3 w-3 ml-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 ml-1" />
                )
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {sortedBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium">No books found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ? "Try a different search term" : "No books in stock"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {sortedBooks.map((book) => {
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
          Showing {sortedBooks.length} products • Sorted by {getSortLabel()} ({sortDirection === "asc" ? "A→Z" : "Z→A"})
        </p>
      </div>
    </div>
  );
}
