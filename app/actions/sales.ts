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
export interface SaleWithItems {
  id: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: Date;
  items: SaleItemWithBook[];
}

export interface SaleItemWithBook {
  id: string;
  saleId: string;
  bookId: string;
  quantity: number;
  priceAtSale: number;
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    imgUrl: string | null;
  };
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  totalItemsSold: number;
  todaySales: number;
  todayRevenue: number;
}

/**
 * Fetches all sales with their items ordered by creation date (newest first)
 */
export async function getSales(): Promise<ActionResult<SaleWithItems[]>> {
  const ACTION = "getSales";
  log(ACTION, "Fetching all sales...");
  
  try {
    const sales = await prisma.sale.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                author: true,
                isbn: true,
                imgUrl: true,
              },
            },
          },
        },
      },
    });
    
    log(ACTION, "Sales fetched successfully", { count: sales.length });
    return { success: true, data: sales };
  } catch (error) {
    logError(ACTION, "Failed to fetch sales", error);
    return { success: false, error: "Failed to fetch sales" };
  }
}

/**
 * Fetches a single sale by ID
 */
export async function getSaleById(id: string): Promise<ActionResult<SaleWithItems>> {
  const ACTION = "getSaleById";
  log(ACTION, "Fetching sale by ID...", { saleId: id });
  
  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                author: true,
                isbn: true,
                imgUrl: true,
              },
            },
          },
        },
      },
    });

    if (!sale) {
      log(ACTION, "Sale not found", { saleId: id });
      return { success: false, error: "Sale not found" };
    }

    log(ACTION, "Sale fetched successfully", { saleId: id, itemCount: sale.items.length });
    return { success: true, data: sale };
  } catch (error) {
    logError(ACTION, "Failed to fetch sale", error);
    return { success: false, error: "Failed to fetch sale" };
  }
}

/**
 * Updates a sale item quantity
 * Note: This recalculates the total and adjusts stock accordingly
 */
export async function updateSaleItem(
  saleItemId: string,
  newQuantity: number
): Promise<ActionResult<SaleWithItems>> {
  const ACTION = "updateSaleItem";
  log(ACTION, "Updating sale item...", { saleItemId, newQuantity });
  
  if (newQuantity < 1) {
    log(ACTION, "Invalid quantity", { newQuantity });
    return { success: false, error: "Quantity must be at least 1" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get the current sale item
      const saleItem = await tx.saleItem.findUnique({
        where: { id: saleItemId },
        include: { sale: true },
      });

      if (!saleItem) {
        log(ACTION, "Sale item not found", { saleItemId });
        throw new Error("Sale item not found");
      }

      const quantityDiff = newQuantity - saleItem.quantity;
      log(ACTION, "Quantity difference calculated", { oldQty: saleItem.quantity, newQty: newQuantity, diff: quantityDiff });

      // Check if we have enough stock (if increasing quantity)
      if (quantityDiff > 0) {
        const book = await tx.book.findUnique({
          where: { id: saleItem.bookId },
        });

        if (!book || book.stock < quantityDiff) {
          log(ACTION, "Insufficient stock for update", { bookId: saleItem.bookId, available: book?.stock, needed: quantityDiff });
          throw new Error("Insufficient stock to increase quantity");
        }
      }

      // Update book stock
      await tx.book.update({
        where: { id: saleItem.bookId },
        data: { stock: { decrement: quantityDiff } },
      });
      log(ACTION, "Stock adjusted", { bookId: saleItem.bookId, adjustment: -quantityDiff });

      // Update the sale item
      await tx.saleItem.update({
        where: { id: saleItemId },
        data: { quantity: newQuantity },
      });

      // Recalculate sale total
      const allItems = await tx.saleItem.findMany({
        where: { saleId: saleItem.saleId },
      });

      const newTotal = allItems.reduce((sum, item) => {
        if (item.id === saleItemId) {
          return sum + item.priceAtSale * newQuantity;
        }
        return sum + item.priceAtSale * item.quantity;
      }, 0);

      // Update sale total
      const updatedSale = await tx.sale.update({
        where: { id: saleItem.saleId },
        data: { totalAmount: newTotal },
        include: {
          items: {
            include: {
              book: {
                select: {
                  id: true,
                  title: true,
                  author: true,
                  isbn: true,
                  imgUrl: true,
                },
              },
            },
          },
        },
      });

      log(ACTION, "Sale total recalculated", { saleId: saleItem.saleId, newTotal });
      return updatedSale;
    });

    revalidatePath("/sales");
    revalidatePath("/");
    log(ACTION, "Sale item updated successfully", { saleItemId, newQuantity });
    return { success: true, data: result };
  } catch (error) {
    logError(ACTION, "Failed to update sale item", error);
    const message = error instanceof Error ? error.message : "Failed to update sale item";
    return { success: false, error: message };
  }
}

