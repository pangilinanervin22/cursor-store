"use client";

import * as React from "react";
import { deleteBook, forceDeleteBook, checkBookSales, type Book } from "@/app/actions";
import { deleteUploadthingImage } from "@/app/actions/uploadthing";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, AlertTriangle, Receipt, ExternalLink } from "lucide-react";
import Link from "next/link";

interface DeleteBookDialogProps {
  book: Book;
  trigger?: React.ReactNode;
}

export function DeleteBookDialog({ book, trigger }: DeleteBookDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [salesCount, setSalesCount] = React.useState<number | null>(null);
  const [showForceDelete, setShowForceDelete] = React.useState(false);

  // Check for sales when dialog opens
  React.useEffect(() => {
    if (open) {
      setError(null);
      setShowForceDelete(false);
      checkBookSales(book.id).then(({ salesCount }) => {
        setSalesCount(salesCount);
      });
    }
  }, [open, book.id]);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    const result = await deleteBook(book.id);

    if (result.success) {
      // If book deletion was successful, delete the image from Uploadthing
      if (book.imgUrl) {
        await deleteUploadthingImage(book.imgUrl);
      }
      setOpen(false);
    } else {
      setError(result.error || "Failed to delete book");
      if (result.salesCount && result.salesCount > 0) {
        setShowForceDelete(true);
      }
    }

    setIsDeleting(false);
  }

  async function handleForceDelete() {
    setIsDeleting(true);
    setError(null);

    const result = await forceDeleteBook(book.id);

    if (result.success) {
      // If book deletion was successful, delete the image from Uploadthing
      if (book.imgUrl) {
        await deleteUploadthingImage(book.imgUrl);
      }
      setOpen(false);
    } else {
      setError(result.error || "Failed to delete book");
    }

    setIsDeleting(false);
  }

  const hasSales = salesCount !== null && salesCount > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => setOpen(true)}
          title="Delete book"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete Book</DialogTitle>
              <DialogDescription>
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive mb-4">
              {error}
            </div>
          )}

          {/* Sales Warning */}
          {hasSales && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 mb-4">
              <div className="flex items-start gap-3">
                <Receipt className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-500">
                    This book has sales history
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    This book appears in {salesCount} sale record(s). You can either:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>Delete the related sales first from Sales History</li>
                    <li>Force delete (removes book from all sales records)</li>
                  </ul>
                  <Link
                    href="/sales"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                    onClick={() => setOpen(false)}
                  >
                    Go to Sales History
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border p-4 bg-muted/50">
            <div className="flex gap-4">
              {book.imgUrl && (
                <img
                  src={book.imgUrl}
                  alt={book.title}
                  className="h-20 w-14 rounded object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{book.title}</h4>
                <p className="text-sm text-muted-foreground">{book.author}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ISBN: {book.isbn}
                </p>
                <p className="text-xs text-muted-foreground">
                  Stock: {book.stock} units
                </p>
              </div>
            </div>
          </div>

          {!hasSales && (
            <p className="text-sm text-muted-foreground mt-4">
              Are you sure you want to permanently delete &quot;{book.title}&quot; from your
              inventory? This will remove all associated data{book.imgUrl ? " and the cover image" : ""}.
            </p>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
            className="sm:flex-1"
          >
            Cancel
          </Button>
          
          {showForceDelete && hasSales ? (
            <Button
              type="button"
              variant="destructive"
              onClick={handleForceDelete}
              disabled={isDeleting}
              className="sm:flex-1"
            >
              {isDeleting ? "Deleting..." : "Force Delete (Remove from Sales)"}
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="sm:flex-1"
            >
              {isDeleting ? "Deleting..." : hasSales ? "Try Delete" : "Delete Book"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
