import { exportPKCS8, exportSPKI, generateKeyPair } from "jose"
import {
  APP_ENCRYPT_ES,
  APP_ENCRYPT_JWT_RS,
  APP_ENCRYPT_JWt_ES,
  APP_ENCRYPT_NONE,
  APP_ENCRYPT_RSA,
  AppEncryptMode,
} from "../meta"
import getQueryAdapter from "../query"
import { ClientApp } from "../schemas/app"
import { BadRequestError } from "../utils/error"

export async function createApp(
  name: string,
  version: string,
  encryptMode: AppEncryptMode
) {
  const q = getQueryAdapter()

  const newApp: ClientApp = {
    name,
    version,
    encryptMode,
    privateKey: "",
    publicKey: "",
  }

  switch (encryptMode) {
    case APP_ENCRYPT_NONE:
      break
    case APP_ENCRYPT_RSA:
    case APP_ENCRYPT_JWT_RS:
      {
        const { publicKey, privateKey } = await generateKeyPair("RS256", {
          modulusLength: 2048,
        })
        newApp.publicKey = await exportSPKI(publicKey)
        newApp.privateKey = await exportPKCS8(privateKey)
      }
      break
    case APP_ENCRYPT_ES:
    case APP_ENCRYPT_JWt_ES:
      {
        const { publicKey, privateKey } = await generateKeyPair("ES256", {
          crv: "P-256",
        })
        newApp.publicKey = await exportSPKI(publicKey)
        newApp.privateKey = await exportPKCS8(privateKey)
      }
      break
    default:
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-case-declarations
      const _: never = encryptMode
      break
  }

  try {
    await q.addApp(newApp)
  } catch (e) {
    if (e instanceof Error && e.name === "ConditionalCheckFailedException") {
      throw new BadRequestError("App already exists")
    }
    throw e
  }
}
