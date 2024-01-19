import getQueryAdapter from "../query"

export async function isSystemInitialed() {
  const q = getQueryAdapter().user

  const userCount = await q.count()
  return userCount > 0
}
