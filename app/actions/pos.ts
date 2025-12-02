"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Logger helper
function log(action: string, message: string, data?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` | ${JSON.stringify(data)}` : "";
  console.log(`[${timestamp}] [ACTION: ${action}] ${message}${dataStr}`);
}

function logError(action: string, message: string, error: unknown) {
  const timestamp = new Date().toISOString();
  const errorMsg = error instanceof Error ? error.message : String(error);
  console.error(`[${timestamp}] [ACTION: ${action}] ERROR: ${message} | ${errorMsg}`);
}

// Types
export interface CartItem {
  bookId: string;
  quantity: number;
}

export interface SaleResult {
  success: boolean;
  saleId?: string;
  error?: string;
}

export interface BookForPOS {
  id: string;
  title: string;
  author: string;
  isbn: string;
  price: number;
  stock: number;
  imgUrl: string | null;
}

/**
 * Fetches all books with stock > 0 for the POS system
 */
export async function getBooksForPOS(searchQuery?: string): Promise<BookForPOS[]> {
  const ACTION = "getBooksForPOS";
  log(ACTION, "Fetching books for POS...", { searchQuery: searchQuery || "(none)" });
  
  try {
    const books = await prisma.book.findMany({
      where: {
        stock: { gt: 0 },
        ...(searchQuery && searchQuery.trim() !== ""
          ? {
              OR: [
                { title: { contains: searchQuery, mode: "insensitive" } },
                { isbn: { contains: searchQuery, mode: "insensitive" } },
                { author: { contains: searchQuery, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        title: true,
        author: true,
        isbn: true,
        price: true,
        stock: true,
        imgUrl: true,
      },
      orderBy: { title: "asc" },
    });
    
    log(ACTION, "Books fetched successfully", { count: books.length });
    return books;
  } catch (error) {
    logError(ACTION, "Failed to fetch books for POS", error);
    return [];
  }
}

/**
 * Processes a sale transaction
 * - Validates stock availability
 * - Decrements stock for each book
 * - Creates Sale and SaleItem records
 */
export async function processSale(items: CartItem[]): Promise<SaleResult> {
  const ACTION = "processSale";
  log(ACTION, "Processing sale...", { itemCount: items.length, items: items.map(i => ({ bookId: i.bookId, qty: i.quantity })) });
  
  if (!items || items.length === 0) {
    log(ACTION, "Cart is empty");
    return { success: false, error: "Cart is empty" };
  }

  // Validate items
  for (const item of items) {
    if (!item.bookId || item.quantity < 1) {
      log(ACTION, "Invalid cart item detected", { item });
      return { success: false, error: "Invalid cart item" };
    }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Fetch all books and verify stock
      const bookIds = items.map((item) => item.bookId);
      const books = await tx.book.findMany({
        where: { id: { in: bookIds } },
        select: { id: true, title: true, price: true, stock: true },
      });

      log(ACTION, "Fetched books for sale", { bookCount: books.length });

      // Create a map for quick lookup
      const bookMap = new Map(books.map((book) => [book.id, book]));

      // Verify all books exist and have sufficient stock
      const saleItemsData: { bookId: string; quantity: number; priceAtSale: number }[] = [];
      let totalAmount = 0;

      for (const item of items) {
        const book = bookMap.get(item.bookId);

        if (!book) {
          log(ACTION, "Book not found", { bookId: item.bookId });
          throw new Error(`Book not found: ${item.bookId}`);
        }

        if (book.stock < item.quantity) {
          log(ACTION, "Insufficient stock", { bookId: item.bookId, title: book.title, requested: item.quantity, available: book.stock });
          throw new Error(
            `Insufficient stock for "${book.title}". Requested: ${item.quantity}, Available: ${book.stock}`
          );
        }

        const itemTotal = book.price * item.quantity;
        totalAmount += itemTotal;

        saleItemsData.push({
          bookId: item.bookId,
          quantity: item.quantity,
          priceAtSale: book.price,
        });
      }

      log(ACTION, "Stock validation passed", { totalAmount });

      // Step 2: Decrement stock for each book
      for (const item of items) {
        const book = bookMap.get(item.bookId);
        await tx.book.update({
          where: { id: item.bookId },
          data: { stock: { decrement: item.quantity } },
        });
        log(ACTION, "Stock decremented", { bookId: item.bookId, title: book?.title, decrementBy: item.quantity });
      }

      // Step 3 & 4: Create Sale with nested SaleItems
      const sale = await tx.sale.create({
        data: {
          totalAmount,
          paymentMethod: "CASH",
          items: {
            create: saleItemsData,
          },
        },
      });

      log(ACTION, "Sale record created", { saleId: sale.id, totalAmount: sale.totalAmount });
      return sale;
    });

    // Step 5 & 6: Revalidate and return
    revalidatePath("/");
    revalidatePath("/pos");

    log(ACTION, "Sale processed successfully", { saleId: result.id, totalAmount: result.totalAmount });
    return { success: true, saleId: result.id };
  } catch (error) {
    logError(ACTION, "Failed to process sale", error);
    const message = error instanceof Error ? error.message : "Failed to process sale";
    return { success: false, error: message };
  }
}

/**
 * Get recent sales for display
 */
export async function getRecentSales(limit: number = 10) {
  const ACTION = "getRecentSales";
  log(ACTION, "Fetching recent sales...", { limit });
  
  try {
    const sales = await prisma.sale.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            book: {
              select: { title: true },
            },
          },
        },
      },
    });
    
    log(ACTION, "Recent sales fetched successfully", { count: sales.length });
    return sales;
  } catch (error) {
    logError(ACTION, "Failed to fetch recent sales", error);
    return [];
  }
}
