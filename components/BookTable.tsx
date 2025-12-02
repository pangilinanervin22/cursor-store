"use client";

import * as React from "react";
import { type Book } from "@/app/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { EditBookDialog } from "@/components/EditBookDialog";
import { DeleteBookDialog } from "@/components/DeleteBookDialog";
import { formatCurrency } from "@/lib/utils";
import { ImageOff, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type SortField = "title" | "author" | "price" | "stock" | "genre" | "createdAt";
type SortDirection = "asc" | "desc";

interface BookTableProps {
  books: Book[];
  itemsPerPage?: number;
}

export function BookTable({ books, itemsPerPage = 10 }: BookTableProps) {
  const [sortField, setSortField] = React.useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");

  // Sort books
  const sortedBooks = React.useMemo(() => {
    return [...books].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "author":
          comparison = a.author.localeCompare(b.author);
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "stock":
          comparison = a.stock - b.stock;
          break;
        case "genre":
          comparison = a.genre.localeCompare(b.genre);
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [books, sortField, sortDirection]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems,
    totalItems,
  } = usePagination(sortedBooks, itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 text-primary" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-primary" />
    );
  };

  const SortableHeader = ({
    field,
    children,
    className = "",
  }: {
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead className={className}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 hover:bg-transparent"
        onClick={() => handleSort(field)}
      >
        {children}
        <SortIcon field={field} />
      </Button>
    </TableHead>
  );

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <svg
            className="h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">No books in inventory</h3>
        <p className="text-muted-foreground mt-1">
          Get started by adding your first book.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[80px]">Cover</TableHead>
            <SortableHeader field="title" className="w-[200px]">
              Title
            </SortableHeader>
            <SortableHeader field="author">Author</SortableHeader>
            <TableHead>ISBN</TableHead>
            <SortableHeader field="genre">Genre</SortableHeader>
            <SortableHeader field="price" className="text-right">
              Price
            </SortableHeader>
            <SortableHeader field="stock" className="text-center">
              Stock
            </SortableHeader>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedItems.map((book) => {
            const isLowStock = book.stock < 5;

            return (
              <TableRow key={book.id}>
                <TableCell>
                  {book.imgUrl ? (
                    <img
                      src={book.imgUrl}
                      alt={book.title}
                      className="h-14 w-10 rounded object-cover border border-border"
                    />
                  ) : (
                    <div className="h-14 w-10 rounded border border-border bg-muted flex items-center justify-center">
                      <ImageOff className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{book.title}</TableCell>
                <TableCell className="text-muted-foreground">
                  {book.author}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {book.isbn}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{book.genre}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(book.price)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={
                        isLowStock
                          ? "text-red-500 font-semibold"
                          : "text-foreground"
                      }
                    >
                      {book.stock}
                    </span>
                    {isLowStock && (
                      <Badge variant="destructive" className="text-[10px] px-1.5">
                        Low Stock
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <EditBookDialog book={book} />
                    <DeleteBookDialog book={book} />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="border-t border-border">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}
