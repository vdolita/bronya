import { expect, test } from "@jest/globals";
import { randomStr, randomStrSync } from "./random";

test("Test randomStr", async () => {
  const strA = await randomStr(10);
  expect(strA.length).toBe(10);

  const strB = await randomStr(20);
  expect(strB.length).toBe(20);

  const strC = await randomStr(0);
  expect(strC.length).toBe(0);
});

test("Test randomStrSync", () => {
  const strA = randomStrSync(10);
  expect(strA.length).toBe(10);

  const strB = randomStrSync(20);
  expect(strB.length).toBe(20);

  const strC = randomStrSync(0);
  expect(strC.length).toBe(0);
});
