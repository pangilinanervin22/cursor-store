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
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  price: number;
  stock: number;
  genre: string;
  imgUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddBookInput {
  title: string;
  author: string;
  isbn: string;
  price: number;
  stock: number;
  genre: string;
  imgUrl?: string | null;
}

export interface UpdateBookInput {
  title: string;
  author: string;
  isbn: string;
  price: number;
  stock: number;
  genre: string;
  imgUrl?: string | null;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  salesCount?: number;
}

// Validation helpers
function validateBookInput(data: AddBookInput | UpdateBookInput): string | null {
  if (!data.title || data.title.trim().length === 0) {
    return "Title is required";
  }
  if (!data.author || data.author.trim().length === 0) {
    return "Author is required";
  }
  if (!data.isbn || data.isbn.trim().length === 0) {
    return "ISBN is required";
  }
  if (typeof data.price !== "number" || data.price < 0) {
    return "Price must be a positive number";
  }
  if (typeof data.stock !== "number" || data.stock < 0 || !Number.isInteger(data.stock)) {
    return "Stock must be a non-negative integer";
  }
  if (!data.genre || data.genre.trim().length === 0) {
    return "Genre is required";
  }
  return null;
}

/**
 * Fetches all books ordered by creation date (newest first)
 */
export async function getBooks(): Promise<ActionResult<Book[]>> {
  const ACTION = "getBooks";
  log(ACTION, "Fetching all books...");
  
  try {
    const books = await prisma.book.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    log(ACTION, "Successfully fetched books", { count: books.length });
    return { success: true, data: books };
  } catch (error) {
    logError(ACTION, "Failed to fetch books", error);
    return { success: false, error: "Failed to fetch books" };
  }
}

/**
 * Adds a new book to the inventory
 */
export async function addBook(data: AddBookInput): Promise<ActionResult<Book>> {
  const ACTION = "addBook";
  log(ACTION, "Adding new book...", { title: data.title, isbn: data.isbn, author: data.author });
  
  const validationError = validateBookInput(data);
  if (validationError) {
    log(ACTION, "Validation failed", { error: validationError });
    return { success: false, error: validationError };
  }

  try {
    // Check if ISBN already exists
    const existingBook = await prisma.book.findUnique({
      where: { isbn: data.isbn.trim() },
    });

    if (existingBook) {
      log(ACTION, "ISBN already exists", { isbn: data.isbn });
      return { success: false, error: "A book with this ISBN already exists" };
    }

    const book = await prisma.book.create({
      data: {
        title: data.title.trim(),
        author: data.author.trim(),
        isbn: data.isbn.trim(),
        price: data.price,
        stock: data.stock,
        genre: data.genre.trim(),
        imgUrl: data.imgUrl || null,
      },
    });

    log(ACTION, "Book added successfully", { id: book.id, title: book.title });
    revalidatePath("/");
    return { success: true, data: book };
  } catch (error) {
    logError(ACTION, "Failed to add book", error);
    return { success: false, error: "Failed to add book" };
  }
}

/**
 * Updates a book in the inventory
 */
export async function updateBook(
  id: string,
  data: UpdateBookInput
): Promise<ActionResult<Book>> {
  const ACTION = "updateBook";
  log(ACTION, "Updating book...", { id, title: data.title });
  
  if (!id || id.trim().length === 0) {
    log(ACTION, "Missing book ID");
    return { success: false, error: "Book ID is required" };
  }

  const validationError = validateBookInput(data);
  if (validationError) {
    log(ACTION, "Validation failed", { error: validationError });
    return { success: false, error: validationError };
  }

  try {
    // Check if ISBN already exists on another book
    const existingBook = await prisma.book.findFirst({
      where: {
        isbn: data.isbn.trim(),
        NOT: { id },
      },
    });

    if (existingBook) {
      log(ACTION, "ISBN already exists on another book", { isbn: data.isbn });
      return { success: false, error: "A book with this ISBN already exists" };
    }

    const book = await prisma.book.update({
      where: { id },
      data: {
        title: data.title.trim(),
        author: data.author.trim(),
        isbn: data.isbn.trim(),
        price: data.price,
        stock: data.stock,
        genre: data.genre.trim(),
        imgUrl: data.imgUrl ?? undefined,
      },
    });

    log(ACTION, "Book updated successfully", { id: book.id, title: book.title });
    revalidatePath("/");
    return { success: true, data: book };
  } catch (error) {
    logError(ACTION, "Failed to update book", error);
    return { success: false, error: "Failed to update book" };
  }
}

/**
 * Updates the stock count for a specific book
 */
export async function updateStock(
  id: string,
  newStock: number
): Promise<ActionResult<Book>> {
  const ACTION = "updateStock";
  log(ACTION, "Updating stock...", { bookId: id, newStock });
  
  if (!id || id.trim().length === 0) {
    log(ACTION, "Missing book ID");
    return { success: false, error: "Book ID is required" };
  }

  if (typeof newStock !== "number" || newStock < 0 || !Number.isInteger(newStock)) {
    log(ACTION, "Invalid stock value", { newStock });
    return { success: false, error: "Stock must be a non-negative integer" };
  }

  try {
    const book = await prisma.book.update({
      where: { id },
      data: { stock: newStock },
    });

    log(ACTION, "Stock updated successfully", { bookId: book.id, title: book.title, newStock: book.stock });
    revalidatePath("/");
    return { success: true, data: book };
  } catch (error) {
    logError(ACTION, "Failed to update stock", error);
    return { success: false, error: "Failed to update stock" };
  }
}

