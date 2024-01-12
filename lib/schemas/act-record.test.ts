import { expect, test } from "@jest/globals"
import { actRecordSchema } from "."

test("Test act record schema", () => {
  const a = actRecordSchema.parse({
    key: "1fce5631-f6f8-4b17-b86d-71f102390a4f",
    app: "asuka",
    identityCode: "k123",
    rollingCode: "f170977b",
    activatedAt: "2024-01-08T16:40:41.834Z",
    expireAt: "2024-01-03T15:59:59.999Z",
    rollingDays: 15,
    status: "active",
    lastRollingAt: "2024-01-08T16:40:41.834Z",
  })

  expect(typeof a.activatedAt).toEqual("object")
})
