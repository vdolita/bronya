import { LcsStatus, Pager } from "@/lib/meta"
import { License } from "@/lib/schemas"
import { NotFoundError } from "@/lib/utils/error"
import {
  AttributeValue,
  BatchWriteItemCommand,
  BatchWriteItemCommandOutput,
  GetItemCommand,
  QueryCommand,
  UpdateItemCommand,
  WriteRequest,
} from "@aws-sdk/client-dynamodb"
import { chunk, isUndefined } from "lodash"
import { ILicenseQuery, LicenseUpdate, Offset } from "../adapter"
import {
  TABLE_NAME,
  decodeLastKey,
  encodeLastKey,
  getDynamoDBClient,
} from "./dynamodb"

export const LICENSE_SK = "license#data"
const GSI_LCS_A = "GSI_LCS-App-CreatedAt"

type LicenseItem = {
  pk: { S: string }
  sk: { S: string }
  lcs_key: { S: string }
  lcs_app: { S: string }
  lcs_createdAt: { S: string }
  lcs_validFrom: { S: string }
  lcs_duration: { N: string }
  lcs_status: { S: string }
  lcs_totalActCount: { N: string }
  lcs_balanceActCount: { N: string }
  lcs_remark: { S: string }
  lcs_rollingDays: { N: string }
  lcs_labels: { SS: string[] }
}

async function saveAppLicense(
  sample: Omit<License, "key">,
  keys: string[]
): Promise<number> {
  const dynamodbClient = getDynamoDBClient()
  const chunkedKeys = chunk(keys, 25)
  const table = TABLE_NAME

  const ps: Array<Promise<BatchWriteItemCommandOutput>> = []

  for (const chunkedKey of chunkedKeys) {
    const putReq: WriteRequest[] = chunkedKey.map((key) => ({
      PutRequest: {
        Item: licenseToItem({
          ...sample,
          key,
        }),
      },
    }))

    const command = new BatchWriteItemCommand({
      RequestItems: {
        [table]: putReq,
      },
    })

    const p = dynamodbClient.send(command)
    ps.push(p)
  }

  const results = await Promise.all(ps)

  let failedCount = 0

  for (const result of results) {
    if (result.UnprocessedItems && result.UnprocessedItems[table]) {
      failedCount += result.UnprocessedItems[table].length
    }
  }

  return failedCount
}

// get license from dynamodb by key
async function getLicenseByKey(key: string): Promise<License | null> {
  const dynamodbClient = getDynamoDBClient()
  const table = TABLE_NAME

  const cmd = new GetItemCommand({
    TableName: table,
    Key: {
      pk: { S: formatLicensePk(key) },
      sk: { S: LICENSE_SK },
    },
  })

  const { Item } = await dynamodbClient.send(cmd)

  if (!Item) {
    return null
  }

  return itemToLicense(Item)
}

// get licenses from dynamodb by app and created time
async function getLicensesByAppAndCreatedTime(
  app: string,
  createdAt: Date | undefined,
  asc = false,
  pager: Pager
): Promise<[Array<License>, Offset]> {
  const dynamodbClient = getDynamoDBClient()
  const table = TABLE_NAME

  let condExpr = "lcs_app = :app"
  if (createdAt) {
    condExpr += " AND lcs_createdAt >= :createdAt"
  }

  let exprAttrValues: Record<string, AttributeValue> = {
    ":app": { S: app },
  }
  if (createdAt) {
    exprAttrValues = {
      ...exprAttrValues,
      ":createdAt": { S: createdAt.toISOString() },
    }
  }

  const lastKey = decodeLastKey(pager.offset)

  const cmd = new QueryCommand({
    TableName: table,
    IndexName: GSI_LCS_A,
    KeyConditionExpression: condExpr,
    ExpressionAttributeValues: exprAttrValues,
    ScanIndexForward: asc,
    Limit: pager.pageSize,
    ExclusiveStartKey: lastKey,
  })

  const { Items, LastEvaluatedKey } = await dynamodbClient.send(cmd)

  if (!Items || Items.length === 0) {
    return [[], undefined]
  }

  const licenses = Items.map(itemToLicense)
  return [licenses, encodeLastKey(LastEvaluatedKey)]
}

async function* findLicensesInRange(
  app: string,
  from: Date | undefined,
  to: Date | undefined
): AsyncGenerator<Array<License>, void> {
  const dynamodbClient = getDynamoDBClient()
  const table = TABLE_NAME

  let condExpr = "lcs_app = :app"
  const exprAttrVals: Record<string, AttributeValue> = {
    ":app": { S: app },
  }

  if (from) {
    condExpr += " AND lcs_createdAt >= :from"
    exprAttrVals[":from"] = { S: from.toISOString() }
  }

  if (to) {
    condExpr += " AND lcs_createdAt <= :to"
    exprAttrVals[":to"] = { S: to.toISOString() }
  }

  let lastOffset: Record<string, AttributeValue> | undefined = undefined

  do {
    const cmd: QueryCommand = new QueryCommand({
      TableName: table,
      IndexName: GSI_LCS_A,
      KeyConditionExpression: condExpr,
      ExpressionAttributeValues: exprAttrVals,
      Limit: 200,
      ExclusiveStartKey: lastOffset,
    })

    const { Items, LastEvaluatedKey } = await dynamodbClient.send(cmd)
    if (!Items || Items.length === 0) {
      break
    }

    yield Items.map(itemToLicense)

    if (!LastEvaluatedKey) {
      break
    }

    lastOffset = LastEvaluatedKey
  } while (true)
}

