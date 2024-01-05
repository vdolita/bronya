import { License, licenseSchema } from "@/schemas";

export async function fetchLicenses(url: string) {
  const response = await fetch(url);
  const resData = await response.json();

  let resLastKey: string | null = null;
  let licenses: License[] = [];

  if (resData.success) {
    resLastKey = resData.lastKey ?? null;

    for (const item of resData.data) {
      const lcs = licenseSchema.parse(item);
      licenses.push(lcs);
    }
  }

  return { licenses: licenses, lastKey: resLastKey };
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
  await response.json();
}
