"use client";

import * as React from "react";
import { updateBook, type Book, type UpdateBookInput } from "@/app/actions";
import { deleteUploadthingImage } from "@/app/actions/uploadthing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadButton } from "@/lib/uploadthing";
import {
  Pencil,
  ImagePlus,
  X,
  Minus,
  Plus,
  BookOpen,
  User,
  Hash,
  Tag,
  Package,
  Upload,
  AlertTriangle,
} from "lucide-react";

const GENRES = [
  "Classic Fiction",
  "Science Fiction",
  "Fantasy",
  "Mystery",
  "Romance",
  "Thriller",
  "Horror",
  "Non-Fiction",
  "Biography",
  "History",
  "Technology",
  "Self-Help",
  "Coming-of-Age",
  "Dystopian",
  "Other",
];

interface EditBookDialogProps {
  book: Book;
  trigger?: React.ReactNode;
}

export function EditBookDialog({ book, trigger }: EditBookDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [imageUrl, setImageUrl] = React.useState<string | null>(book.imgUrl);
  const [originalImageUrl] = React.useState<string | null>(book.imgUrl);
  const [imagesToDelete, setImagesToDelete] = React.useState<string[]>([]);
  const [stock, setStock] = React.useState(book.stock);
  const formRef = React.useRef<HTMLFormElement>(null);

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setImageUrl(book.imgUrl);
      setStock(book.stock);
      setError(null);
      setImagesToDelete([]);
    }
  }, [open, book.imgUrl, book.stock]);

  // Handle image removal - queue for deletion
  const handleRemoveImage = () => {
    if (imageUrl) {
      setImagesToDelete((prev) => [...prev, imageUrl]);
    }
    setImageUrl(null);
  };

  // Handle new image upload - queue old one for deletion
  const handleImageUpload = (url: string) => {
    if (imageUrl && imageUrl !== url) {
      setImagesToDelete((prev) => [...prev, imageUrl]);
    }
    setImageUrl(url);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data: UpdateBookInput = {
      title: formData.get("title") as string,
      author: formData.get("author") as string,
      isbn: formData.get("isbn") as string,
      price: parseFloat(formData.get("price") as string),
      stock: stock,
      genre: formData.get("genre") as string,
      imgUrl: imageUrl,
    };

    const result = await updateBook(book.id, data);

    if (result.success) {
      // Delete queued images from Uploadthing
      for (const urlToDelete of imagesToDelete) {
        // Don't delete if it's the current image (user might have re-added it)
        if (urlToDelete !== imageUrl) {
          await deleteUploadthingImage(urlToDelete);
        }
      }
      setOpen(false);
    } else {
      setError(result.error || "Failed to update book");
    }

    setIsSubmitting(false);
  }

  function handleStockChange(delta: number) {
    setStock((prev) => Math.max(0, prev + delta));
  }

  const isLowStock = stock < 5;
  const isOutOfStock = stock === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setOpen(true)}
          title="Edit book"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Pencil className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Edit Book</DialogTitle>
              <DialogDescription>
                Update book details and manage inventory
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 pt-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Two Column Layout: Image + Basic Info */}
          <div className="flex gap-6">
            {/* Left: Book Cover */}
            <div className="shrink-0">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                Book Cover
              </Label>
              <div className="relative group">
                {imageUrl ? (
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt="Book cover"
                      className="h-44 w-32 rounded-lg object-cover border-2 border-border shadow-md"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 shadow-md transition-transform hover:scale-110"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-44 w-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center bg-muted/30 gap-2">
                    <ImagePlus className="h-8 w-8 text-muted-foreground/50" />
                    <span className="text-xs text-muted-foreground">No cover</span>
                  </div>
                )}
              </div>
              <div className="mt-3">
                <UploadButton
                  endpoint="bookImageUploader"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]?.url) {
                      handleImageUpload(res[0].url);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    setError(`Upload failed: ${error.message}`);
                  }}
                  appearance={{
                    button:
                      "bg-secondary text-secondary-foreground hover:bg-secondary/80 ut-uploading:bg-secondary/50 text-xs h-8 w-32",
                    allowedContent: "hidden",
                  }}
                  content={{
                    button({ ready, isUploading }) {
                      if (isUploading) return "Uploading...";
                      if (ready) return (
                        <span className="flex items-center gap-1.5">
                          <Upload className="h-3 w-3" />
                          Upload
                        </span>
                      );
                      return "Loading...";
                    },
                  }}
                />
              </div>
            </div>

            {/* Right: Title & Author */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  Title
                </Label>
                <Input
                  id="edit-title"
                  name="title"
                  defaultValue={book.title}
                  placeholder="Enter book title"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-author" className="flex items-center gap-2 text-sm">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Author
                </Label>
                <Input
                  id="edit-author"
                  name="author"
                  defaultValue={book.author}
                  placeholder="Enter author name"
                  className="h-11"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-isbn" className="flex items-center gap-2 text-sm">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    ISBN
                  </Label>
                  <Input
                    id="edit-isbn"
                    name="isbn"
                    defaultValue={book.isbn}
                    placeholder="978-..."
                    className="font-mono text-sm h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-genre" className="flex items-center gap-2 text-sm">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                    Genre
                  </Label>
                  <select
                    id="edit-genre"
                    name="genre"
                    defaultValue={book.genre}
                    required
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select...</option>
                    {GENRES.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory Section */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              Pricing & Inventory
            </h4>

            <div className="grid grid-cols-2 gap-6">
              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="edit-price" className="flex items-center gap-2 text-sm">
                  Price (PHP)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₱
                  </span>
                  <Input
                    id="edit-price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={book.price}
                    className="pl-7 h-11 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-sm">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    Stock Quantity
                  </Label>
                  {isLowStock && (
                    <Badge 
                      variant={isOutOfStock ? "destructive" : "warning"}
                      className="text-[10px] px-1.5"
                    >
                      {isOutOfStock ? "Out of Stock" : "Low Stock"}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={`h-11 w-11 shrink-0 ${isOutOfStock ? 'opacity-50' : ''}`}
                    onClick={() => handleStockChange(-1)}
                    disabled={isOutOfStock}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
                      className={`text-center h-11 font-bold text-lg ${
                        isOutOfStock 
                          ? 'text-destructive border-destructive/50' 
                          : isLowStock 
                            ? 'text-yellow-500 border-yellow-500/50' 
                            : ''
                      }`}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 shrink-0"
                    onClick={() => handleStockChange(1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <button
                    type="button"
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleStockChange(5)}
                  >
                    +5
                  </button>
                  <button
                    type="button"
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleStockChange(10)}
                  >
                    +10
                  </button>
                  <button
                    type="button"
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleStockChange(25)}
                  >
                    +25
                  </button>
                  <span className="text-border">|</span>
                  <button
                    type="button"
                    className="hover:text-foreground transition-colors"
                    onClick={() => setStock(0)}
                  >
                    Reset to 0
                  </button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 sm:flex-none min-w-[140px]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
