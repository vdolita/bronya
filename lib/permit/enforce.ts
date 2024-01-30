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
m = r.sub == p.sub && r.obj == p.obj && r.act == p.act
`

const m = newModelFromString(permModelText)
const ad = new BronyaAdapter()

let enforcer: Enforcer

export async function getEnforcer(): Promise<Enforcer> {
  if (!enforcer) {
    enforcer = await newEnforcer(m, ad)
  }

  return enforcer
}

// TODO: should reload policy when permission changed with multiple instances
export async function reloadPolicy(): Promise<void> {
  const e = await getEnforcer()
  await e.loadPolicy()
}
