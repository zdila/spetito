import { NextApiHandler } from "next";
import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import FacebookProvider from "next-auth/providers/facebook";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "../../../lib/prisma";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_ID!,
      clientSecret: process.env.TWITTER_SECRET!,
      version: "2.0", // opt-in to Twitter OAuth 2.0
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT ?? "465"),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.SECRET,
  callbacks: {
    // hack to derive name from email if name is not provided
    signIn(params) {
      function emailToName(email: string) {
        return email
          .replace(/@.*/, "")
          .split(/[\W_]+/)
          .filter((a) => a)
          .map((a) => a[0].toUpperCase() + a.slice(1))
          .join(" ");
      }

      if (params.user && !params.user.name && params.user.email) {
        params.user.name = emailToName(params.user.email);
      }

      if (params.profile && !params.profile.name && params.profile.email) {
        params.profile.name = emailToName(params.profile.email);
      }

      return true;
    },
    session: async ({ session, user }) => {
      if (session.user) {
        Object.assign(session.user, user);
      }

      return Promise.resolve(session);
    },
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verifyRequest",
  },
});
