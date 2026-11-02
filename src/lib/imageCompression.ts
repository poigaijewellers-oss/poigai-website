import imageCompression from "browser-image-compression";

export async function compressImage(file: File): Promise<File> {
  // PNG and WebP keep transparency (background-removed cut-outs); everything else becomes JPEG.
  const keepsAlpha = file.type === "image/png" || file.type === "image/webp";
  try {
    return await imageCompression(file, {
      maxSizeMB: 0.4,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      fileType: keepsAlpha ? file.type : "image/jpeg",
      initialQuality: 0.82,
    });
  } catch {
    return file;
  }
}
