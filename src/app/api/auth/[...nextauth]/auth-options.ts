import { connectToDb } from "@/db/config";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { google } from "googleapis";
import User from "@/models/user";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Email", type: "text", placeholder: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch("/api/user/login", {
          method: "POST",
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" },
        });
        const user = await res.json();
        if (res.ok && user) {
          return user;
        }
        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "email profile",
          prompt: "consent",
          access_type: "offline",
        },
      },
    }),
  ],
  secret: process.env.JWT_SECRET,

  callbacks: {
    async jwt({ token, account, user }) {
      await connectToDb();
      let existingUser = await User.findOne({ email: user.email });

      if (!existingUser && user && account?.provider === "google") {
        existingUser = await User.create({
          name: user.name,
          email: user.email,
          avatar: user.image,
        });
        await existingUser.save();
      }
      if (!existingUser) {
        throw new Error("User not found.");
      }
      token.email = existingUser.email;
      token.name = existingUser.name;
      token.id = existingUser._id;
      token.avatar = existingUser.avatar;

      if (account) {
        token.accessToken = account.access_token;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000;
        token.refreshToken = account.refresh_token;
      }

      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.avatar = token.avatar as string;
      }
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.accessTokenExpires = token.accessTokenExpires as number;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
};

async function refreshAccessToken(token: JWT) {
  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!
    );

    auth.setCredentials({ refresh_token: token.refreshToken as string });

    const { credentials } = await auth.refreshAccessToken();

    return {
      ...token,
      accessToken: credentials.access_token!,
      accessTokenExpires: credentials.expiry_date || Date.now() + 3600 * 1000,
      refreshToken: credentials.refresh_token || token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}
