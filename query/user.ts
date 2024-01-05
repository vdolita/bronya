import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { getDynamoDBClient, TABLE_NAME } from "./dynamodb";

const USER_SK = "user#data";

type UserItem = {
  pk: { S: string };
  sk: { S: string };
  username: { S: string };
  password: { S: string };
};

export async function getUserByUsername(username: string) {
  const dynamodbClient = getDynamoDBClient();
  const { Item } = await dynamodbClient.send(
    new GetItemCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: { S: formatUserPk(username) },
        sk: { S: USER_SK },
      },
    })
  );

  if (!Item) {
    return null;
  }

  return {
    username: Item.username.S!,
    password: Item.password.S!,
  };
}

function formatUserPk(username: string) {
  return `user#${username}`;
}
