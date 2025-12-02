import { getBooksForPOS } from "@/app/actions/pos";
import { getCurrentUser } from "@/app/actions/auth";
import { POSClient } from "@/components/pos/POSClient";
import { Navigation } from "@/components/Navigation";

export const dynamic = "force-dynamic";

export default async function POSPage() {
  const [books, user] = await Promise.all([
    getBooksForPOS(),
    getCurrentUser(),
  ]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <Navigation username={user?.username} />

      {/* Main POS Interface */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <POSClient initialBooks={books} />
      </main>
    </div>
  );
}
