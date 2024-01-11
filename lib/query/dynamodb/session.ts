import { GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb"
import { TABLE_NAME, getDynamoDBClient } from "./dynamodb"

const SESSION_SK = "session#data"

type SessionItem = {
  pk: { S: string }
  sk: { S: string }
  username: { S: string }
  ttl: { N: string }
}

export async function addSession(ssid: string, username: string, ttl: Date) {
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
  })

  await dynamodbClient.send(cmd)
}

export async function getSession(ssid: string) {
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
    username: Item.username.S,
  }
}

function formatSessionID(id: string) {
  return `ss#${id}`
}
