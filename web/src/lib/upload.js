export const MAX_UPLOAD_MB = 8;

/** Returns an error message if the file can't be used as a photo, else null. */
export function checkImageFile(file) {
  if (!file.type.startsWith('image/')) return `${file.name} isn't an image`;
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return `${file.name} is over ${MAX_UPLOAD_MB} MB`;
  return null;
}

/** Uploads a file to Convex storage and returns its storage id.
    `getUploadUrl` is the admin.generateUploadUrl mutation. */
export async function uploadToStorage(getUploadUrl, file) {
  const res = await fetch(await getUploadUrl(), { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
  if (!res.ok) throw new Error('Upload failed');
  const { storageId } = await res.json();
  return storageId;
}
