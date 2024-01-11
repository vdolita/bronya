import { CreateLicenseReq, License, UpdateLicenseReq } from "@/lib/schemas";

type FetchLicenseRes = {
  success: boolean;
  data: License[];
  lastOffset?: string | number;
};

export async function fetchLicenses(url: string) {
  const response = await fetch(url);
  const resData = (await response.json()) as FetchLicenseRes;

  let lastOffset: string | number | null = null;
  const licenses: License[] = [];

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
  license: Omit<UpdateLicenseReq, "key">,
) {
  const response = await fetch("/api/admin/license", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...license,
      key,
    }),
  });
  const res = (await response.json()) as { success: boolean };
  return !!res?.success;
}

export async function createLicense(
  _: string,
  { arg }: { arg: CreateLicenseReq },
) {
  const res = await fetch("/api/admin/license", {
    method: "POST",
    body: JSON.stringify(arg),
  });
  const data = (await res.json()) as { success: boolean };
  return data;
}
