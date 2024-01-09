import { License } from "@/schemas";

export async function fetchLicenses(url: string) {
  const response = await fetch(url);
  const resData = await response.json();

  let lastOffset: string | number | null = null;
  let licenses: License[] = [];

  if (resData.success) {
    lastOffset = resData.lastOffset ?? null;

    for (const item of resData.data) {
      licenses.push(item);
    }
  }

  return { licenses: licenses, lastOffset: lastOffset };
}

export async function updateLicense(
  key: string,
  license: Partial<Pick<License, "status" | "remarks" | "labels">>
) {
  const response = await fetch("/api/admin/license", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key,
      ...license,
    }),
  });
  const res = await response.json();
  return !!res?.success;
}
