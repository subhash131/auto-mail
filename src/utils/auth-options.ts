import { connectToDb } from "@/db/config";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { google } from "googleapis";

async function refreshAccessToken(token: any) {
  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!
    );

    auth.setCredentials({ refresh_token: token.refreshToken });

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

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password.");
        }

        await connectToDb();
        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("User not found.");
        }

        if (!user.password) {
          throw new Error(
            "User registered via Google. Please log in with Google."
          );
        }

        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isMatch) {
          throw new Error("Invalid credentials.");
        }

        return user;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  secret: process.env.JWT_SECRET,
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      await connectToDb();

      let existingUser = await User.findOne({ email: token.email });

      if (!existingUser && user && account?.provider === "google") {
        existingUser = new User({
          username: user.name,
          email: user.email,
          image: user.image,
          isEmailVerified: true,
        });

        await existingUser.save();
      }

      if (!existingUser) {
        throw new Error("User not found.");
      }

      token.id = existingUser._id;
      token.username = existingUser.username;
      token.email = existingUser.email;

      if (account) {
        token.accessToken = account.access_token;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000;
        token.refreshToken = account.refresh_token!;
      }

      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.username as string;
      }
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.accessTokenExpires = token.accessTokenExpires as number;

      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};
