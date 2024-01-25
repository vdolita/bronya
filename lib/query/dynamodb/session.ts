import { Session } from "@/lib/schemas"
import { GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb"
import { ISessionQuery } from "../adapter"
import { getDynamoDBClient } from "./dynamodb"

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
  ttl: Date,
): Promise<Session> {
  const dynamodbClient = getDynamoDBClient()
  const table = process.env.DYNAMO_TABLE

  const item: SessionItem = {
    pk: { S: formatSessionID(ssid) },
    sk: { S: SESSION_SK },
    username: { S: username },
    ttl: { N: Math.floor(ttl.getTime() / 1000).toString() },
  }

  const cmd = new PutItemCommand({
    TableName: table,
    Item: item,
    ConditionExpression: "attribute_not_exists(pk)",
  })

  await dynamodbClient.send(cmd)

  return {
    token: ssid,
    username,
    expireAt: ttl,
  }
}

async function getSession(ssid: string): Promise<Session | null> {
  const dynamodbClient = getDynamoDBClient()
  const table = process.env.DYNAMO_TABLE

  const { Item } = await dynamodbClient.send(
    new GetItemCommand({
      TableName: table,
      Key: {
        pk: { S: formatSessionID(ssid) },
        sk: { S: SESSION_SK },
      },
    }),
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
