import { Pager, UserStatus } from "@/lib/meta"
import { UserPerms } from "@/lib/meta/permission"
import { User } from "@/lib/schemas/user"
import {
  AttributeValue,
  GetItemCommand,
  QueryCommand,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb"
import { IUserQuery, Offset } from "../adapter"
import {
  STATISTICS_PK,
  TABLE_NAME,
  decodeLastKey,
  encodeLastKey,
  getDynamoDBClient,
} from "./dynamodb"

const USER_SK = "user#data"
const GSI_USER = "GSI_User"
const GSI_VAL = "user_gsi1"
const USER_COUNT_SK = "count#user"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type UserItem = {
  pk: { S: string }
  sk: { S: string }
  user_gsi1: { S: string }
  username: { S: string }
  password: { S: string }
  user_status: { S: string }
  user_perms: { SS: string[] }
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

  return itemToUser(Item)
}

async function getUsers(pager: Pager): Promise<[Array<User>, Offset]> {
  const dynamodbClient = getDynamoDBClient()

  const condExpr = `user_gsi1 = :gsi1`
  const exprAttrValues: Record<string, AttributeValue> = {
    ":gsi1": { S: GSI_VAL },
  }

  const lastKey = decodeLastKey(pager.offset)

  const cmd = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: GSI_USER,
    KeyConditionExpression: condExpr,
    ExpressionAttributeValues: exprAttrValues,
    Limit: pager.size,
    ExclusiveStartKey: lastKey,
  })

  const { Items, LastEvaluatedKey } = await dynamodbClient.send(cmd)
  if (!Items || Items.length === 0) {
    return [[], undefined]
  }

  const users = Items.map(itemToUser)
  return [users, encodeLastKey(LastEvaluatedKey)]
}

async function createUser(user: User): Promise<User> {
  const dynamodbClient = getDynamoDBClient()

  const transCmd = new TransactWriteItemsCommand({
    TransactItems: [
      {
        Put: {
          TableName: TABLE_NAME,
          Item: userToItem(user),
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
  const newUser = await getUserByUsername(user.username)
  if (!newUser) {
    throw new Error("create user failed")
  }

  return newUser
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
  const item: UserItem = {
    pk: { S: formatUserPk(user.username) },
    sk: { S: USER_SK },
    user_gsi1: { S: GSI_VAL },
    username: { S: user.username },
    password: { S: user.password },
    user_status: { S: user.status },
    user_perms: { SS: user.perms },
  }

  if (item.user_perms.SS.length === 0) {
    item.user_perms.SS.push("")
  }

  return item
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function itemToUser(item: Record<string, AttributeValue>): User {
  const user: User = {
    username: item.username.S!,
    password: item.password.S!,
    status: item.user_status.S! as UserStatus,
    perms: item.user_perms.SS! as UserPerms,
  }

  user.perms = user.perms.filter((p) => (p as string) !== "")
  return user
}

function formatUserPk(username: string) {
  return `user#${username}`
}

const userQuery: IUserQuery = {
  find: getUserByUsername,
  findMulti: getUsers,
  create: createUser,
  count: countUser,
}

export default userQuery