/**
 * Removes an item from a sale
 * Returns stock to inventory
 */
export async function removeSaleItem(saleItemId: string): Promise<ActionResult<SaleWithItems | null>> {
  const ACTION = "removeSaleItem";
  log(ACTION, "Removing sale item...", { saleItemId });
  
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get the sale item
      const saleItem = await tx.saleItem.findUnique({
        where: { id: saleItemId },
        include: { sale: { include: { items: true } } },
      });

      if (!saleItem) {
        log(ACTION, "Sale item not found", { saleItemId });
        throw new Error("Sale item not found");
      }

      log(ACTION, "Found sale item", { saleId: saleItem.saleId, bookId: saleItem.bookId, quantity: saleItem.quantity });

      // Return stock to inventory
      await tx.book.update({
        where: { id: saleItem.bookId },
        data: { stock: { increment: saleItem.quantity } },
      });
      log(ACTION, "Stock returned to inventory", { bookId: saleItem.bookId, quantity: saleItem.quantity });

      // Delete the sale item
      await tx.saleItem.delete({
        where: { id: saleItemId },
      });

      // Check if this was the last item
      const remainingItems = await tx.saleItem.findMany({
        where: { saleId: saleItem.saleId },
      });

      if (remainingItems.length === 0) {
        // Delete the sale if no items remain
        await tx.sale.delete({
          where: { id: saleItem.saleId },
        });
        log(ACTION, "Sale deleted (no items remaining)", { saleId: saleItem.saleId });
        return null;
      }

      // Recalculate sale total
      const newTotal = remainingItems.reduce(
        (sum, item) => sum + item.priceAtSale * item.quantity,
        0
      );

      // Update sale total
      const updatedSale = await tx.sale.update({
        where: { id: saleItem.saleId },
        data: { totalAmount: newTotal },
        include: {
          items: {
            include: {
              book: {
                select: {
                  id: true,
                  title: true,
                  author: true,
                  isbn: true,
                  imgUrl: true,
                },
              },
            },
          },
        },
      });

      log(ACTION, "Sale total recalculated", { saleId: saleItem.saleId, newTotal, remainingItems: remainingItems.length });
      return updatedSale;
    });

    revalidatePath("/sales");
    revalidatePath("/");
    log(ACTION, "Sale item removed successfully", { saleItemId });
    return { success: true, data: result };
  } catch (error) {
    logError(ACTION, "Failed to remove sale item", error);
    const message = error instanceof Error ? error.message : "Failed to remove sale item";
    return { success: false, error: message };
  }
}

/**
 * Deletes an entire sale and returns all items to stock
 */
export async function deleteSale(saleId: string): Promise<ActionResult> {
  const ACTION = "deleteSale";
  log(ACTION, "Deleting sale...", { saleId });
  
  try {
    await prisma.$transaction(async (tx) => {
      // Get all sale items
      const saleItems = await tx.saleItem.findMany({
        where: { saleId },
      });

      log(ACTION, "Found sale items to process", { saleId, itemCount: saleItems.length });

      // Return stock for each item
      for (const item of saleItems) {
        await tx.book.update({
          where: { id: item.bookId },
          data: { stock: { increment: item.quantity } },
        });
        log(ACTION, "Stock returned", { bookId: item.bookId, quantity: item.quantity });
      }

      // Delete the sale (cascades to items)
      await tx.sale.delete({
        where: { id: saleId },
      });
    });

    revalidatePath("/sales");
    revalidatePath("/");
    log(ACTION, "Sale deleted successfully", { saleId });
    return { success: true };
  } catch (error) {
    logError(ACTION, "Failed to delete sale", error);
    return { success: false, error: "Failed to delete sale" };
  }
}

/**
 * Gets sales statistics
 */
export async function getSalesStats(): Promise<ActionResult<SalesStats>> {
  const ACTION = "getSalesStats";
  log(ACTION, "Fetching sales statistics...");
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [allSales, todaySalesData] = await Promise.all([
      prisma.sale.findMany({
        include: {
          items: true,
        },
      }),
      prisma.sale.findMany({
        where: {
          createdAt: {
            gte: today,
          },
        },
        include: {
          items: true,
        },
      }),
    ]);

    const totalSales = allSales.length;
    const totalRevenue = allSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalItemsSold = allSales.reduce(
      (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    const todaySales = todaySalesData.length;
    const todayRevenue = todaySalesData.reduce((sum, sale) => sum + sale.totalAmount, 0);

    log(ACTION, "Sales stats fetched successfully", { totalSales, totalRevenue, totalItemsSold, todaySales, todayRevenue });
    return {
      success: true,
      data: {
        totalSales,
        totalRevenue,
        totalItemsSold,
        todaySales,
        todayRevenue,
      },
    };
  } catch (error) {
    logError(ACTION, "Failed to fetch sales stats", error);
    return { success: false, error: "Failed to fetch sales statistics" };
  }
}
