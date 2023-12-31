import { STATUS_ACT } from "@/meta";
import getQueryAdapter from "@/query";
import { License } from "@/schemas";
import { v4 as uuidV4 } from "uuid";

export async function createLicense(
  app: string,
  quantity: number,
  days: number,
  totalActTimes: number,
  validFrom: Date,
  rollingDays: number,
  labels: Array<string>
) {
  const q = getQueryAdapter();
  const now = new Date();
  const licenses: License[] = [];

  for (let i = 0; i < quantity; i++) {
    const lcs: License = {
      key: uuidV4(),
      app,
      createdAt: now,
      validFrom,
      duration: days,
      status: STATUS_ACT,
      totalActCount: totalActTimes,
      balanceActCount: totalActTimes,
      remarks: "",
      labels: labels,
      rollingDays,
    };

    licenses.push(lcs);
  }

  await q.addLicenses(licenses);
}