// update license in dynamodb by pk and sk
async function updateLicenseByKey(
  key: string,
  data: LicenseUpdate
): Promise<License> {
  const dynamodbClient = getDynamoDBClient()
  const table = TABLE_NAME
  const condExpr = "attribute_exists(pk) AND attribute_exists(sk)"

  const cmd = new UpdateItemCommand({
    TableName: table,
    Key: {
      pk: { S: formatLicensePk(key) },
      sk: { S: LICENSE_SK },
    },
    ConditionExpression: condExpr,
    UpdateExpression: getAttrExpr(data),
    ExpressionAttributeNames: getAttrName(data),
    ExpressionAttributeValues: getAttrValue(data),
    ReturnValues: "ALL_NEW",
  })

  try {
    const { Attributes } = await dynamodbClient.send(cmd)

    if (!Attributes) {
      throw new Error("update license failed")
    }

    return itemToLicense(Attributes)
  } catch (e) {
    if (e instanceof Error && e.name === "ConditionalCheckFailedException") {
      throw new NotFoundError("Activation record not found")
    }

    throw e
  }
}

export function formatLicensePk(id: string) {
  return `license#${id}`
}

function itemToLicense(item: Record<string, AttributeValue>): License {
  const lcs: License = {
    key: item.lcs_key.S!,
    app: item.lcs_app.S!,
    createdAt: new Date(item.lcs_createdAt.S!),
    validFrom: new Date(item.lcs_validFrom.S!),
    duration: parseInt(item.lcs_duration.N!),
    status: item.lcs_status.S! as LcsStatus,
    totalActCount: parseInt(item.lcs_totalActCount.N!),
    balanceActCount: parseInt(item.lcs_balanceActCount.N!),
    rollingDays: parseInt(item.lcs_rollingDays.N!),
    remark: item.lcs_remark.S!,
    labels: item.lcs_labels?.SS ?? [],
  }

  // remove empty string
  lcs.labels = lcs.labels.filter((label) => label !== "")

  return lcs
}

function licenseToItem(license: License): LicenseItem {
  const item: LicenseItem = {
    pk: { S: formatLicensePk(license.key) },
    sk: { S: LICENSE_SK },
    lcs_key: { S: license.key },
    lcs_app: { S: license.app },
    lcs_createdAt: { S: license.createdAt.toISOString() },
    lcs_validFrom: { S: license.validFrom.toISOString() },
    lcs_duration: { N: license.duration.toString() },
    lcs_status: { S: license.status },
    lcs_totalActCount: { N: license.totalActCount.toString() },
    lcs_balanceActCount: { N: license.balanceActCount.toString() },
    lcs_rollingDays: { N: license.rollingDays.toString() },
    lcs_remark: { S: license.remark },
    lcs_labels: { SS: license.labels },
  }

  if (item.lcs_labels.SS.length === 0) {
    // use a empty string to avoid dynamodb error
    item.lcs_labels.SS.push("")
  }

  return item
}

function getAttrValue(lu: LicenseUpdate): Record<string, AttributeValue> {
  const attrValue: Record<string, AttributeValue> = {}
  const kvs = Object.entries(lu) as Entries<LicenseUpdate>

  for (const item of kvs) {
    if (!item || isUndefined(item[1])) {
      continue
    }

    const [k, v] = item
    const attrKey = `:${k}`
    let labels: string[]

    switch (k) {
      case "remark":
      case "status":
        attrValue[attrKey] = { S: v }
        break
      case "labels":
        labels = [...v]

        // use a empty string to avoid dynamodb error
        if (labels.length === 0) {
          labels.push("")
        }

        attrValue[attrKey] = { SS: labels }
        break
      default:
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-case-declarations
        const _: never = k
    }
  }

  return attrValue
}

function getAttrName(lu: LicenseUpdate): Record<string, string> {
  const attrName: Record<string, string> = {}
  const keys = Object.keys(lu) as Array<keyof LicenseUpdate>

  for (const key of keys) {
    const attrKey = `#${key}`

    if (!isUndefined(lu[key])) {
      attrName[attrKey] = `lcs_${key}`
    }
  }

  return attrName
}

function getAttrExpr(lu: LicenseUpdate): string {
  const attrExpr: string[] = []
  const keys = Object.keys(lu) as Array<keyof LicenseUpdate>

  for (const key of keys) {
    const attrKey = `#${key}`
    const attrVal = `:${key}`
    const v = lu[key]
    if (isUndefined(v)) {
      continue
    }
    attrExpr.push(`${attrKey} = ${attrVal}`)
  }

  return `SET ${attrExpr.join(", ")}`
}

const licenseQuery: ILicenseQuery = {
  createMulti: saveAppLicense,
  find: getLicenseByKey,
  findMulti: getLicensesByAppAndCreatedTime,
  findInRange: findLicensesInRange,
  update: updateLicenseByKey,
}

export default licenseQuery
