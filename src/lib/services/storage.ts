"use client";

import { createClient } from "@/lib/supabase/client";
import { STORAGE_LIMITS, isSupabaseConfigured, supabaseConfig } from "@/lib/config";

export class UploadError extends Error {}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/* ═══════════════════════════════════════════════════════════════
   LA COMPRESSION
   Un téléphone produit des photos de 4 à 8 Mo. Cette définition ne
   sert à rien sur un écran de six pouces, et une invitation lourde
   est une invitation qu’on n’attend pas en 4G.

   On redimensionne, puis on baisse la qualité par paliers jusqu’à
   passer sous la cible. Résultat typique : 200 à 400 Ko, sans perte
   visible. L’utilisateur n’a rien à faire et ne voit aucune limite.
   ═══════════════════════════════════════════════════════════════ */

const COVER = { maxEdge: 1600, target: 400 * 1024 };
const GALLERY = { maxEdge: 1400, target: 280 * 1024 };
const PORTRAIT = { maxEdge: 1200, target: 220 * 1024 };
const AVATAR = { maxEdge: 512, target: 90 * 1024 };

const PROFILES: Record<string, { maxEdge: number; target: number }> = {
  covers: COVER,
  gallery: GALLERY,
  portraits: PORTRAIT,
  album: PORTRAIT,
  avatars: AVATAR,
};

function draw(bitmap: ImageBitmap, maxEdge: number): HTMLCanvasElement | null {
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Redimensionne puis compresse par paliers jusqu’à la cible. */
export async function compressImage(
  file: File,
  { maxEdge, target }: { maxEdge: number; target: number } = GALLERY,
): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const canvas = draw(bitmap, maxEdge);
  bitmap.close?.();
  if (!canvas) return file;

  /* WebP quand le navigateur le gère : environ 30 % plus léger
     qu’un JPEG à qualité perçue égale. */
  const supportsWebp = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  const type = supportsWebp ? "image/webp" : "image/jpeg";
  const extension = supportsWebp ? "webp" : "jpg";

  let blob: Blob | null = null;
  for (const quality of [0.82, 0.72, 0.62, 0.52, 0.42]) {
    blob = await toBlob(canvas, type, quality);
    if (blob && blob.size <= target) break;
  }
  if (!blob || blob.size >= file.size) return file;

  return new File([blob], file.name.replace(/\.[^.]+$/, `.${extension}`), {
    type,
    lastModified: Date.now(),
  });
}

export interface UploadResult {
  url: string;
  bytes: number;
}

/** Envoie une image, systématiquement compressée au préalable. */
export async function uploadImage(
  file: File,
  bucket: keyof typeof supabaseConfig.buckets,
  userId: string,
): Promise<UploadResult> {
  if (!file.type.startsWith("image/")) {
    throw new UploadError("Ce fichier n’est pas une image.");
  }
  if (file.size > STORAGE_LIMITS.imageMaxBytes) {
    throw new UploadError(
      `Cette image fait ${formatBytes(file.size)}. Choisissez-en une de moins de ${formatBytes(STORAGE_LIMITS.imageMaxBytes)}.`,
    );
  }

  const optimized = await compressImage(file, PROFILES[bucket] ?? GALLERY);

  if (!isSupabaseConfigured) {
    const url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new UploadError("La lecture du fichier a échoué."));
      reader.readAsDataURL(optimized);
    });
    return { url, bytes: optimized.size };
  }

  const supabase = createClient();
  const bucketName = supabaseConfig.buckets[bucket];
  const extension = optimized.type === "image/webp" ? "webp" : "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(bucketName).upload(path, optimized, {
    cacheControl: "31536000",
    contentType: optimized.type,
    upsert: false,
  });
  if (error) throw new UploadError("L’envoi a échoué. Réessayez dans un instant.");

  return {
    url: supabase.storage.from(bucketName).getPublicUrl(path).data.publicUrl,
    bytes: optimized.size,
  };
}

/** Musique personnelle, quand le couple n’en veut pas de la bibliothèque. */
export async function uploadAudio(file: File, userId: string): Promise<UploadResult> {
  if (!STORAGE_LIMITS.audioMimeTypes.includes(file.type as never)) {
    throw new UploadError("Ce format audio n’est pas accepté. Utilisez un MP3 ou un M4A.");
  }
  if (file.size > STORAGE_LIMITS.audioMaxBytes) {
    throw new UploadError(
      `Ce fichier fait ${formatBytes(file.size)}. Choisissez un extrait plus court, ou une musique de notre bibliothèque.`,
    );
  }

  if (!isSupabaseConfigured) {
    return { url: URL.createObjectURL(file), bytes: file.size };
  }

  const supabase = createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "mp3";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(supabaseConfig.buckets.music)
    .upload(path, file, { cacheControl: "31536000", upsert: false });
  if (error) throw new UploadError("L’envoi a échoué. Réessayez dans un instant.");

  return {
    url: supabase.storage.from(supabaseConfig.buckets.music).getPublicUrl(path).data.publicUrl,
    bytes: file.size,
  };
}
