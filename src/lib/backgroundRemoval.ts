import type { InferenceSession } from "onnxruntime-web";

// IS-Net general-use (Apache-2.0) run in the browser with onnxruntime-web (MIT).
// Loaded only when an admin removes a background, so shoppers never download it.
const ORT_VERSION = "1.31.1";
const MODEL_BASE = "https://huggingface.co/Ko033/isnet-general-use-onnx/resolve/main/onnx/";
const GPU_MODEL = MODEL_BASE + "model_fp16.onnx"; // ~88 MB, a few seconds per photo on the graphics chip
const CPU_MODEL = MODEL_BASE + "model_quantized.onnx"; // ~46 MB, ~20 s per photo on the processor
const MODEL_CACHE = "poigai-bg-model-v2";
const SIZE = 1024;

type Ort = typeof import("onnxruntime-web");
type StatusCallback = (message: string) => void;

let sessionPromise: Promise<{ ort: Ort; session: InferenceSession }> | null = null;

async function loadModelBytes(url: string, onStatus?: StatusCallback): Promise<Uint8Array> {
  const cache = "caches" in window ? await caches.open(MODEL_CACHE).catch(() => null) : null;
  const cached = cache ? await cache.match(url) : undefined;
  if (cached) return new Uint8Array(await cached.arrayBuffer());

  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error("Couldn't download the background remover. Check your connection.");
  const total = Number(response.headers.get("content-length")) || 0;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (total) onStatus?.(`Downloading background remover (first time only)… ${Math.round((received / total) * 100)}%`);
  }
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    await cache?.put(url, new Response(bytes));
  } catch {
    // Browser storage full — it will simply download again next time.
  }
  return bytes;
}

function getSession(onStatus?: StatusCallback) {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const ort = await import("onnxruntime-web");
      ort.env.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;
      const options = { enableCpuMemArena: false, enableMemPattern: false };

      const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
      const hasGpu = gpu ? Boolean(await gpu.requestAdapter().catch(() => null)) : false;
      if (hasGpu) {
        try {
          const bytes = await loadModelBytes(GPU_MODEL, onStatus);
          onStatus?.("Preparing background remover…");
          const session = await ort.InferenceSession.create(bytes, { ...options, executionProviders: ["webgpu"] });
          return { ort, session };
        } catch {
          // Fall through to the processor version.
        }
      }
      const bytes = await loadModelBytes(CPU_MODEL, onStatus);
      onStatus?.("Preparing background remover…");
      const session = await ort.InferenceSession.create(bytes, { ...options, executionProviders: ["wasm"] });
      return { ort, session };
    })().catch((error) => {
      sessionPromise = null;
      throw error;
    });
  }
  return sessionPromise;
}

function canvas(width: number, height: number) {
  const element = document.createElement("canvas");
  element.width = width;
  element.height = height;
  const context = element.getContext("2d");
  if (!context) throw new Error("This browser can't process images.");
  return { element, context };
}

// Crops to the product and re-centres it on a 4:5 canvas so it fills the product card evenly.
function frameProduct(source: HTMLCanvasElement): HTMLCanvasElement {
  const { width, height } = source;
  const pixels = source.getContext("2d")!.getImageData(0, 0, width, height).data;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) throw new Error("Couldn't find the product in this photo. Try a photo with the piece clearly in view.");

  const contentW = maxX - minX + 1;
  const contentH = maxY - minY + 1;
  const padded = 1.16;
  let frameW = contentW * padded;
  let frameH = contentH * padded;
  if (frameW / frameH > 0.8) frameH = frameW / 0.8;
  else frameW = frameH * 0.8;

  const scale = Math.min(1, 1600 / Math.max(frameW, frameH));
  const { element, context } = canvas(Math.round(frameW * scale), Math.round(frameH * scale));
  context.imageSmoothingQuality = "high";
  context.drawImage(
    source,
    minX, minY, contentW, contentH,
    ((frameW - contentW) / 2) * scale, ((frameH - contentH) / 2) * scale, contentW * scale, contentH * scale,
  );
  return element;
}