/**
 * Checks if a book has associated sales
 */
export async function checkBookSales(bookId: string): Promise<{ hasSales: boolean; salesCount: number }> {
  const ACTION = "checkBookSales";
  log(ACTION, "Checking sales for book...", { bookId });
  
  const salesCount = await prisma.saleItem.count({
    where: { bookId },
  });
  
  log(ACTION, "Sales check complete", { bookId, salesCount, hasSales: salesCount > 0 });
  return { hasSales: salesCount > 0, salesCount };
}

/**
 * Deletes a book from the inventory
 * Will fail if the book has associated sales records
 */
export async function deleteBook(id: string): Promise<ActionResult> {
  const ACTION = "deleteBook";
  log(ACTION, "Attempting to delete book...", { bookId: id });
  
  if (!id || id.trim().length === 0) {
    log(ACTION, "Missing book ID");
    return { success: false, error: "Book ID is required" };
  }

  try {
    // Check if book has any sales records
    const salesCount = await prisma.saleItem.count({
      where: { bookId: id },
    });

    if (salesCount > 0) {
      log(ACTION, "Cannot delete - book has sales records", { bookId: id, salesCount });
      return {
        success: false,
        error: `Cannot delete this book because it has ${salesCount} sale record(s). Please delete the associated sales from the Sales History first.`,
        salesCount,
      };
    }

    // Get book info for logging before deletion
    const book = await prisma.book.findUnique({ where: { id } });
    
    await prisma.book.delete({
      where: { id },
    });

    log(ACTION, "Book deleted successfully", { bookId: id, title: book?.title });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    logError(ACTION, "Failed to delete book", error);
    return { success: false, error: "Failed to delete book" };
  }
}

/**
 * Force deletes a book and all associated sales records
 * Use with caution - this will delete sales history
 */
export async function forceDeleteBook(id: string): Promise<ActionResult> {
  const ACTION = "forceDeleteBook";
  log(ACTION, "Force deleting book and associated records...", { bookId: id });
  
  if (!id || id.trim().length === 0) {
    log(ACTION, "Missing book ID");
    return { success: false, error: "Book ID is required" };
  }

  try {
    // Get book info before deletion
    const book = await prisma.book.findUnique({ where: { id } });
    
    await prisma.$transaction(async (tx) => {
      // Get all sales that contain this book
      const saleItems = await tx.saleItem.findMany({
        where: { bookId: id },
        select: { saleId: true, quantity: true, priceAtSale: true },
      });

      log(ACTION, "Found sale items to process", { bookId: id, itemCount: saleItems.length });

      // Group by saleId
      const salesAffected = Array.from(new Set(saleItems.map((item) => item.saleId)));

      // Delete all sale items for this book
      await tx.saleItem.deleteMany({
        where: { bookId: id },
      });
      log(ACTION, "Deleted sale items", { count: saleItems.length });

      // For each affected sale, recalculate total or delete if empty
      let salesDeleted = 0;
      let salesUpdated = 0;
      
      for (const saleId of salesAffected) {
        const remainingItems = await tx.saleItem.findMany({
          where: { saleId },
        });

        if (remainingItems.length === 0) {
          // Delete the sale if no items remain
          await tx.sale.delete({
            where: { id: saleId },
          });
          salesDeleted++;
        } else {
          // Recalculate total
          const newTotal = remainingItems.reduce(
            (sum, item) => sum + item.priceAtSale * item.quantity,
            0
          );
          await tx.sale.update({
            where: { id: saleId },
            data: { totalAmount: newTotal },
          });
          salesUpdated++;
        }
      }
      
      log(ACTION, "Processed affected sales", { salesDeleted, salesUpdated });

      // Now delete the book
      await tx.book.delete({
        where: { id },
      });
    });

    log(ACTION, "Book force deleted successfully", { bookId: id, title: book?.title });
    revalidatePath("/");
    revalidatePath("/sales");
    return { success: true };
  } catch (error) {
    logError(ACTION, "Failed to force delete book", error);
    return { success: false, error: "Failed to delete book and associated records" };
  }
}

/**
 * Gets inventory statistics
 */
export async function getInventoryStats(): Promise<
  ActionResult<{ totalBooks: number; lowStockCount: number; totalValue: number }>
> {
  const ACTION = "getInventoryStats";
  log(ACTION, "Fetching inventory statistics...");
  
  try {
    const [totalBooks, lowStockBooks, allBooks] = await Promise.all([
      prisma.book.count(),
      prisma.book.count({
        where: {
          stock: {
            lt: 5,
          },
        },
      }),
      prisma.book.findMany({
        select: {
          price: true,
          stock: true,
        },
      }),
    ]);

    const totalValue = allBooks.reduce(
      (sum, book) => sum + book.price * book.stock,
      0
    );

    log(ACTION, "Inventory stats fetched successfully", { totalBooks, lowStockCount: lowStockBooks, totalValue });
    return {
      success: true,
      data: {
        totalBooks,
        lowStockCount: lowStockBooks,
        totalValue,
      },
    };
  } catch (error) {
    logError(ACTION, "Failed to fetch inventory stats", error);
    return { success: false, error: "Failed to fetch inventory statistics" };
  }
}
