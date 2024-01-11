import { GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { TABLE_NAME, getDynamoDBClient } from "./dynamodb";

const APP_PK = "app";
const APP_SK = "app#set";
const APP_SETS_KEY = "appSets";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AppItem = {
  pk: { S: string };
  sk: string;
  appSets: string[];
};

export async function getApps(): Promise<Array<string>> {
  const dynamodbClient = getDynamoDBClient();

  const cmd = new GetItemCommand({
    TableName: TABLE_NAME,
    Key: {
      pk: { S: APP_PK },
      sk: { S: APP_SK },
    },
  });

  const { Item } = await dynamodbClient.send(cmd);

  if (!Item || !Item[APP_SETS_KEY]?.SS) {
    return [];
  }

  return Item[APP_SETS_KEY].SS;
}

export async function addApp(appName: string) {
  const dynamodbClient = getDynamoDBClient();

  const cmd = new UpdateItemCommand({
    TableName: TABLE_NAME,
    Key: {
      pk: { S: APP_PK },
      sk: { S: APP_SK },
    },
    UpdateExpression: `ADD ${APP_SETS_KEY} :app`,
    ExpressionAttributeValues: {
      ":app": {
        SS: [appName],
      },
    },
  });

  await dynamodbClient.send(cmd);
}
