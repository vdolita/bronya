import { isAuthenticated } from "@/lib/auth/helper"
import getQueryAdapter from "@/lib/query"
import { exportReq } from "@/lib/schemas/export-req"
import { errRes, handleErrorRes, unauthorizedRes } from "@/lib/utils/res"
import { format } from "date-fns"

export async function GET(req: Request) {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return unauthorizedRes()
  }

  const { searchParams } = new URL(req.url)
  const safeData = exportReq.safeParse(Object.fromEntries(searchParams))

  if (!safeData.success) {
    return handleErrorRes(safeData.error)
  }

  const { app, type, from, to } = safeData.data

  const { license: lq, actRecord: arq } = getQueryAdapter()
  const encoder = new TextEncoder()

  if (type == "lcs") {
    const result = lq.findInRange(app, from, to)

    // create csv content from result with nodejs stream
    const stream = new ReadableStream({
      start(controller) {
        // csv header
        controller.enqueue(
          encoder.encode(
            "Key,App,Create At,Valid From,Duration,Status,Total activation times,Balance activation times,Remark,Rolling days,Labels\n"
          )
        )
      },
      async pull(controller) {
        const nx = await result.next()
        const { done, value } = nx

        if (done) {
          controller.close()
          return
        }

        const encodedText = encoder.encode(
          value
            .map(
              (lcs) =>
                `${lcs.key},${
                  lcs.app
                },${lcs.createdAt.toISOString()},${lcs.validFrom.toISOString()},${
                  lcs.duration
                },${lcs.status},${lcs.totalActCount},${lcs.balanceActCount},"${
                  lcs.remark
                }",${lcs.rollingDays},"${lcs.labels.join(",")}"\n`
            )
            .join("")
        )

        controller.enqueue(encodedText)
      },
    })

    const todayStr = format(new Date(), "yyyyMMdd")
    const filename = `${app}-${todayStr}-licenses.csv`

    return new Response(stream, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=${filename}`,
      },
    })
  }

  if (type == "ar") {
    const result = arq.findInRange(app, from, to)

    // create csv content from result with nodejs stream
    const stream = new ReadableStream({
      start(controller) {
        // csv header
        controller.enqueue(
          encoder.encode(
            "Key,Identity code,Activated at,Expire at,Rolling days,Status,Rolling Code,Last rolling at,Remark,Next rolling code,Labels\n"
          )
        )
      },
      async pull(controller) {
        const nx = await result.next()
        const { done, value } = nx

        if (done) {
          controller.close()
          return
        }

        const encodedText = encoder.encode(
          value
            .map(
              (ar) =>
                `${ar.key},${
                  ar.identityCode
                },${ar.activatedAt.toISOString()},${ar.expireAt.toISOString()},${
                  ar.rollingDays
                },${ar.status},${ar.rollingCode},${
                  ar.lastRollingAt?.toISOString() || ""
                },"${ar.remark}",${ar.nxRollingCode || ""},"${ar.labels.join(
                  ","
                )}"\n`
            )
            .join("")
        )

        controller.enqueue(encodedText)
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=${app}-activation-records.csv`,
      },
    })
  }

  return errRes("unknown type", 400)
}
