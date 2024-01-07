import { activationReq } from "@/schemas/activation-req";
import { zodValidationRes } from "@/utils/res";

export async function POST(req: Request) {
  const data = await req.json();
  const safeData = activationReq.safeParse(data);

  if (!safeData.success) {
    return zodValidationRes(safeData.error);
  }
}
