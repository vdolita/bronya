import { GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { getDynamoDBClient, TABLE_NAME } from "./dynamodb";
import crypto from "crypto";

const SESSION_SK = "session";
const DEFAULT_SESSION_TTL = 60 * 60 * 2; // 2 hours

export const newSession = async (username: string) => {
  const ssid = generateSessionID();
  const ttl = Number(process.env.SESSION_TTL) || DEFAULT_SESSION_TTL;
  const expires = Math.floor(Date.now() / 1000) + ttl;
  const dynamodbClient = getDynamoDBClient();

  await dynamodbClient.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        pk: { S: formatSessionID(ssid) },
        sk: { S: SESSION_SK },
        username: { S: username },
        ttl: { N: expires.toString() },
      },
    })
  );

  return ssid;
};

export const getSession = async (ssid: string) => {
  const dynamodbClient = getDynamoDBClient();

  const { Item } = await dynamodbClient.send(
    new GetItemCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: { S: formatSessionID(ssid) },
        sk: { S: SESSION_SK },
      },
    })
  );

  if (!Item) {
    return null;
  }

  return {
    username: Item.username.S!,
  };
};

function formatSessionID(id: string) {
  return `session#${id}`;
}

function generateSessionID() {
  // generate a random string with hex characters
  const buffer = crypto.randomBytes(32);
  return buffer.toString("hex");
}
