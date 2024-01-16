import { FlattenedJWS, exportPKCS8, exportSPKI, generateKeyPair } from "jose"
import { APP_ENCRYPT_JWS, APP_ENCRYPT_NONE, AppEncryptType } from "../meta"
import getQueryAdapter from "../query"
import { ClientApp } from "../schemas/app"
import { BadRequestError } from "../utils/error"
import { jwsEncrypt } from "../utils/jws"

export async function createApp(
  name: string,
  version: string,
  encryptType: AppEncryptType
) {
  const q = getQueryAdapter()

  const newApp: ClientApp = {
    name,
    version,
    encryptType: encryptType,
    privateKey: "",
    publicKey: "",
  }

  switch (encryptType) {
    case APP_ENCRYPT_NONE:
      break
    case APP_ENCRYPT_JWS:
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
      const _: never = encryptType
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

export async function encryptData<T extends Record<string, unknown>>(
  appName: string,
  data: T
): Promise<T | FlattenedJWS> {
  const q = getQueryAdapter()
  const app = await q.getApp(appName)
  if (!app) {
    throw new BadRequestError("Invalid app name")
  }

  if (app.encryptType == APP_ENCRYPT_NONE) {
    return data
  }

  if (app.encryptType == APP_ENCRYPT_JWS) {
    const jws = await jwsEncrypt(JSON.stringify(data), app.privateKey)
    return jws
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _: never = app.encryptType
  throw new BadRequestError("Invalid encrypt mode")
}
