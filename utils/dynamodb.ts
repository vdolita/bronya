import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const TABLE_NAME = "bronya-main";

let dynamodbClient: DynamoDBClient;

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
