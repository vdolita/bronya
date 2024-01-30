import { Perm, PermAct, UserPerms } from "@/lib/permit/permission"
import {
  AttributeValue,
  QueryCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb"
import { IPermissionQuery } from "../adapter"
import { getDynamoDBClient } from "./dynamodb"
import { GSI_USER, GSI_VAL, USER_SK, formatUserPk } from "./user"

async function getAllPermissions(): Promise<UserPerms> {
  const dynamodbClient = getDynamoDBClient()
  const table = process.env.DYNAMO_TABLE

  const condExpr = `user_gsi1 = :gsi1`
  const exprAttrValues: Record<string, AttributeValue> = {
    ":gsi1": { S: GSI_VAL },
  }

  const result: UserPerms = []
  let lastOffset: Record<string, AttributeValue> | undefined = undefined

  const loopPerms = async (
    startKey?: Record<string, AttributeValue>,
  ): Promise<Record<string, AttributeValue> | undefined> => {
    const cmd = new QueryCommand({
      TableName: table,
      IndexName: GSI_USER,
      KeyConditionExpression: condExpr,
      ExpressionAttributeValues: exprAttrValues,
      ExclusiveStartKey: startKey,
    })

    const { Items, LastEvaluatedKey } = await dynamodbClient.send(cmd)

    if (!Items || Items.length === 0) {
      return undefined
    }

    for (const item of Items) {
      const user = item.pk.S!.split("#")[1]
      const perms = item.user_perms.SS!

      for (const perm of perms) {
        const [obj, act] = perm.split(",")
        result.push({ sub: user, obj, act: act as PermAct })
      }
    }

    return LastEvaluatedKey
  }

  do {
    lastOffset = await loopPerms(lastOffset)
  } while (lastOffset)

  return result
}

async function addPermission(p: Perm): Promise<void> {
  const dynamodbClient = getDynamoDBClient()
  const table = process.env.DYNAMO_TABLE

  const cmd = new UpdateItemCommand({
    TableName: table,
    Key: {
      pk: { S: formatUserPk(p.sub) },
      sk: { S: USER_SK },
    },
    UpdateExpression: "ADD user_perms :perm",
    ExpressionAttributeValues: {
      ":perm": { SS: [`${p.obj},${p.act}`] },
    },
  })

  await dynamodbClient.send(cmd)
}

async function removePermission(perms: Perm): Promise<void> {
  const dynamodbClient = getDynamoDBClient()
  const table = process.env.DYNAMO_TABLE

  const cmd = new UpdateItemCommand({
    TableName: table,
    Key: {
      pk: { S: formatUserPk(perms.sub) },
      sk: { S: USER_SK },
    },
    UpdateExpression: "DELETE user_perms :perm",
    ExpressionAttributeValues: {
      ":perm": { SS: [`${perms.obj},${perms.act}`] },
    },
  })

  await dynamodbClient.send(cmd)
}

const permQuery: IPermissionQuery = {
  all: getAllPermissions,
  add: addPermission,
  remove: removePermission,
}

export default permQuery
