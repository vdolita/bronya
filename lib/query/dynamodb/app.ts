import { AppEncryptType } from "@/lib/meta"
import { ClientApp } from "@/lib/schemas/app"
import {
  AttributeValue,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb"
import { AppUpdate } from "../adapter"
import { TABLE_NAME, getDynamoDBClient } from "./dynamodb"

const APP_PK = "app"
const APP_SK = "app#"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AppItem = {
  pk: { S: string }
  sk: { S: string }
  app_name: { S: string }
  app_version: { S: string }
  app_encryptType: { S: string }
  app_privateKey: { S: string }
  app_publicKey: { S: string }
}

export async function getApp(appName: string): Promise<ClientApp | null> {
  const dynamodbClient = getDynamoDBClient()

  const cmd = new GetItemCommand({
    TableName: TABLE_NAME,
    Key: {
      pk: { S: APP_PK },
      sk: { S: formatAppSk(appName) },
    },
  })

  const { Item } = await dynamodbClient.send(cmd)

  if (!Item) {
    return null
  }

  return itemToApp(Item)
}

export async function getApps(): Promise<Array<ClientApp>> {
  const dynamodbClient = getDynamoDBClient()

  const cmd = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ":pk": { S: APP_PK },
    },
  })

  let lastKey: Record<string, AttributeValue> | undefined = undefined
  const items: ClientApp[] = []

  do {
    const { Items, LastEvaluatedKey } = await dynamodbClient.send(cmd)

    if (Items) {
      items.push(...Items.map(itemToApp))
    }
    lastKey = LastEvaluatedKey
  } while (lastKey)

  return items
}

export async function addApp(app: ClientApp) {
  const dynamodbClient = getDynamoDBClient()

  const cmd = new PutItemCommand({
    TableName: TABLE_NAME,
    Item: appToItem(app),
    ConditionExpression:
      "attribute_not_exists(pk) AND attribute_not_exists(sk)",
  })

  await dynamodbClient.send(cmd)
}

export async function updateApp(name: string, app: AppUpdate) {
  const dynamodbClient = getDynamoDBClient()

  const cmd = new UpdateItemCommand({
    TableName: TABLE_NAME,
    Key: {
      pk: { S: APP_PK },
      sk: { S: formatAppSk(name) },
    },
    UpdateExpression: `SET app_version = :app_version`,
    ConditionExpression: "attribute_exists(pk) AND attribute_exists(sk)",
    ExpressionAttributeValues: {
      ":app_version": { S: app.version },
    },
    ReturnValues: "ALL_NEW",
  })

  const { Attributes } = await dynamodbClient.send(cmd)

  if (!Attributes) {
    throw new Error(`updateApp failed`)
  }

  return itemToApp(Attributes)
}

function appToItem(app: ClientApp): AppItem {
  return {
    pk: { S: APP_PK },
    sk: { S: formatAppSk(app.name) },
    app_name: { S: app.name },
    app_version: { S: app.version },
    app_encryptType: { S: app.encryptType },
    app_privateKey: { S: app.privateKey },
    app_publicKey: { S: app.publicKey },
  }
}

function itemToApp(item: Record<string, AttributeValue>): ClientApp {
  const {
    app_name,
    app_version,
    app_encryptType,
    app_privateKey,
    app_publicKey,
  } = item as AppItem

  const app: ClientApp = {
    name: app_name.S,
    version: app_version.S,
    encryptType: app_encryptType.S as AppEncryptType,
    privateKey: app_privateKey.S,
    publicKey: app_publicKey.S,
  }

  return app
}

function formatAppSk(appName: string) {
  return `${APP_SK}${appName}`
}