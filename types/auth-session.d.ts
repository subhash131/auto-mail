import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name?: string;
      avatar?: string;
    };
    accessToken: string;
    refreshToken?: string;
    accessTokenExpires: number;
  }

  interface JWT {
    id: string;
    email: string;
    username?: string;
    accessToken: string;
    refreshToken?: string;
    accessTokenExpires: number;
  }
}
