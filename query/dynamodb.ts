import {
  CreateTableCommand,
  DynamoDBClient,
  ListTablesCommand,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const TABLE_NAME = "bronya";

let dynamodbClient: DynamoDBClient;
let dynamodbDocClient: DynamoDBDocumentClient;

export const getDynamoDBClient = () => {
  if (!dynamodbClient) {
    dynamodbClient = new DynamoDBClient({
      region: process.env.AWS_REGION,
      endpoint:
        process.env.NODE_ENV === "development"
          ? process.env.LOCAL_DYNAMODB_ENDPOINT
          : undefined,
    });
  }

  return dynamodbClient;
};

export const getDynamoDBDocClient = () => {
  if (!dynamodbDocClient) {
    const dbClient = getDynamoDBClient();
    dynamodbDocClient = DynamoDBDocumentClient.from(dbClient);
  }

  return dynamodbDocClient;
};

export async function initDynamodb() {
  const dynamodbClient = getDynamoDBClient();

  // check if table exists
  const listTableCmd = new ListTablesCommand({});
  const { TableNames } = await dynamodbClient.send(listTableCmd);

  if (TableNames?.includes(TABLE_NAME)) {
    return;
  }

  // create table
  const createTableCmd = new CreateTableCommand({
    TableName: TABLE_NAME,
    AttributeDefinitions: [
      {
        AttributeName: "pk",
        AttributeType: "S",
      },
      {
        AttributeName: "sk",
        AttributeType: "S",
      },
    ],
    KeySchema: [
      {
        AttributeName: "pk",
        KeyType: "HASH",
      },
      {
        AttributeName: "sk",
        KeyType: "RANGE",
      },
    ],
  });
}
