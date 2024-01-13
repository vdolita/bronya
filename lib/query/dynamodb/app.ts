import { AppEncryptMode } from "@/lib/meta"
import { ClientApp } from "@/lib/schemas/app"
import {
  AttributeValue,
  PutItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb"
import { TABLE_NAME, getDynamoDBClient } from "./dynamodb"

const APP_PK = "app"
const APP_SK = "app#"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AppItem = {
  pk: { S: string }
  sk: { S: string }
  app_name: { S: string }
  app_version: { S: string }
  app_encryptMode: { S: string }
  app_privateKey: { S: string }
  app_publicKey: { S: string }
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

function appToItem(app: ClientApp): AppItem {
  return {
    pk: { S: APP_PK },
    sk: { S: formatAppSk(app.name) },
    app_name: { S: app.name },
    app_version: { S: app.version },
    app_encryptMode: { S: app.encryptMode },
    app_privateKey: { S: app.privateKey },
    app_publicKey: { S: app.publicKey },
  }
}

function itemToApp(item: Record<string, AttributeValue>): ClientApp {
  const {
    app_name,
    app_version,
    app_encryptMode,
    app_privateKey,
    app_publicKey,
  } = item as AppItem

  const app: ClientApp = {
    name: app_name.S,
    version: app_version.S,
    encryptMode: app_encryptMode.S as AppEncryptMode,
    privateKey: app_privateKey.S,
    publicKey: app_publicKey.S,
  }

  return app
}

function formatAppSk(appName: string) {
  return `${APP_SK}${appName}`
}
