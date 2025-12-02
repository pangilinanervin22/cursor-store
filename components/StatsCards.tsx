import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { BookOpen, AlertTriangle, DollarSign } from "lucide-react";

interface StatsCardsProps {
  totalBooks: number;
  lowStockCount: number;
  totalValue: number;
}

export function StatsCards({
  totalBooks,
  lowStockCount,
  totalValue,
}: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Books</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalBooks}</div>
          <p className="text-xs text-muted-foreground">
            Books in your inventory
          </p>
        </CardContent>
      </Card>

      <Card className={lowStockCount > 0 ? "border-red-500/50" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
          <AlertTriangle
            className={`h-4 w-4 ${
              lowStockCount > 0 ? "text-red-500" : "text-muted-foreground"
            }`}
          />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              lowStockCount > 0 ? "text-red-500" : ""
            }`}
          >
            {lowStockCount}
          </div>
          <p className="text-xs text-muted-foreground">
            Books with less than 5 units
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Inventory Value
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          <p className="text-xs text-muted-foreground">
            Based on current stock levels
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

