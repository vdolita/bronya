import { AppName } from "@/schemas";

export async function fetchApp(_: string): Promise<AppName[]> {
  const response = await fetch("/api/admin/app");
  const resData = await response.json();

  let apps: string[] = [];

  if (resData.success) {
    apps = resData.data;
  }

  return apps;
}
