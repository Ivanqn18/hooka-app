/**
 * Formats an image URL correctly depending on whether it's:
 * 1. A full external URL (starts with http/https)
 * 2. A data URI (starts with data:)
 * 3. A local backend path (starts with /uploads or similar)
 */
export const imageUrl = (path: string | null | undefined): string | undefined => {
  if (!path) return undefined;
  
  // If it's already a full URL or data URI, return as is
  if (path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }
  
  // Prepend backend URL for local paths
  const baseUrl = import.meta.env.VITE_API_URL || '/api';
  
  // Ensure the path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${normalizedPath}`;
};
