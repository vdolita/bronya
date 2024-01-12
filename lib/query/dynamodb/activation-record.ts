import { StatusEnum } from "@/lib/meta"
import { ActivationRecord } from "@/lib/schemas"
import { NotFoundError } from "@/lib/utils/error"
import {
  AttributeValue,
  GetItemCommand,
  QueryCommand,
  TransactWriteItemsCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb"
import { isUndefined } from "lodash"
import { ArUpdate, Offset, Pager } from "../adapter"
import {
  TABLE_NAME,
  decodeLastKey,
  encodeLastKey,
  getDynamoDBClient,
} from "./dynamodb"
import { LICENSE_SK, formatLicensePk } from "./license"

const GSI_AR_A = "GSI_AR-App-ActivatedAt"
const GSI_AR_AE = "GSI_AR-App-ExpireAt"

type ActivationRecordItem = {
  pk: { S: string }
  sk: { S: string }
  ar_key: { S: string }
  ar_app: { S: string }
  ar_identityCode: { S: string }
  ar_rollingCode: { S: string }
  ar_activatedAt: { S: string }
  ar_expireAt: { S: string }
  ar_rollingDays: { N: string }
  ar_status: { S: string }
  ar_nxRollingCode?: { S: string }
  ar_lastRollingAt?: { S: string }
}

export async function getActRecord(
  key: string,
  identityCode: string
): Promise<ActivationRecord | null> {
  const dynamodbClient = getDynamoDBClient()
  const table = TABLE_NAME

  const cmd = new GetItemCommand({
    TableName: table,
    Key: {
      pk: { S: formatActivationRecordPk(key) },
      sk: { S: formatIdCodeSk(identityCode) },
    },
  })

  const { Item } = await dynamodbClient.send(cmd)

  if (!Item) {
    return null
  }

  return itemToActivationRecord(Item)
}

/**
 * Add activation record and deduct license balance in transaction
 * @returns true if success, false if condition check failed
 */
export async function addArAndDeductLcs(
  ar: ActivationRecord
): Promise<boolean> {
  const dynamodbClient = getDynamoDBClient()
  const table = TABLE_NAME

  const transCmd = new TransactWriteItemsCommand({
    TransactItems: [
      {
        Put: {
          TableName: table,
          Item: activationRecordToItem(ar),
          ConditionExpression:
            "attribute_not_exists(pk) AND attribute_not_exists(sk)",
        },
      },
      {
        Update: {
          TableName: table,
          Key: {
            pk: { S: formatLicensePk(ar.key) },
            sk: { S: LICENSE_SK },
          },
          UpdateExpression:
            "SET lcs_balanceActCount = lcs_balanceActCount - :one",
          ExpressionAttributeValues: {
            ":one": { N: "1" },
            ":zero": { N: "0" },
          },
          ConditionExpression: "lcs_balanceActCount > :zero",
        },
      },
    ],
  })

  try {
    await dynamodbClient.send(transCmd)
    return true
  } catch (e) {
    if (e instanceof Error && e.name === "ConditionalCheckFailedException") {
      return false
    }

    throw e
  }
}

// get activation records from dynamodb by key
export async function getActRecordsByKey(
  key: string,
  pager: Pager
): Promise<[Array<ActivationRecord>, Offset | undefined]> {
  const dynamodbClient = getDynamoDBClient()
  const table = TABLE_NAME

  const cmd = new QueryCommand({
    TableName: table,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
    ExpressionAttributeValues: {
      ":pk": { S: formatActivationRecordPk(key) },
      ":sk": { S: "idc#" },
    },
    Limit: pager.size,
    ExclusiveStartKey: decodeLastKey(pager.offset),
  })

  const { Items, LastEvaluatedKey } = await dynamodbClient.send(cmd)

  if (!Items || Items.length === 0) {
    return [[], undefined]
  }

  const records = Items.map(itemToActivationRecord)
  return [records, encodeLastKey(LastEvaluatedKey)]
}

// get activation records from dynamodb by app and activated time
export async function getActRecordsByAppAndActivatedAt(
  app: string,
  activatedAt: Date | undefined,
  asc = false,
  pager: {
    size: number
    offset?: Offset
  }
): Promise<[Array<ActivationRecord>, Offset | undefined]> {
  const dynamodbClient = getDynamoDBClient()
  const table = TABLE_NAME

  let condExpr = "ar_app = :app"
  const exprAttrVals: Record<string, AttributeValue> = {
    ":app": { S: app },
  }

  if (activatedAt) {
    condExpr += " AND ar_activatedAt >= :activatedAt"
    exprAttrVals[":activatedAt"] = { S: activatedAt.toISOString() }
  }

  const cmd = new QueryCommand({
    TableName: table,
    IndexName: GSI_AR_A,
    KeyConditionExpression: condExpr,
    ExpressionAttributeValues: exprAttrVals,
    ScanIndexForward: asc,
    Limit: pager.size,
    ExclusiveStartKey: decodeLastKey(pager.offset),
  })

  const { Items, LastEvaluatedKey } = await dynamodbClient.send(cmd)

  if (!Items || Items.length === 0) {
    return [[], undefined]
  }

  const records = Items.map(itemToActivationRecord)
  return [records, encodeLastKey(LastEvaluatedKey)]
}

// get activation records from dynamodb by app and expired time
export async function getActRecordsByAppAndExpireAt(
  app: string,
  expireAt: Date | undefined,
  asc = false,
  pager: {
    size: number
    offset?: Offset
  }
): Promise<[Array<ActivationRecord>, Offset | undefined]> {
  const dynamodbClient = getDynamoDBClient()
  const table = TABLE_NAME

  let condExpr = "ar_app = :app"
  const exprAttrVals: Record<string, AttributeValue> = {
    ":app": { S: app },
  }

  if (expireAt) {
    condExpr += " AND ar_expireAt >= :expireAt"
    exprAttrVals[":expireAt"] = { S: expireAt.toISOString() }
  }

  const cmd = new QueryCommand({
    TableName: table,
    IndexName: GSI_AR_AE,
    KeyConditionExpression: condExpr,
    ExpressionAttributeValues: exprAttrVals,
    ScanIndexForward: asc,
    Limit: pager.size,
    ExclusiveStartKey: decodeLastKey(pager.offset),
  })

  const { Items, LastEvaluatedKey } = await dynamodbClient.send(cmd)

  if (!Items || Items.length === 0) {
    return [[], undefined]
  }

  const records = Items.map(itemToActivationRecord)
  return [records, encodeLastKey(LastEvaluatedKey)]
}

// update activation record by key and identity code
export async function updateActRecordByKey(
  key: string,
  idCode: string,
  data: ArUpdate
): Promise<ActivationRecord> {
  const dynamodbClient = getDynamoDBClient()
  const table: string = TABLE_NAME

  const [updateExp, expAttrVals] = getUpdateExpAndAttr(data)
  const condExpr = "attribute_exists(pk) AND attribute_exists(sk)"

  const cmd = new UpdateItemCommand({
    TableName: table,
    Key: {
      pk: { S: formatActivationRecordPk(key) },
      sk: { S: formatIdCodeSk(idCode) },
    },
    ConditionExpression: condExpr,
    UpdateExpression: updateExp,
    ExpressionAttributeValues: expAttrVals,
    ReturnValues: "ALL_NEW",
  })

  try {
    const { Attributes } = await dynamodbClient.send(cmd)

    if (!Attributes) {
      throw new Error("Update activation record failed")
    }

    return itemToActivationRecord(Attributes)
  } catch (e) {
    if (e instanceof Error && e.name === "ConditionalCheckFailedException") {
      throw new NotFoundError("Activation record not found")
    }

    throw e
  }
}

function formatActivationRecordPk(key: string): string {
  return `ar#${key}`
}

function formatIdCodeSk(idCode: string): string {
  return `idc#${idCode}`
}

function itemToActivationRecord(
  item: Record<string, AttributeValue>
): ActivationRecord {
  const {
    ar_key,
    ar_app,
    ar_identityCode,
    ar_rollingCode,
    ar_activatedAt,
    ar_expireAt,
    ar_rollingDays,
    ar_status,
    ar_nxRollingCode,
    ar_lastRollingAt,
  } = item as ActivationRecordItem

  return {
    key: ar_key.S,
    app: ar_app.S,
    identityCode: ar_identityCode.S,
    rollingCode: ar_rollingCode.S,
    activatedAt: new Date(ar_activatedAt.S),
    expireAt: new Date(ar_expireAt.S),
    rollingDays: parseInt(ar_rollingDays.N),
    status: ar_status.S as StatusEnum,
    nxRollingCode: ar_nxRollingCode?.S,
    lastRollingAt: ar_lastRollingAt ? new Date(ar_lastRollingAt.S) : undefined,
  }
}

function activationRecordToItem(ar: ActivationRecord): ActivationRecordItem {
  const {
    key,
    app,
    identityCode,
    rollingCode,
    activatedAt,
    expireAt,
    rollingDays,
    status,
    nxRollingCode,
    lastRollingAt,
  } = ar

  const item: ActivationRecordItem = {
    pk: { S: formatActivationRecordPk(key) },
    sk: { S: formatIdCodeSk(identityCode) },
    ar_key: { S: key },
    ar_app: { S: app },
    ar_identityCode: { S: identityCode },
    ar_rollingCode: { S: rollingCode },
    ar_activatedAt: { S: activatedAt.toISOString() },
    ar_expireAt: { S: expireAt.toISOString() },
    ar_rollingDays: { N: rollingDays.toString() },
    ar_status: { S: status },
  }

  if (nxRollingCode) {
    item.ar_nxRollingCode = { S: nxRollingCode }
  }

  if (lastRollingAt) {
    item.ar_lastRollingAt = { S: lastRollingAt.toISOString() }
  }

  return item
}

function getUpdateExpAndAttr(
  ar: ArUpdate
): [string, Record<string, AttributeValue>] {
  const updateExp = []
  const expAttrVals: Record<string, AttributeValue> = {}
  const kvs = Object.entries(ar) as Entries<ArUpdate>

  for (const item of kvs) {
    if (!item || isUndefined(item[1])) {
      continue
    }

    const [k, v] = item

    switch (k) {
      case "activatedAt":
        updateExp.push("ar_activatedAt = :activatedAt")
        expAttrVals[":activatedAt"] = { S: v.toISOString() }
        break
      case "status":
        updateExp.push("ar_status = :status")
        expAttrVals[":status"] = { S: v }
        break
      case "rollingCode":
        updateExp.push("ar_rollingCode = :rollingCode")
        expAttrVals[":rollingCode"] = { S: v }
        break
      case "nxRollingCode":
        updateExp.push("ar_nxRollingCode = :nxRollingCode")
        expAttrVals[":nxRollingCode"] = { S: v }
        break
      case "lastRollingAt":
        updateExp.push("ar_lastRollingAt = :lastRollingAt")
        expAttrVals[":lastRollingAt"] = { S: v.toISOString() }
        break
      case "expireAt":
        updateExp.push("ar_expireAt = :expireAt")
        expAttrVals[":expireAt"] = { S: v.toISOString() }
        break
      default:
        // eslint-disable-next-line no-case-declarations, @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-assignment
        const _: never = k
        break
    }
  }

  const expStr = updateExp.join(", ")
  return [`SET ${expStr}`, expAttrVals]
}
