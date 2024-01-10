import { ActivationRecord, UpdateActRecordReq } from "@/schemas";

export async function fetchActRecords(url: string) {
  const response = await fetch(url.toString());
  const resData = await response.json();

  let lastOffset: string | number | null = null;
  let actRecords: ActivationRecord[] = [];

  if (resData.success) {
    lastOffset = resData.lastOffset ?? null;

    for (const item of resData.data) {
      actRecords.push(item);
    }
  }

  return { actRecords: actRecords, lastOffset: lastOffset };
}

export async function updateActRecord(
  key: string,
  idCode: string,
  data: Omit<UpdateActRecordReq, "key" | "idCode">
) {
  const response = await fetch("/api/admin/activation-records", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      key,
      idCode,
    }),
  });
  const res = await response.json();
  return !!res?.success;
}
