import { Enforcer, newEnforcer, newModelFromString } from "casbin"
import { BronyaAdapter } from "./adapter"

const permModelText = `
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = r.sub == p.sub && (r.obj == p.obj || p.obj == "*") && (r.act == p.act || p.act == "*")
`

const m = newModelFromString(permModelText)
const ad = new BronyaAdapter()

let enforcer: Enforcer
let lastLoadTime: Date
const reloadInterval = 1000 * 60 * 5 // 5 minutes

export async function getEnforcer(): Promise<Enforcer> {
  if (!enforcer) {
    enforcer = await newEnforcer(m, ad)
    lastLoadTime = new Date()
  }

  const now = new Date()
  if (now.getTime() - lastLoadTime.getTime() > reloadInterval) {
    await enforcer.loadPolicy()
    lastLoadTime = new Date()
  }
  return enforcer
}

export async function reloadPolicy(): Promise<void> {
  const e = await getEnforcer()
  await e.loadPolicy()
}
