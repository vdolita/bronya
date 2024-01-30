import { Pager, UserStatus } from "@/lib/meta"
import { PermAct } from "@/lib/permit/permission"
import { User } from "@/lib/schemas/user"
import {
  AttributeValue,
  GetItemCommand,
  QueryCommand,
  TransactWriteItemsCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb"
import { isUndefined } from "lodash"
import { IUserQuery, Offset, UserUpdate } from "../adapter"
import {
  STATISTICS_PK,
  decodeLastKey,
  encodeLastKey,
  getDynamoDBClient,
} from "./dynamodb"

export const USER_SK = "user#data"
export const GSI_USER = "GSI_User"
export const GSI_VAL = "user_gsi1"
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
  const table = process.env.DYNAMO_TABLE

  const { Item } = await dynamodbClient.send(
    new GetItemCommand({
      TableName: table,
      Key: {
        pk: { S: formatUserPk(username) },
        sk: { S: USER_SK },
      },
    }),
  )

  if (!Item) {
    return null
  }

  return itemToUser(Item)
}

async function getUsers(pager: Pager): Promise<[Array<User>, Offset]> {
  const dynamodbClient = getDynamoDBClient()
  const table = process.env.DYNAMO_TABLE

  const condExpr = `user_gsi1 = :gsi1`
  const exprAttrValues: Record<string, AttributeValue> = {
    ":gsi1": { S: GSI_VAL },
  }

  const lastKey = decodeLastKey(pager.offset)

  const cmd = new QueryCommand({
    TableName: table,
    IndexName: GSI_USER,
    KeyConditionExpression: condExpr,
    ExpressionAttributeValues: exprAttrValues,
    Limit: pager.pageSize,
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
  const table = process.env.DYNAMO_TABLE

  const transCmd = new TransactWriteItemsCommand({
    TransactItems: [
      {
        Put: {
          TableName: table,
          Item: userToItem(user),
          ConditionExpression: "attribute_not_exists(pk)",
        },
      },
      {
        Update: {
          TableName: table,
          Key: {
            pk: { S: STATISTICS_PK },
            sk: { S: USER_COUNT_SK },
          },
          UpdateExpression: "ADD stat_count :incr",
          ExpressionAttributeValues: {
            ":incr": { N: "1" },
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

async function updateUser(username: string, data: UserUpdate): Promise<void> {
  const dynamodbClient = getDynamoDBClient()
  const table = process.env.DYNAMO_TABLE

  const { password, status, perms } = data

  if (!password && !status && isUndefined(perms)) {
    return
  }

  const updateExpr = []
  const exprAttrValues: Record<string, AttributeValue> = {}

  if (password) {
    updateExpr.push("password = :password")
    exprAttrValues[":password"] = { S: password }
  }

  if (status) {
    updateExpr.push("user_status = :status")
    exprAttrValues[":status"] = { S: status }
  }

  if (!isUndefined(perms)) {
    updateExpr.push("user_perms = :perms")
    exprAttrValues[":perms"] = {
      SS: perms.length === 0 ? [""] : perms.map((p) => `${p.obj},${p.act}`),
    }
  }

  const cmd = new UpdateItemCommand({
    TableName: table,
    Key: {
      pk: { S: formatUserPk(username) },
      sk: { S: USER_SK },
    },
    UpdateExpression: `SET ${updateExpr.join(", ")}`,
    ExpressionAttributeValues: exprAttrValues,
  })

  await dynamodbClient.send(cmd)
}

async function countUser(): Promise<number> {
  const dynamodbClient = getDynamoDBClient()
  const table = process.env.DYNAMO_TABLE

  const cmd = new GetItemCommand({
    TableName: table,
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
    user_perms: { SS: user.perms.map((p) => `${p.obj},${p.act}`) ?? [""] },
  }

  return item
}

function itemToUser(item: Record<string, AttributeValue>): User {
  const user: User = {
    username: item.username.S!,
    password: item.password.S!,
    status: item.user_status.S! as UserStatus,
    perms: item.user_perms
      .SS!.filter((p) => p != "")
      .map((p) => ({
        sub: item.username.S!,
        obj: p.split(",")[0],
        act: p.split(",")[1] as PermAct,
      })),
  }

  return user
}

export function formatUserPk(username: string) {
  return `user#${username}`
}

const userQuery: IUserQuery = {
  find: getUserByUsername,
  findMulti: getUsers,
  create: createUser,
  update: updateUser,
  count: countUser,
}

export default userQuery
