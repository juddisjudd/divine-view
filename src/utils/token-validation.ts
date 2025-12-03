/**
 * Token validation utilities for OAuth token management
 */

/**
 * Check if an OAuth token has expired or is about to expire
 * @param expiresAt - Unix timestamp (seconds) when the token expires
 * @param bufferSeconds - Buffer time in seconds to consider token expired (default: 5 minutes)
 * @returns true if token is expired or will expire within buffer time
 */
export function isTokenExpired(
  expiresAt: number | undefined,
  bufferSeconds: number = 300
): boolean {
  if (!expiresAt) return true;

  const now = Math.floor(Date.now() / 1000);
  const expiration = expiresAt;

  // Consider expired if within buffer time (default 5 min before actual expiration)
  return now >= expiration - bufferSeconds;
}

/**
 * Get the remaining time until token expiration
 * @param expiresAt - Unix timestamp (seconds) when the token expires
 * @returns Seconds until expiration, or 0 if already expired
 */
export function getTimeUntilExpiration(
  expiresAt: number | undefined
): number {
  if (!expiresAt) return 0;

  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, expiresAt - now);
}

/**
 * Format remaining time in a human-readable format
 * @param seconds - Number of seconds
 * @returns Human-readable time string (e.g., "5 days", "2 hours", "30 minutes")
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "expired";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""}`;

  return "less than a minute";
}

/**
 * Check if the session has a valid access token
 * @param session - NextAuth session object
 * @returns true if session has a valid access token
 */
export function hasValidAccessToken(
  session: any | null | undefined
): boolean {
  return !!(session?.user?.accessToken);
}
