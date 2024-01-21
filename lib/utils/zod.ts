export function atLeastOne<
  T extends Record<string | number | symbol, unknown>,
  K extends Array<keyof T>,
>(keys: K) {
  const atLeastOneFunc = (obj: T): boolean => {
    return keys.some((key) => {
      return obj[key] !== undefined
    })
  }

  return [
    atLeastOneFunc,
    { message: "At least one field is required" },
  ] as const
}
