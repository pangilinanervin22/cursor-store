"use server";

import { UTApi } from "uploadthing/server";
import { extractUploadthingKey } from "@/lib/utils";

const utapi = new UTApi();

export interface DeleteImageResult {
  success: boolean;
  error?: string;
}

/**
 * Deletes an image from Uploadthing storage
 * @param imageUrl - The full URL of the image to delete
 */
export async function deleteUploadthingImage(
  imageUrl: string | null | undefined
): Promise<DeleteImageResult> {
  if (!imageUrl) {
    return { success: true }; // Nothing to delete
  }

  const fileKey = extractUploadthingKey(imageUrl);

  if (!fileKey) {
    console.warn("Could not extract file key from URL:", imageUrl);
    return { success: false, error: "Invalid image URL" };
  }

  try {
    await utapi.deleteFiles(fileKey);
    console.log("Deleted Uploadthing file:", fileKey);
    return { success: true };
  } catch (error) {
    console.error("Error deleting Uploadthing file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete image",
    };
  }
}

/**
 * Deletes multiple images from Uploadthing storage
 * @param imageUrls - Array of full URLs of images to delete
 */
export async function deleteUploadthingImages(
  imageUrls: (string | null | undefined)[]
): Promise<DeleteImageResult> {
  const fileKeys = imageUrls
    .filter((url): url is string => !!url)
    .map(extractUploadthingKey)
    .filter((key): key is string => !!key);

  if (fileKeys.length === 0) {
    return { success: true }; // Nothing to delete
  }

  try {
    await utapi.deleteFiles(fileKeys);
    console.log("Deleted Uploadthing files:", fileKeys);
    return { success: true };
  } catch (error) {
    console.error("Error deleting Uploadthing files:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete images",
    };
  }
}

