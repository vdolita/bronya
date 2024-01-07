import { ActivationRecord, ArStatus } from "@/schemas";
import {
  AttributeValue,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { TABLE_NAME, getDynamoDBClient } from "./dynamodb";

const GSI_AR_A = "GSI_AR-App-ActivatedAt";
const GSI_AR_AE = "GSI_AR-App-ExpiredAt";

type ActivationRecordItem = {
  pk: { S: string };
  sk: { S: string };
  ar_key: { S: string };
  ar_app: { S: string };
  ar_identityCode: { S: string };
  ar_rollingCode: { S: string };
  ar_activatedAt: { S: string };
  ar_expiredAt: { S: string };
  ar_rollingDays: { N: string };
  ar_status: { S: string };
  ar_nxRollingCode?: { S: string };
  ar_lastRollingAt?: { S: string };
};

type ActivationRecordUpdate = {
  status?: ArStatus;
  rollingCode?: string;
  expiredAt?: Date;
  nxRollingCode?: string;
  lastRollingAt?: Date;
};

// transaction create activation record.
// 1. put license lock for 5 seconds
// 2. put activation record
// 3. update deduct license balance
export async function addActivationRecord(
  ar: ActivationRecord
): Promise<boolean> {
  const dynamodbClient = getDynamoDBClient();
  const table = TABLE_NAME;

  const cmd = new PutItemCommand({
    TableName: table,
    Item: activationRecordToItem(ar),
    ConditionExpression:
      "attribute_not_exists(pk) AND attribute_not_exists(sk)",
  });

  try {
    await dynamodbClient.send(cmd);
    return true;
  } catch (e) {
    if (e instanceof Error && e.name === "ConditionalCheckFailedException") {
      return false;
    }

    throw e;
  }
}

// get activation records from dynamodb by app and identity code
export async function getActivationRecordByKeyAndIdCode(
  key: string,
  idCode: string
): Promise<ActivationRecord | null> {
  const dynamodbClient = getDynamoDBClient();
  const table = TABLE_NAME;

  const cmd = new GetItemCommand({
    TableName: table,
    Key: {
      pk: { S: formatActivationRecordPk(key) },
      sk: { S: formatExCodeSk(idCode) },
    },
  });

  const { Item } = await dynamodbClient.send(cmd);

  if (!Item) {
    return null;
  }

  return itemToActivationRecord(Item);
}

// get activation records from dynamodb by app and activated time
export async function getActRecordsByAppAndActivatedAt(
  app: string,
  activatedAt: Date,
  size: number,
  asc = false,
  lastKey?: Record<string, AttributeValue>
): Promise<[Array<ActivationRecord>, Record<string, AttributeValue>?]> {
  const dynamodbClient = getDynamoDBClient();
  const table = TABLE_NAME;

  const cmd = new QueryCommand({
    TableName: table,
    IndexName: GSI_AR_A,
    KeyConditionExpression: "ar_app = :app AND ar_activatedAt >= :activatedAt",
    ExpressionAttributeValues: {
      ":app": { S: app },
      ":activatedAt": { S: activatedAt.toISOString() },
    },
    ScanIndexForward: asc,
    Limit: size,
    ExclusiveStartKey: lastKey,
  });

  const { Items, LastEvaluatedKey } = await dynamodbClient.send(cmd);

  if (!Items || Items.length === 0) {
    return [[], undefined];
  }

  const records = Items.map(itemToActivationRecord);
  // sort by created time with asc var
  if (!asc) {
    records.sort((a, b) => b.activatedAt.getTime() - a.activatedAt.getTime());
  } else {
    records.sort((a, b) => a.activatedAt.getTime() - b.activatedAt.getTime());
  }

  return [records, LastEvaluatedKey];
}

// get activation records from dynamodb by app and expired time
export async function getActRecordsByAppAndExpiredAt(
  app: string,
  expiredAt: Date,
  size: number,
  asc = false,
  lastKey?: Record<string, AttributeValue>
): Promise<[Array<ActivationRecord>, Record<string, AttributeValue>?]> {
  const dynamodbClient = getDynamoDBClient();
  const table = TABLE_NAME;

  const cmd = new QueryCommand({
    TableName: table,
    IndexName: GSI_AR_AE,
    KeyConditionExpression: "ar_app = :app AND ar_expiredAt >= :expiredAt",
    ExpressionAttributeValues: {
      ":app": { S: app },
      ":expiredAt": { S: expiredAt.toISOString() },
    },
    ScanIndexForward: asc,
    Limit: size,
    ExclusiveStartKey: lastKey,
  });

  const { Items, LastEvaluatedKey } = await dynamodbClient.send(cmd);

  if (!Items || Items.length === 0) {
    return [[], undefined];
  }

  const records = Items.map(itemToActivationRecord);
  // sort by created time with asc var
  if (!asc) {
    records.sort((a, b) => b.activatedAt.getTime() - a.activatedAt.getTime());
  } else {
    records.sort((a, b) => a.activatedAt.getTime() - b.activatedAt.getTime());
  }

  return [records, LastEvaluatedKey];
}

// update activation record by key and identity code
export async function updateActivationRecordByKeyAndIdCode(
  key: string,
  idCode: string,
  data: ActivationRecordUpdate
): Promise<ActivationRecord> {
  const dynamodbClient = getDynamoDBClient();
  const table = TABLE_NAME;

  const [updateExp, expAttrVals] = getUpdateExpAndAttr(data);

  const cmd = new UpdateItemCommand({
    TableName: table,
    Key: {
      pk: { S: formatActivationRecordPk(key) },
      sk: { S: formatExCodeSk(idCode) },
    },
    UpdateExpression: updateExp,
    ExpressionAttributeValues: expAttrVals,
    ReturnValues: "ALL_NEW",
  });

  const { Attributes } = await dynamodbClient.send(cmd);

  if (!Attributes) {
    throw new Error("Update activation record failed");
  }

  return itemToActivationRecord(Attributes);
}

function formatActivationRecordPk(key: string): string {
  return `ar#${key}`;
}

function formatExCodeSk(exCode: string): string {
  return `exc#${exCode}`;
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
    ar_expiredAt,
    ar_rollingDays,
    ar_status,
    ar_nxRollingCode,
    ar_lastRollingAt,
  } = item as ActivationRecordItem;

  return {
    key: ar_key.S,
    app: ar_app.S,
    identityCode: ar_identityCode.S,
    rollingCode: ar_rollingCode.S,
    activatedAt: new Date(ar_activatedAt.S),
    expiredAt: new Date(ar_expiredAt.S),
    rollingDays: parseInt(ar_rollingDays.N),
    status: ar_status.S as ArStatus,
    nxRollingCode: ar_nxRollingCode?.S,
    lastRollingAt: ar_lastRollingAt ? new Date(ar_lastRollingAt.S) : undefined,
  };
}

