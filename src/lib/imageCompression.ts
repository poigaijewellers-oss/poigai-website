import imageCompression from "browser-image-compression";

export async function compressImage(file: File): Promise<File> {
  try {
    return await imageCompression(file, {
      maxSizeMB: 0.4,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      fileType: file.type === "image/png" ? "image/png" : "image/jpeg",
      initialQuality: 0.82,
    });
  } catch {
    return file;
  }
}
