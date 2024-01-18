import { User } from "@/lib/schemas/user"
import {
  AttributeValue,
  GetItemCommand,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb"
import { IUserQuery } from "../adapter"
import { STATISTICS_PK, TABLE_NAME, getDynamoDBClient } from "./dynamodb"

const USER_SK = "user#data"
// const GSI_USER = "GSI_User"
const GSI_VAL = "user_gsi1"
const USER_COUNT_SK = "count#user"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type UserItem = {
  pk: { S: string }
  sk: { S: string }
  user_gsi1: { S: string }
  username: { S: string }
  password: { S: string }
}

async function getUserByUsername(username: string): Promise<User | null> {
  const dynamodbClient = getDynamoDBClient()
  const { Item } = await dynamodbClient.send(
    new GetItemCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: { S: formatUserPk(username) },
        sk: { S: USER_SK },
      },
    })
  )

  if (!Item) {
    return null
  }

  return {
    username: Item.username.S!,
    password: Item.password.S!,
  }
}

async function createUser(name: string, password: string): Promise<User> {
  const dynamodbClient = getDynamoDBClient()

  const transCmd = new TransactWriteItemsCommand({
    TransactItems: [
      {
        Put: {
          TableName: TABLE_NAME,
          Item: userToItem({
            username: name,
            password,
          }),
          ConditionExpression: "attribute_not_exists(pk)",
        },
      },
      {
        Update: {
          TableName: TABLE_NAME,
          Key: {
            pk: { S: STATISTICS_PK },
            sk: { S: USER_COUNT_SK },
          },
          UpdateExpression: "SET stat_count = stat_count + :one",
          ExpressionAttributeValues: {
            ":one": { N: "1" },
          },
        },
      },
    ],
  })

  await dynamodbClient.send(transCmd)
  return {
    username: name,
    password,
  }
}

async function countUser(): Promise<number> {
  const dynamodbClient = getDynamoDBClient()

  const cmd = new GetItemCommand({
    TableName: TABLE_NAME,
    Key: {
      pk: { S: STATISTICS_PK },
      sk: { S: USER_COUNT_SK },
    },
  })

  const { Item } = await dynamodbClient.send(cmd)
  if (!Item) {
    return 0
  }

  return parseInt(Item.stat_count.N!)
}

function userToItem(user: User): UserItem {
  return {
    pk: { S: formatUserPk(user.username) },
    sk: { S: USER_SK },
    user_gsi1: { S: GSI_VAL },
    username: { S: user.username },
    password: { S: user.password },
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function itemToUser(item: Record<string, AttributeValue>): User {
  return {
    username: item.username.S!,
    password: item.password.S!,
  }
}

function formatUserPk(username: string) {
  return `user#${username}`
}

const userQuery: IUserQuery = {
  find: getUserByUsername,
  create: createUser,
  count: countUser,
}

export default userQuery
