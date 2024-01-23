import {
  FlattenedSign,
  exportPKCS8,
  exportSPKI,
  generateKeyPair,
  importPKCS8,
} from "jose"

export async function createKeyPair() {
  const { publicKey, privateKey } = await generateKeyPair("ES256", {
    crv: "P-256",
  })

  const pubKey = await exportSPKI(publicKey)
  const priKey = await exportPKCS8(privateKey)
  return { privateKey: priKey, publicKey: pubKey }
}

export async function jwsEncrypt(data: string, privateKey: string) {
  const key = await importPKCS8(privateKey, "ES256")
  const jws = await new FlattenedSign(Buffer.from(data, "utf8"))
    .setProtectedHeader({
      alg: "ES256",
    })
    .sign(key)

  return jws
}