function activationRecordToItem(ar: ActivationRecord): ActivationRecordItem {
  const {
    key,
    app,
    identityCode,
    rollingCode,
    activatedAt,
    expiredAt,
    rollingDays,
    status,
    nxRollingCode,
    lastRollingAt,
  } = ar;

  const item: ActivationRecordItem = {
    pk: { S: formatActivationRecordPk(key) },
    sk: { S: formatExCodeSk(identityCode) },
    ar_key: { S: key },
    ar_app: { S: app },
    ar_identityCode: { S: identityCode },
    ar_rollingCode: { S: rollingCode },
    ar_activatedAt: { S: activatedAt.toISOString() },
    ar_expiredAt: { S: expiredAt.toISOString() },
    ar_rollingDays: { N: rollingDays.toString() },
    ar_status: { S: status },
  };

  if (nxRollingCode) {
    item.ar_nxRollingCode = { S: nxRollingCode };
  }

  if (lastRollingAt) {
    item.ar_lastRollingAt = { S: lastRollingAt.toISOString() };
  }

  return item;
}

function getUpdateExpAndAttr(
  ar: ActivationRecordUpdate
): [string, Record<string, AttributeValue>] {
  const updateExp = [];
  const expAttrVals: Record<string, AttributeValue> = {};

  const { status, rollingCode, expiredAt, nxRollingCode, lastRollingAt } = ar;

  if (status) {
    updateExp.push("ar_status = :status");
    expAttrVals[":status"] = { S: status };
  }

  if (rollingCode) {
    updateExp.push("ar_rollingCode = :rollingCode");
    expAttrVals[":rollingCode"] = { S: rollingCode };
  }

  if (expiredAt) {
    updateExp.push("ar_expiredAt = :expiredAt");
    expAttrVals[":expiredAt"] = { S: expiredAt.toISOString() };
  }

  if (nxRollingCode) {
    updateExp.push("ar_nxRollingCode = :nxRollingCode");
    expAttrVals[":nxRollingCode"] = { S: nxRollingCode };
  }

  if (lastRollingAt) {
    updateExp.push("ar_lastRollingAt = :lastRollingAt");
    expAttrVals[":lastRollingAt"] = { S: lastRollingAt.toISOString() };
  }

  const expStr = updateExp.join(", ");

  return [`SET ${expStr}`, expAttrVals];
}
