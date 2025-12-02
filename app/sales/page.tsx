import { getSales, getSalesStats } from "@/app/actions/sales";
import { getCurrentUser } from "@/app/actions/auth";
import { Navigation } from "@/components/Navigation";
import { SalesTable } from "@/components/sales/SalesTable";
import { SalesStatsCards } from "@/components/sales/SalesStatsCards";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function SalesHistoryPage() {
  const [salesResult, statsResult, user] = await Promise.all([
    getSales(),
    getSalesStats(),
    getCurrentUser(),
  ]);

  const sales = salesResult.success ? salesResult.data ?? [] : [];
  const stats = statsResult.success
    ? statsResult.data ?? {
        totalSales: 0,
        totalRevenue: 0,
        totalItemsSold: 0,
        todaySales: 0,
        todayRevenue: 0,
      }
    : {
        totalSales: 0,
        totalRevenue: 0,
        totalItemsSold: 0,
        todaySales: 0,
        todayRevenue: 0,
      };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation username={user?.username} />

      {/* Sub Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Sales History</h2>
            <p className="text-sm text-muted-foreground">
              View and manage all sales transactions
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Stats Cards */}
          <section>
            <SalesStatsCards
              totalSales={stats.totalSales}
              totalRevenue={stats.totalRevenue}
              totalItemsSold={stats.totalItemsSold}
              todaySales={stats.todaySales}
              todayRevenue={stats.todayRevenue}
            />
          </section>

          {/* Sales Table */}
          <section>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">All Transactions</h3>
              <p className="text-sm text-muted-foreground">
                {sales.length} sales recorded
              </p>
            </div>
            <SalesTable sales={sales} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