export async function removeBackground(source: Blob, onStatus?: StatusCallback): Promise<Blob> {
  onStatus?.("Loading background remover…");
  const { ort, session } = await getSession(onStatus);
  onStatus?.("Removing background…");

  const bitmap = await createImageBitmap(source);
  const plane = SIZE * SIZE;

  const input = canvas(SIZE, SIZE);
  input.context.drawImage(bitmap, 0, 0, SIZE, SIZE);
  const rgba = input.context.getImageData(0, 0, SIZE, SIZE).data;
  const tensorData = new Float32Array(3 * plane);
  for (let i = 0; i < plane; i++) {
    for (let c = 0; c < 3; c++) tensorData[c * plane + i] = rgba[i * 4 + c] / 255 - 0.5;
  }

  const results = await session.run({
    [session.inputNames[0]]: new ort.Tensor("float32", tensorData, [1, 3, SIZE, SIZE]),
  });
  const outputName = session.outputNames.includes("output_image")
    ? "output_image"
    : session.outputNames[session.outputNames.length - 1];
  const raw = results[outputName].data as Float32Array;

  // The model outputs a probability map; stretch it to the full 0–1 range per image.
  let min = Infinity, max = -Infinity;
  for (let i = 0; i < plane; i++) {
    if (raw[i] < min) min = raw[i];
    if (raw[i] > max) max = raw[i];
  }
  const range = max - min || 1;

  const mask = canvas(SIZE, SIZE);
  const maskPixels = mask.context.createImageData(SIZE, SIZE);
  for (let i = 0; i < plane; i++) maskPixels.data[i * 4 + 3] = Math.round(((raw[i] - min) / range) * 255);
  mask.context.putImageData(maskPixels, 0, 0);

  const width = bitmap.width;
  const height = bitmap.height;
  const output = canvas(width, height);
  output.context.drawImage(bitmap, 0, 0);
  bitmap.close();
  const image = output.context.getImageData(0, 0, width, height);
  const px = image.data;

  const scaledMask = canvas(width, height);
  scaledMask.context.imageSmoothingQuality = "high";
  scaledMask.context.drawImage(mask.element, 0, 0, width, height);
  const soft = scaledMask.context.getImageData(0, 0, width, height).data;

  // Average colour of the clear background (e.g. the velvet), sampled sparsely.
  let sumR = 0, sumG = 0, sumB = 0, count = 0;
  for (let i = 0; i < width * height; i += 7) {
    if (soft[i * 4 + 3] < 12) {
      sumR += px[i * 4];
      sumG += px[i * 4 + 1];
      sumB += px[i * 4 + 2];
      count++;
    }
  }
  const bg = count ? [sumR / count, sumG / count, sumB / count] : [0, 0, 0];

  // Edge pixels are a mix of jewellery and background: undo that mix so thin chains keep their true colour,
  // then firm up the edges so they stay solid instead of fading into the new backdrop.
  const low = 0.08;
  const high = 0.5;
  for (let i = 0; i < width * height; i++) {
    const a = soft[i * 4 + 3] / 255;
    if (a >= 0.15 && a < 0.98) {
      for (let c = 0; c < 3; c++) {
        const value = (px[i * 4 + c] - (1 - a) * bg[c]) / a;
        px[i * 4 + c] = value < 0 ? 0 : value > 255 ? 255 : value;
      }
    }
    const firm = a <= low ? 0 : a >= high ? 1 : (a - low) / (high - low);
    px[i * 4 + 3] = Math.round(firm * 255);
  }
  output.context.putImageData(image, 0, 0);

  const framed = frameProduct(output.element);
  return new Promise<Blob>((resolve, reject) =>
    framed.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Couldn't create the image."))), "image/webp", 0.9),
  );
}
