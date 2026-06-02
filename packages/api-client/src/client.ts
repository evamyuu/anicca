// API Client stub — used in shared package context
// Actual implementation is in apps/mobile/src/shared/api/http-client.ts
// and apps/web/src/shared/api/http-client.ts

export const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:8000';
