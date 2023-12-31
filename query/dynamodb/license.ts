import { License, LicenseStatus } from "@/schemas";
import {
  AttributeValue,
  BatchGetItemCommand,
  BatchWriteItemCommand,
  BatchWriteItemCommandOutput,
  GetItemCommand,
  QueryCommand,
  UpdateItemCommand,
  WriteRequest,
} from "@aws-sdk/client-dynamodb";
import { chunk, isUndefined } from "lodash";
import { Offset, Pager } from "../adapter";
import {
  TABLE_NAME,
  decodeLastKey,
  encodeLastKey,
  getDynamoDBClient,
} from "./dynamodb";

export const LICENSE_SK = "license#data";
const GSI_LCS_A = "GSI_LCS-App-CreatedAt";

type LicenseItem = {
  pk: { S: string };
  sk: { S: string };
  lcs_key: { S: string };
  lcs_app: { S: string };
  lcs_createdAt: { S: string };
  lcs_validFrom: { S: string };
  lcs_duration: { N: string };
  lcs_status: { S: string };
  lcs_totalActCount: { N: string };
  lcs_balanceActCount: { N: string };
  lcs_remarks: { S: string };
  lcs_rollingDays: { N: string };
  lcs_labels: { SS: string[] };
};

type LicenseUpdate = {
  status?: LicenseStatus;
  remarks?: string;
  labels?: Array<string>;
};

// save licenses to dynamodb, return number of licenses failed to save
export async function addLicenses(
  licenses: ReadonlyArray<License>
): Promise<number> {
  const dynamodbClient = getDynamoDBClient();
  const chunkedLicenses = chunk(licenses, 25);
  const table = TABLE_NAME;

  const ps: Array<Promise<BatchWriteItemCommandOutput>> = [];

  for (const chunkedLicense of chunkedLicenses) {
    const putReq: WriteRequest[] = chunkedLicense.map((license) => ({
      PutRequest: {
        Item: licenseToItem(license),
      },
    }));

    const command = new BatchWriteItemCommand({
      RequestItems: {
        [table]: putReq,
      },
    });

    const p = dynamodbClient.send(command);
    ps.push(p);
  }

  const results = await Promise.all(ps);

  let failedCount = 0;

  for (const result of results) {
    if (result.UnprocessedItems && result.UnprocessedItems[table]) {
      failedCount += result.UnprocessedItems[table].length;
    }
  }

  return failedCount;
}

// get license from dynamodb by key
export async function getLicenseByKey(key: string): Promise<License | null> {
  const dynamodbClient = getDynamoDBClient();
  const table = TABLE_NAME;

  const cmd = new GetItemCommand({
    TableName: table,
    Key: {
      pk: { S: formatLicensePk(key) },
      sk: { S: LICENSE_SK },
    },
  });

  const { Item } = await dynamodbClient.send(cmd);

  if (!Item) {
    return null;
  }

  return itemToLicense(Item);
}

