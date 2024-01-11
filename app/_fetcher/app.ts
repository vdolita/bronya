import { AppName, CreateAppReq } from "@/lib/schemas";

type fetchAppRes = {
  success: boolean;
  data: string[];
};

export async function fetchApp(): Promise<AppName[]> {
  const response = await fetch("/api/admin/app");
  const resData = (await response.json()) as fetchAppRes;

  let apps: string[] = [];

  if (resData.success) {
    apps = resData.data;
  }

  return apps;
}

export async function createApp(_: string, { arg }: { arg: CreateAppReq }) {
  const res = await fetch("/api/admin/app", {
    method: "POST",
    body: JSON.stringify(arg),
  });
  const data = (await res.json()) as { success: boolean };
  return data;
}
