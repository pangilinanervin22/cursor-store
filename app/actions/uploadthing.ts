"use server";

import { UTApi } from "uploadthing/server";
import { extractUploadthingKey } from "@/lib/utils";

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
  const ACTION = "deleteUploadthingImage";
  
  if (!imageUrl) {
    log(ACTION, "No image URL provided, nothing to delete");
    return { success: true }; // Nothing to delete
  }

  const fileKey = extractUploadthingKey(imageUrl);

  if (!fileKey) {
    log(ACTION, "Could not extract file key from URL", { imageUrl });
    return { success: false, error: "Invalid image URL" };
  }

  log(ACTION, "Deleting image from Uploadthing...", { fileKey });

  try {
    await utapi.deleteFiles(fileKey);
    log(ACTION, "Image deleted successfully", { fileKey });
    return { success: true };
  } catch (error) {
    logError(ACTION, "Failed to delete image", error);
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
  const ACTION = "deleteUploadthingImages";
  
  const fileKeys = imageUrls
    .filter((url): url is string => !!url)
    .map(extractUploadthingKey)
    .filter((key): key is string => !!key);

  if (fileKeys.length === 0) {
    log(ACTION, "No valid file keys to delete");
    return { success: true }; // Nothing to delete
  }

  log(ACTION, "Deleting multiple images from Uploadthing...", { fileKeys, count: fileKeys.length });

  try {
    await utapi.deleteFiles(fileKeys);
    log(ACTION, "Images deleted successfully", { count: fileKeys.length });
    return { success: true };
  } catch (error) {
    logError(ACTION, "Failed to delete images", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete images",
    };
  }
}
