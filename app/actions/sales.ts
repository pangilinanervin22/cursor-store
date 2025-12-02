"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
    return { success: true, data: sales };
  } catch (error) {
    console.error("Error fetching sales:", error);
    return { success: false, error: "Failed to fetch sales" };
  }
}

/**
 * Fetches a single sale by ID
 */
export async function getSaleById(id: string): Promise<ActionResult<SaleWithItems>> {
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
      return { success: false, error: "Sale not found" };
    }

    return { success: true, data: sale };
  } catch (error) {
    console.error("Error fetching sale:", error);
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
  if (newQuantity < 1) {
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
        throw new Error("Sale item not found");
      }

      const quantityDiff = newQuantity - saleItem.quantity;

      // Check if we have enough stock (if increasing quantity)
      if (quantityDiff > 0) {
        const book = await tx.book.findUnique({
          where: { id: saleItem.bookId },
        });

        if (!book || book.stock < quantityDiff) {
          throw new Error("Insufficient stock to increase quantity");
        }
      }

      // Update book stock
      await tx.book.update({
        where: { id: saleItem.bookId },
        data: { stock: { decrement: quantityDiff } },
      });

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

      return updatedSale;
    });

    revalidatePath("/sales");
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating sale item:", error);
    const message = error instanceof Error ? error.message : "Failed to update sale item";
    return { success: false, error: message };
  }
}

/**
 * Removes an item from a sale
 * Returns stock to inventory
 */
export async function removeSaleItem(saleItemId: string): Promise<ActionResult<SaleWithItems | null>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get the sale item
      const saleItem = await tx.saleItem.findUnique({
        where: { id: saleItemId },
        include: { sale: { include: { items: true } } },
      });

      if (!saleItem) {
        throw new Error("Sale item not found");
      }

      // Return stock to inventory
      await tx.book.update({
        where: { id: saleItem.bookId },
        data: { stock: { increment: saleItem.quantity } },
      });

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

      return updatedSale;
    });

    revalidatePath("/sales");
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error removing sale item:", error);
    const message = error instanceof Error ? error.message : "Failed to remove sale item";
    return { success: false, error: message };
  }
}

/**
 * Deletes an entire sale and returns all items to stock
 */
export async function deleteSale(saleId: string): Promise<ActionResult> {
  try {
    await prisma.$transaction(async (tx) => {
      // Get all sale items
      const saleItems = await tx.saleItem.findMany({
        where: { saleId },
      });

      // Return stock for each item
      for (const item of saleItems) {
        await tx.book.update({
          where: { id: item.bookId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // Delete the sale (cascades to items)
      await tx.sale.delete({
        where: { id: saleId },
      });
    });

    revalidatePath("/sales");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting sale:", error);
    return { success: false, error: "Failed to delete sale" };
  }
}

/**
 * Gets sales statistics
 */
export async function getSalesStats(): Promise<ActionResult<SalesStats>> {
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
    console.error("Error fetching sales stats:", error);
    return { success: false, error: "Failed to fetch sales statistics" };
  }
}

