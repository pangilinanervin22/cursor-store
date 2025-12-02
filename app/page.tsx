import { getBooks, getInventoryStats } from "@/app/actions";
import { getCurrentUser } from "@/app/actions/auth";
import { AddBookForm } from "@/components/AddBookForm";
import { BookTable } from "@/components/BookTable";
import { StatsCards } from "@/components/StatsCards";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default async function DashboardPage() {
  const [booksResult, statsResult, user] = await Promise.all([
    getBooks(),
    getInventoryStats(),
    getCurrentUser(),
  ]);

  const books = booksResult.success ? booksResult.data ?? [] : [];
  const stats = statsResult.success
    ? statsResult.data ?? { totalBooks: 0, lowStockCount: 0, totalValue: 0 }
    : { totalBooks: 0, lowStockCount: 0, totalValue: 0 };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation username={user?.username} />

      {/* Sub Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Inventory Management
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your book collection and stock levels
              </p>
            </div>
            <AddBookForm />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Stats Cards */}
          <section>
            <StatsCards
              totalBooks={stats.totalBooks}
              lowStockCount={stats.lowStockCount}
              totalValue={stats.totalValue}
            />
          </section>

          {/* Books Table */}
          <section>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">All Books</h3>
              <p className="text-sm text-muted-foreground">
                {books.length} books in your inventory
              </p>
            </div>
            <BookTable books={books} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