// get licenses from dynamodb by app and created time
export async function getLicensesByAppAndCreatedTime(
  app: string,
  createdAt: Date | undefined,
  asc = false,
  pager: Pager
): Promise<[Array<License>, Offset | undefined]> {
  const dynamodbClient = getDynamoDBClient();
  const table = TABLE_NAME;

  let condExpr = "lcs_app = :app";
  if (createdAt) {
    condExpr += " AND lcs_createdAt >= :createdAt";
  }

  let exprAttrValues: Record<string, AttributeValue> = {
    ":app": { S: app },
  };
  if (createdAt) {
    exprAttrValues = {
      ...exprAttrValues,
      ":createdAt": { S: createdAt.toISOString() },
    };
  }

  const lastKey = decodeLastKey(pager.offset);

  const cmd = new QueryCommand({
    TableName: table,
    IndexName: GSI_LCS_A,
    KeyConditionExpression: condExpr,
    ExpressionAttributeValues: exprAttrValues,
    ScanIndexForward: asc,
    Limit: pager.size,
    ExclusiveStartKey: lastKey,
  });

  const { Items, LastEvaluatedKey } = await dynamodbClient.send(cmd);

  if (!Items || Items.length === 0) {
    return [[], undefined];
  }

  const licenses = Items.map(itemToLicense);
  // sort by created time with asc var
  if (!asc) {
    licenses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } else {
    licenses.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  return [licenses, encodeLastKey(LastEvaluatedKey)];
}

// update license in dynamodb by pk and sk
export async function updateLicenseByKey(
  key: string,
  data: LicenseUpdate
): Promise<License> {
  const dynamodbClient = getDynamoDBClient();
  const table = TABLE_NAME;

  const cmd = new UpdateItemCommand({
    TableName: table,
    Key: {
      pk: { S: formatLicensePk(key) },
      sk: { S: LICENSE_SK },
    },
    UpdateExpression: getAttrExpr(data),
    ExpressionAttributeNames: getAttrName(data),
    ExpressionAttributeValues: getAttrValue(data),
    ReturnValues: "ALL_NEW",
  });

  const { Attributes } = await dynamodbClient.send(cmd);

  if (!Attributes) {
    throw new Error("update license failed");
  }

  return itemToLicense(Attributes);
}

async function getLicensesByPkSk(
  keys: ReadonlyArray<{ pk: string; sk: string }>
): Promise<Array<License>> {
  const dynamodbClient = getDynamoDBClient();
  const table = TABLE_NAME;

  const licenses: License[] = [];

  // max 100 items per request
  const chunkedKeys = chunk(keys, 100);
  for (const chunkedKey of chunkedKeys) {
    const cmd = new BatchGetItemCommand({
      RequestItems: {
        [table]: {
          Keys: chunkedKey.map(({ pk, sk }) => ({
            pk: { S: pk },
            sk: { S: sk },
          })),
        },
      },
    });

    const { Responses } = await dynamodbClient.send(cmd);

    if (!Responses) {
      continue;
    }

    for (const item of Responses[table]) {
      licenses.push(itemToLicense(item));
    }
  }

  return licenses;
}

export function formatLicensePk(id: string) {
  return `license#${id}`;
}

function itemToLicense(item: Record<string, AttributeValue>): License {
  const lcs: License = {
    key: item.lcs_key.S!,
    app: item.lcs_app.S!,
    createdAt: new Date(item.lcs_createdAt.S!),
    validFrom: new Date(item.lcs_validFrom.S!),
    duration: parseInt(item.lcs_duration.N!),
    status: item.lcs_status.S! as LicenseStatus,
    totalActCount: parseInt(item.lcs_totalActCount.N!),
    balanceActCount: parseInt(item.lcs_balanceActCount.N!),
    rollingDays: parseInt(item.lcs_rollingDays.N!),
    remarks: item.lcs_remarks.S!,
    labels: item.lcs_labels?.SS ?? [],
  };

  // remove empty string
  lcs.labels = lcs.labels.filter((label) => label !== "");

  return lcs;
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
    lcs_remarks: { S: license.remarks },
    lcs_labels: { SS: license.labels },
  };

  if (item.lcs_labels.SS.length === 0) {
    // use a empty string to avoid dynamodb error
    item.lcs_labels.SS.push("");
  }

  return item;
}

function getAttrValue(lu: LicenseUpdate): Record<string, AttributeValue> {
  const attrValue: Record<string, AttributeValue> = {};
  const keys = Object.keys(lu) as Array<keyof LicenseUpdate>;

  for (const key of keys) {
    const attrKey = `:${key}`;
    const v = lu[key];

    if (isUndefined(v)) {
      continue;
    }

    switch (key) {
      case "remarks":
      case "status":
        attrValue[attrKey] = { S: v as string };
        break;
      case "labels":
        const labels = Array.from(v as Array<string>);

        // use a empty string to avoid dynamodb error
        if (labels.length === 0) {
          labels.push("");
        }

        attrValue[attrKey] = { SS: labels };
        break;
      default:
        const x: never = key;
        throw new Error(`unknown key ${x}`);
    }
  }

  return attrValue;
}

function getAttrName(lu: LicenseUpdate): Record<string, string> {
  const attrName: Record<string, string> = {};
  const keys = Object.keys(lu) as Array<keyof LicenseUpdate>;

  for (const key of keys) {
    const attrKey = `#${key}`;

    if (!isUndefined(lu[key])) {
      attrName[attrKey] = `lcs_${key}`;
    }
  }

  return attrName;
}

function getAttrExpr(lu: LicenseUpdate): string {
  const attrExpr: string[] = [];
  const keys = Object.keys(lu) as Array<keyof LicenseUpdate>;

  for (const key of keys) {
    const attrKey = `#${key}`;
    const attrVal = `:${key}`;
    const v = lu[key];
    if (isUndefined(v)) {
      continue;
    }
    attrExpr.push(`${attrKey} = ${attrVal}`);
  }

  return `SET ${attrExpr.join(", ")}`;
}
