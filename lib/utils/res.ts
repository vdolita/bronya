import { ZodError } from "zod"
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "./error"

export function okRes<T extends Array<K> | Record<string, unknown>, K>(
  data?: T
) {
  if (typeof data === "undefined") {
    return Response.json({
      success: true,
    })
  }

  if ("data" in data) {
    const { data: dataProp, ...rest } = data

    return Response.json({
      success: true,
      data: dataProp,
      ...rest,
    })
  }

  return Response.json({
    success: true,
    data,
  })
}

export function errRes(msg: string = "Internal server error", code = 500) {
  return Response.json(
    {
      success: false,
      error: msg,
    },
    {
      status: code,
    }
  )
}

export function badRequestRes(err: BadRequestError = new BadRequestError()) {
  return errRes(err.message, err.code)
}

export function zodValidationRes(error: ZodError) {
  return errRes(error.message, 400)
}

export function unauthorizedRes(
  err: UnauthorizedError = new UnauthorizedError()
) {
  return errRes(err.message, err.code)
}

export function forbiddenRes(err: ForbiddenError = new ForbiddenError()) {
  return errRes(err.message, err.code)
}

export function notfoundRes(err: NotFoundError = new NotFoundError()) {
  return errRes(err.message, err.code)
}

export function internalErrorRes(err: unknown) {
  console.error(err)
  return errRes()
}

export function handleErrorRes(error: unknown): Response {
  if (error instanceof ZodError) {
    return zodValidationRes(error)
  }

  if (error instanceof BadRequestError) {
    return badRequestRes(error)
  }

  if (error instanceof UnauthorizedError) {
    return unauthorizedRes(error)
  }

  if (error instanceof ForbiddenError) {
    return forbiddenRes(error)
  }

  if (error instanceof NotFoundError) {
    return notfoundRes(error)
  }

  return internalErrorRes(error)
}
