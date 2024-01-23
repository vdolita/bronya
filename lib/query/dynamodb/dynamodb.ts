import { AttributeValue, DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { Offset } from "../adapter"

export const TABLE_NAME = "bronya"
export const STATISTICS_PK = "STAT#statistics"

let dynamodbClient: DynamoDBClient

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

export function encodeLastKey(
  lastKey?: Record<string, AttributeValue>,
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
