import { Helper, type Adapter, type Model } from "casbin"

import getQueryAdapter from "../query"
import { Perm } from "./permission"

export class BronyaAdapter implements Adapter {
  constructor() {}

  async loadPolicy(model: Model): Promise<void> {
    const q = getQueryAdapter().permission
    const lines = await q.all()

    for (const line of lines) {
      this.loadPolicyLine(line, model)
    }
  }

  savePolicy(): Promise<boolean> {
    throw new Error("not implemented")
  }

  addPolicy(): Promise<void> {
    throw new Error("not implemented")
  }

  removePolicy(): Promise<void> {
    throw new Error("not implemented")
  }

  removeFilteredPolicy(): Promise<void> {
    throw new Error("not implemented")
  }

  loadPolicyLine = (line: Perm, model: Model): void => {
    const result = `u:${line.sub}, ${line.obj}, ${line.act}`
    Helper.loadPolicyLine(result, model)
  }
}
