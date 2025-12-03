/**
 * Token refresh utilities for OAuth token rotation
 */

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Refresh an expired OAuth access token using the refresh token
 * @param refreshToken - The OAuth refresh token
 * @returns New tokens or null if refresh failed
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<RefreshTokenResponse | null> {
  try {
    const response = await fetch("https://www.pathofexile.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.POE_CLIENT_ID || "",
        client_secret: process.env.POE_CLIENT_SECRET || "",
        scope: "account:profile account:item_filter",
      }),
    });

    if (!response.ok) {
      console.error("Token refresh failed:", response.status, response.statusText);
      return null;
    }

    const tokens = await response.json();

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || refreshToken, // Keep old refresh token if new one not provided
      expiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in,
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
}
