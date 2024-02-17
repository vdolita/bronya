import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next"
import { Session, getServerSession } from "next-auth"
import nextAuthConf from "./config"

// Use it in server contexts
export function sessionHelper(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
): Promise<Session | null> {
  return getServerSession(...args, nextAuthConf)
}

export async function isAuthenticated() {
  const session = await sessionHelper()
  const username = session?.user?.name
  return !!username
}
