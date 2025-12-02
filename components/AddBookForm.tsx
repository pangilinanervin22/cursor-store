"use client";

import * as React from "react";
import { addBook, type AddBookInput } from "@/app/actions";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { UploadButton } from "@/lib/uploadthing";
import {
  Plus,
  ImagePlus,
  X,
  Minus,
  BookOpen,
  User,
  Hash,
  Tag,
  Package,
  Upload,
  AlertTriangle,
  BookPlus,
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

export function AddBookForm() {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [imagesToDelete, setImagesToDelete] = React.useState<string[]>([]);
  const [stock, setStock] = React.useState(10);
  const formRef = React.useRef<HTMLFormElement>(null);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      // Clean up any uploaded images that weren't used
      for (const url of imagesToDelete) {
        deleteUploadthingImage(url);
      }
      if (imageUrl) {
        // If dialog closed without submitting, delete the uploaded image
        deleteUploadthingImage(imageUrl);
      }
      setImageUrl(null);
      setError(null);
      setImagesToDelete([]);
      setStock(10);
    }
  }, [open]);

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

  function handleStockChange(delta: number) {
    setStock((prev) => Math.max(0, prev + delta));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data: AddBookInput = {
      title: formData.get("title") as string,
      author: formData.get("author") as string,
      isbn: formData.get("isbn") as string,
      price: parseFloat(formData.get("price") as string),
      stock: stock,
      genre: formData.get("genre") as string,
      imgUrl: imageUrl,
    };

    const result = await addBook(data);

    if (result.success) {
      // Delete any replaced images
      for (const urlToDelete of imagesToDelete) {
        if (urlToDelete !== imageUrl) {
          await deleteUploadthingImage(urlToDelete);
        }
      }
      formRef.current?.reset();
      setImageUrl(null);
      setImagesToDelete([]);
      setStock(10);
      setOpen(false);
    } else {
      setError(result.error || "Failed to add book");
    }

    setIsSubmitting(false);
  }

  // Handle cancel - clean up uploaded images
  const handleCancel = async () => {
    // Delete any uploaded images since we're canceling
    for (const url of imagesToDelete) {
      await deleteUploadthingImage(url);
    }
    if (imageUrl) {
      await deleteUploadthingImage(imageUrl);
    }
    setImageUrl(null);
    setImagesToDelete([]);
    setStock(10);
    setOpen(false);
  };

  const isLowStock = stock < 5;
  const isOutOfStock = stock === 0;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen && (imageUrl || imagesToDelete.length > 0)) {
        handleCancel();
      } else {
        setOpen(newOpen);
      }
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Book
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <BookPlus className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <DialogTitle className="text-xl">Add New Book</DialogTitle>
              <DialogDescription>
                Add a new book to your inventory
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
                <Label htmlFor="add-title" className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  Title
                </Label>
                <Input
                  id="add-title"
                  name="title"
                  placeholder="Enter book title"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-author" className="flex items-center gap-2 text-sm">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Author
                </Label>
                <Input
                  id="add-author"
                  name="author"
                  placeholder="Enter author name"
                  className="h-11"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="add-isbn" className="flex items-center gap-2 text-sm">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    ISBN
                  </Label>
                  <Input
                    id="add-isbn"
                    name="isbn"
                    placeholder="978-..."
                    className="font-mono text-sm h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-genre" className="flex items-center gap-2 text-sm">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                    Genre
                  </Label>
                  <select
                    id="add-genre"
                    name="genre"
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
                <Label htmlFor="add-price" className="flex items-center gap-2 text-sm">
                  Price (PHP)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₱
                  </span>
                  <Input
                    id="add-price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
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
                    Initial Stock
                  </Label>
                  {isLowStock && (
                    <Badge 
                      variant={isOutOfStock ? "destructive" : "warning"}
                      className="text-[10px] px-1.5"
                    >
                      {isOutOfStock ? "No Stock" : "Low Stock"}
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
              onClick={handleCancel}
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
                  Adding...
                </span>
              ) : (
                "Add Book"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
