import type { OAuthConfig, OAuthUserConfig } from "@auth/core/providers";

export interface PoEProfile {
  id: string;
  name: string;
  avatar?: string;
}

interface TokenSet {
  access_token: string;
  token_type: string;
  expires_at?: number;
  refresh_token?: string;
}

export default function PoE<P extends PoEProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  console.log("PoE Provider initialized with client ID:", options.clientId);

  return {
    id: "poe",
    name: "Path of Exile",
    type: "oauth",
    authorization: {
      url: "https://www.pathofexile.com/oauth/authorize",
      params: {
        scope: "account:profile account:item_filter",
        response_type: "code",
      },
    },
    token: {
      url: "https://www.pathofexile.com/oauth/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
    checks: ["pkce", "state"],
    userinfo: {
      url: "https://www.pathofexile.com/api/profile",
      async request({
        tokens,
        provider,
      }: {
        tokens: TokenSet;
        provider: OAuthConfig<P>;
      }) {
        const response = await fetch(provider.userinfo?.url as string, {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            "User-Agent": "DivineView/1.0",
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
        }
        
        const profile = await response.json();
        console.log("PoE Profile response:", profile);
        
        return {
          id: profile.sub || profile.uuid,
          name: profile.username || profile.name,
          avatar: profile.avatar?.image || profile.image || null,
        };
      },
    },
    profile(profile) {
      return {
        id: profile.id,
        name: profile.name,
        image: profile.avatar,
      };
    },
  };
}
