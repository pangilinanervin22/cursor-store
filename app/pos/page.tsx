import { getBooksForPOS } from "@/app/actions/pos";
import { POSClient } from "@/components/pos/POSClient";
import { Navigation } from "@/components/Navigation";

export const dynamic = "force-dynamic";

export default async function POSPage() {
  const books = await getBooksForPOS();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <Navigation />

      {/* Main POS Interface */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <POSClient initialBooks={books} />
      </main>
    </div>
  );
}
