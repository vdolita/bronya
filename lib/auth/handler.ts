import NextAuth from "next-auth"
import nextAuthConf from "./config"

const handler: unknown = NextAuth(nextAuthConf)

export default handler
