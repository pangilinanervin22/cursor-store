"use client";

import * as React from "react";
import { deleteBook, type Book } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteBookDialogProps {
  book: Book;
  trigger?: React.ReactNode;
}

export function DeleteBookDialog({ book, trigger }: DeleteBookDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    const result = await deleteBook(book.id);

    if (result.success) {
      setOpen(false);
    } else {
      setError(result.error || "Failed to delete book");
    }

    setIsDeleting(false);
  }

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
      <DialogContent className="sm:max-w-[425px]">
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

          <p className="text-sm text-muted-foreground mt-4">
            Are you sure you want to permanently delete &quot;{book.title}&quot; from your
            inventory? This will remove all associated data.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Book"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

