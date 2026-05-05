/**
 * Formats an image URL correctly depending on whether it's:
 * 1. A full external URL (starts with http/https)
 * 2. A data URI (starts with data:)
 * 3. A local backend static path (starts with /uploads → served at root, not under /api)
 */
export const imageUrl = (path: string | null | undefined): string | undefined => {
  if (!path) return undefined;
  
  // If it's already a full URL or data URI, return as is
  if (path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }
  
  // Ensure the path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Static files (/uploads/...) are served at the ROOT of the server by Caddy/NestJS,
  // NOT under /api. Only use VITE_API_URL base for actual API endpoints.
  if (normalizedPath.startsWith('/uploads/')) {
    // In dev: Vite proxy doesn't cover /uploads, so we need the full backend URL
    // In prod: Caddy serves /uploads directly from backend at root
    const devBackend = import.meta.env.DEV ? 'http://localhost:3000' : '';
    return `${devBackend}${normalizedPath}`;
  }
  
  // For any other relative paths, use the API base
  const baseUrl = import.meta.env.VITE_API_URL || '/api';
  return `${baseUrl}${normalizedPath}`;
};
