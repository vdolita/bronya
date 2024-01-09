import { ActivationRecord } from "@/schemas";

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
