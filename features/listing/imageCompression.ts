import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/** Images wider than this are scaled down. Smaller images are never upscaled. */
export const MAX_IMAGE_WIDTH = 1024;
/** JPEG quality used when saving the compressed image (0 = smallest, 1 = no compression). */
export const JPEG_QUALITY = 0.7;

export interface CompressionMetrics {
  rawBytes: number;
  compressedBytes: number;
  savedBytes: number;
  ratioPercent: number;
  /**
   * True only when BOTH sizes were actually measured.
   * When false, the numbers must not be presented as proof of compression.
   */
  isMeasured: boolean;
  formattedRaw: string;
  formattedCompressed: string;
  formattedSaved: string;
}

export interface CompressedImageResult {
  rawUri: string;
  compressedUri: string;
  width: number;
  height: number;
  wasResized: boolean;
  metrics: CompressionMetrics;
}

/**
 * Format bytes into human-readable string (B, KB, MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Pure function to calculate compression metrics.
 * A size of 0 means "could not be measured"; it is never replaced by an estimate.
 */
export function calculateCompressionMetrics(
  rawBytes: number,
  compressedBytes: number
): CompressionMetrics {
  const safeRaw = Math.max(0, Math.round(rawBytes));
  const safeCompressed = Math.max(0, Math.round(compressedBytes));
  const isMeasured = safeRaw > 0 && safeCompressed > 0;
  const savedBytes = isMeasured ? Math.max(0, safeRaw - safeCompressed) : 0;
  const ratioPercent = isMeasured ? Math.round((savedBytes / safeRaw) * 100) : 0;

  return {
    rawBytes: safeRaw,
    compressedBytes: safeCompressed,
    savedBytes,
    ratioPercent,
    isMeasured,
    formattedRaw: formatBytes(safeRaw),
    formattedCompressed: formatBytes(safeCompressed),
    formattedSaved: formatBytes(savedBytes),
  };
}

/**
 * Measure file size in bytes from a local URI.
 * Returns 0 when the size cannot be measured (callers treat 0 as "unknown").
 */
export async function getUriFileSize(uri: string): Promise<number> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob.size || 0;
  } catch {
    return 0;
  }
}

/**
 * Width of the source image. Uses the width reported by the picker when available,
 * otherwise loads the image once to read it.
 */
async function resolveSourceWidth(rawUri: string, sourceWidth?: number): Promise<number> {
  if (sourceWidth && sourceWidth > 0) {
    return sourceWidth;
  }
  const original = await ImageManipulator.manipulate(rawUri).renderAsync();
  return original.width;
}

/**
 * Resize (only when wider than MAX_IMAGE_WIDTH) and compress an image before upload,
 * using the contextual expo-image-manipulator API (manipulateAsync is deprecated in SDK 58).
 * Logs only byte sizes and dimensions: no URI, no user data.
 */
export async function compressListingImage(
  rawUri: string,
  providedRawSize?: number,
  sourceWidth?: number
): Promise<CompressedImageResult> {
  // 1. Measure raw file size if not provided
  const rawBytes =
    providedRawSize && providedRawSize > 0 ? providedRawSize : await getUriFileSize(rawUri);

  // 2. Resize only when the image is larger than the limit (never upscale)
  const width = await resolveSourceWidth(rawUri, sourceWidth);
  const wasResized = width > MAX_IMAGE_WIDTH;

  const context = ImageManipulator.manipulate(rawUri);
  if (wasResized) {
    context.resize({ width: MAX_IMAGE_WIDTH });
  }
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ compress: JPEG_QUALITY, format: SaveFormat.JPEG });

  // 3. Measure compressed file size (0 = unknown, never estimated)
  const compressedBytes = await getUriFileSize(saved.uri);
  const metrics = calculateCompressionMetrics(rawBytes, compressedBytes);

  // 4. Safe, non-sensitive logging for demo/viva
  if (metrics.isMeasured) {
    console.log(
      `[ImageCompression Proof] Raw: ${metrics.formattedRaw} (${metrics.rawBytes} bytes) ` +
        `-> Compressed: ${metrics.formattedCompressed} (${metrics.compressedBytes} bytes). ` +
        `Saved: ${metrics.ratioPercent}%. Output: ${saved.width}x${saved.height}px` +
        `${wasResized ? '' : ' (not resized: already within limit)'}.`
    );
  } else {
    console.warn(
      `[ImageCompression Proof] Could not measure file size ` +
        `(raw: ${metrics.rawBytes} bytes, compressed: ${metrics.compressedBytes} bytes). ` +
        `Output: ${saved.width}x${saved.height}px.`
    );
  }

  return {
    rawUri,
    compressedUri: saved.uri,
    width: saved.width,
    height: saved.height,
    wasResized,
    metrics,
  };
}
