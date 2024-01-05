import { getLicenseByKey } from "@/query/license";
import { clientReq } from "@/schemas";
import { zodValidationRes } from "@/utils/res";

export async function POST(req: Request) {
  const data = await req.json();
  const safeData = clientReq.safeParse(data);

  if (!safeData.success) {
    return zodValidationRes(safeData.error);
  }
}

async function activate(app: string, key: string, exCode?: string) {
  // get license by key
  const license = await getLicenseByKey(key);
  if (!license) {
    return false;
  }

  // check if license is activated
  if (license.activatedAt) {
    return false;
  }

  // check if app matches
  if (license.app !== app) {
    return false;
  }
}
