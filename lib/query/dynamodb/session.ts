import { Session } from "@/lib/schemas"
import { GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb"
import { ISessionQuery } from "../adapter"
import { TABLE_NAME, getDynamoDBClient } from "./dynamodb"

const SESSION_SK = "session#data"

type SessionItem = {
  pk: { S: string }
  sk: { S: string }
  username: { S: string }
  ttl: { N: string }
}

async function addSession(
  ssid: string,
  username: string,
  ttl: Date
): Promise<Session> {
  const dynamodbClient = getDynamoDBClient()

  const item: SessionItem = {
    pk: { S: formatSessionID(ssid) },
    sk: { S: SESSION_SK },
    username: { S: username },
    ttl: { N: Math.floor(ttl.getTime() / 1000).toString() },
  }

  const cmd = new PutItemCommand({
    TableName: TABLE_NAME,
    Item: item,
    ConditionExpression: "attribute_not_exists(pk)",
  })

  const { Attributes } = await dynamodbClient.send(cmd)

  if (!Attributes) {
    throw new Error("Failed to create session")
  }

  return {
    token: ssid,
    username: Attributes.username.S!,
    expireAt: ttl,
  }
}

async function getSession(ssid: string): Promise<Session | null> {
  const dynamodbClient = getDynamoDBClient()

  const { Item } = await dynamodbClient.send(
    new GetItemCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: { S: formatSessionID(ssid) },
        sk: { S: SESSION_SK },
      },
    })
  )

  if (!Item || !Item.username?.S) {
    return null
  }

  return {
    token: ssid,
    username: Item.username.S,
    expireAt: new Date(Number(Item.ttl.N!) * 1000),
  }
}

function formatSessionID(id: string) {
  return `ss#${id}`
}

const sessionQuery: ISessionQuery = {
  create: addSession,
  find: getSession,
}

export default sessionQuery
