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
    client: {
      client_id: options.clientId,
      client_secret: options.clientSecret,
    },
    authorization: {
      url: "https://www.pathofexile.com/oauth/authorize",
      params: {
        scope: "account:profile account:item_filter",
        response_type: "code",
        client_id: options.clientId,
      },
    },
    token: "https://www.pathofexile.com/oauth/token",
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
          },
        });
        const profile = await response.json();
        return {
          id: profile.uuid,
          name: profile.name,
          avatar: profile.avatar || null,
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
