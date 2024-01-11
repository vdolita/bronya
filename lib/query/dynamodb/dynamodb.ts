import { AttributeValue, DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"
import { Offset } from "../adapter"

export const TABLE_NAME = "bronya"

let dynamodbClient: DynamoDBClient
let dynamodbDocClient: DynamoDBDocumentClient

export const getDynamoDBClient = () => {
  if (!dynamodbClient) {
    dynamodbClient = new DynamoDBClient({
      region: process.env.AWS_REGION,
      endpoint:
        process.env.NODE_ENV === "development"
          ? process.env.LOCAL_DYNAMODB_ENDPOINT
          : undefined,
    })
  }

  return dynamodbClient
}

export const getDynamoDBDocClient = () => {
  if (!dynamodbDocClient) {
    const dbClient = getDynamoDBClient()
    dynamodbDocClient = DynamoDBDocumentClient.from(dbClient)
  }

  return dynamodbDocClient
}

export function encodeLastKey(
  lastKey?: Record<string, AttributeValue>
): Offset | undefined {
  if (!lastKey) {
    return undefined
  }

  const buf = Buffer.from(JSON.stringify(lastKey))
  return buf.toString("base64url")
}

export function decodeLastKey(encodedLastKey?: Offset) {
  if (!encodedLastKey) {
    return undefined
  }

  const buf = Buffer.from(encodedLastKey.toString(), "base64url")
  return JSON.parse(buf.toString("utf-8")) as Record<string, AttributeValue>
}
