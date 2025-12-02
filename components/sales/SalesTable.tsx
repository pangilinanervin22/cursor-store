"use client";

import * as React from "react";
import { type SaleWithItems } from "@/app/actions/sales";
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
import { ViewSaleDialog } from "./ViewSaleDialog";
import { EditSaleDialog } from "./EditSaleDialog";
import { DeleteSaleDialog } from "./DeleteSaleDialog";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Receipt, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type SortField = "createdAt" | "totalAmount" | "itemCount";
type SortDirection = "asc" | "desc";

interface SalesTableProps {
  sales: SaleWithItems[];
  itemsPerPage?: number;
}

export function SalesTable({ sales, itemsPerPage = 10 }: SalesTableProps) {
  const [sortField, setSortField] = React.useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");

  // Sort sales
  const sortedSales = React.useMemo(() => {
    return [...sales].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "totalAmount":
          comparison = a.totalAmount - b.totalAmount;
          break;
        case "itemCount":
          const aCount = a.items.reduce((sum, item) => sum + item.quantity, 0);
          const bCount = b.items.reduce((sum, item) => sum + item.quantity, 0);
          comparison = aCount - bCount;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [sales, sortField, sortDirection]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems,
    totalItems,
  } = usePagination(sortedSales, itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "createdAt" ? "desc" : "asc");
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

  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Receipt className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No sales recorded</h3>
        <p className="text-muted-foreground mt-1">
          Sales will appear here once you complete transactions in the POS.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[140px]">Transaction ID</TableHead>
            <SortableHeader field="createdAt">Date & Time</SortableHeader>
            <SortableHeader field="itemCount" className="text-center">
              Items
            </SortableHeader>
            <TableHead>Payment</TableHead>
            <SortableHeader field="totalAmount" className="text-right">
              Total
            </SortableHeader>
            <TableHead className="text-right w-[140px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedItems.map((sale) => {
            const itemCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);
            const uniqueBooks = sale.items.length;

            return (
              <TableRow key={sale.id}>
                <TableCell className="font-mono text-xs">
                  {sale.id.slice(0, 8)}...
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{formatDate(sale.createdAt)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(sale.createdAt)}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-medium">{itemCount}</span>
                    <span className="text-xs text-muted-foreground">
                      {uniqueBooks} {uniqueBooks === 1 ? "book" : "books"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">
                    {sale.paymentMethod}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-bold text-emerald-500">
                    {formatCurrency(sale.totalAmount)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <ViewSaleDialog sale={sale} />
                    <EditSaleDialog sale={sale} />
                    <DeleteSaleDialog sale={sale} />
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
