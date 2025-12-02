import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Receipt, TrendingUp, Package, CalendarDays } from "lucide-react";

interface SalesStatsCardsProps {
  totalSales: number;
  totalRevenue: number;
  totalItemsSold: number;
  todaySales: number;
  todayRevenue: number;
}

export function SalesStatsCards({
  totalSales,
  totalRevenue,
  totalItemsSold,
  todaySales,
  todayRevenue,
}: SalesStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSales}</div>
          <p className="text-xs text-muted-foreground">
            All time transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-500">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Lifetime earnings
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItemsSold}</div>
          <p className="text-xs text-muted-foreground">
            Total units sold
          </p>
        </CardContent>
      </Card>

      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today&apos;s Sales</CardTitle>
          <CalendarDays className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todaySales}</div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(todayRevenue)} revenue today
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

