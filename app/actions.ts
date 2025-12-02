"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
  try {
    const books = await prisma.book.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: books };
  } catch (error) {
    console.error("Error fetching books:", error);
    return { success: false, error: "Failed to fetch books" };
  }
}

/**
 * Adds a new book to the inventory
 */
export async function addBook(data: AddBookInput): Promise<ActionResult<Book>> {
  const validationError = validateBookInput(data);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    // Check if ISBN already exists
    const existingBook = await prisma.book.findUnique({
      where: { isbn: data.isbn.trim() },
    });

    if (existingBook) {
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

    revalidatePath("/");
    return { success: true, data: book };
  } catch (error) {
    console.error("Error adding book:", error);
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
  if (!id || id.trim().length === 0) {
    return { success: false, error: "Book ID is required" };
  }

  const validationError = validateBookInput(data);
  if (validationError) {
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

    revalidatePath("/");
    return { success: true, data: book };
  } catch (error) {
    console.error("Error updating book:", error);
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
  if (!id || id.trim().length === 0) {
    return { success: false, error: "Book ID is required" };
  }

  if (typeof newStock !== "number" || newStock < 0 || !Number.isInteger(newStock)) {
    return { success: false, error: "Stock must be a non-negative integer" };
  }

  try {
    const book = await prisma.book.update({
      where: { id },
      data: { stock: newStock },
    });

    revalidatePath("/");
    return { success: true, data: book };
  } catch (error) {
    console.error("Error updating stock:", error);
    return { success: false, error: "Failed to update stock" };
  }
}

/**
 * Checks if a book has associated sales
 */
export async function checkBookSales(bookId: string): Promise<{ hasSales: boolean; salesCount: number }> {
  const salesCount = await prisma.saleItem.count({
    where: { bookId },
  });
  return { hasSales: salesCount > 0, salesCount };
}

/**
 * Deletes a book from the inventory
 * Will fail if the book has associated sales records
 */
export async function deleteBook(id: string): Promise<ActionResult> {
  if (!id || id.trim().length === 0) {
    return { success: false, error: "Book ID is required" };
  }

  try {
    // Check if book has any sales records
    const salesCount = await prisma.saleItem.count({
      where: { bookId: id },
    });

    if (salesCount > 0) {
      return {
        success: false,
        error: `Cannot delete this book because it has ${salesCount} sale record(s). Please delete the associated sales from the Sales History first.`,
        salesCount,
      };
    }

    await prisma.book.delete({
      where: { id },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting book:", error);
    return { success: false, error: "Failed to delete book" };
  }
}

/**
 * Force deletes a book and all associated sales records
 * Use with caution - this will delete sales history
 */
export async function forceDeleteBook(id: string): Promise<ActionResult> {
  if (!id || id.trim().length === 0) {
    return { success: false, error: "Book ID is required" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Get all sales that contain this book
      const saleItems = await tx.saleItem.findMany({
        where: { bookId: id },
        select: { saleId: true, quantity: true, priceAtSale: true },
      });

      // Group by saleId
      const salesAffected = Array.from(new Set(saleItems.map((item) => item.saleId)));

      // Delete all sale items for this book
      await tx.saleItem.deleteMany({
        where: { bookId: id },
      });

      // For each affected sale, recalculate total or delete if empty
      for (const saleId of salesAffected) {
        const remainingItems = await tx.saleItem.findMany({
          where: { saleId },
        });

        if (remainingItems.length === 0) {
          // Delete the sale if no items remain
          await tx.sale.delete({
            where: { id: saleId },
          });
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
        }
      }

      // Now delete the book
      await tx.book.delete({
        where: { id },
      });
    });

    revalidatePath("/");
    revalidatePath("/sales");
    return { success: true };
  } catch (error) {
    console.error("Error force deleting book:", error);
    return { success: false, error: "Failed to delete book and associated records" };
  }
}

/**
 * Gets inventory statistics
 */
export async function getInventoryStats(): Promise<
  ActionResult<{ totalBooks: number; lowStockCount: number; totalValue: number }>
> {
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

    return {
      success: true,
      data: {
        totalBooks,
        lowStockCount: lowStockBooks,
        totalValue,
      },
    };
  } catch (error) {
    console.error("Error fetching inventory stats:", error);
    return { success: false, error: "Failed to fetch inventory statistics" };
  }
}
