import NextAuth from "next-auth"
import nextAuthConf from "./config"

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
const handler: any = NextAuth(nextAuthConf)

export default handler
