/**
 * API Client Configuration
 * Handles environment variables according to Expo recommendations.
 * 
 * SECURITY RULE:
 * `EXPO_PUBLIC_*` variables are embedded into client JavaScript bundles and
 * are accessible to anyone inspecting the app. NEVER place backend secret keys,
 * service_role keys, or database credentials here or in source control.
 */

export interface ApiConfig {
  baseUrl: string;
  timeoutMs: number;
  headers: Record<string, string>;
  isMockFallbackEnabled: boolean;
}

const DEFAULT_BASE_URL = 'https://api.campusmarketplace.edu.vn/api/v1';
const DEFAULT_TIMEOUT_MS = 15000;

export const apiConfig: ApiConfig = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || DEFAULT_BASE_URL,
  timeoutMs: process.env.EXPO_PUBLIC_API_TIMEOUT
    ? Number(process.env.EXPO_PUBLIC_API_TIMEOUT)
    : DEFAULT_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Client-Platform': 'expo-mobile',
    'X-App-Version': '1.0.0',
  },
  // Allows offline/demo fallback when remote server is unreachable
  isMockFallbackEnabled: process.env.EXPO_PUBLIC_ENABLE_MOCK_FALLBACK !== 'false',
};

export function isRemoteApiConfigured(): boolean {
  return Boolean(
    process.env.EXPO_PUBLIC_API_URL &&
    process.env.EXPO_PUBLIC_API_URL !== DEFAULT_BASE_URL
  );
}
