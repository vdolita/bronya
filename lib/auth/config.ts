import { nextAuth } from "@/lib/biz/auth"
import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const nextAuthConf: AuthOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        return await nextAuth(credentials)
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
}

export default nextAuthConf
