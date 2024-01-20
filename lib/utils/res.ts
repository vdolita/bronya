import { ZodError } from "zod"
import {
  BadRequestError,
  ForbiddenError,
  InternalError,
  NotFoundError,
  UnauthorizedError,
  formateZodError,
} from "./error"

export type FailRes = {
  success: false
  error: string
  errors?: string[]
}

export type SuccessRes = { success: true; data?: unknown } & Record<
  string,
  unknown
>

export type BronyaRes = FailRes | SuccessRes

export function dataToRes<T = unknown>(data: T): SuccessRes {
  if (typeof data === "undefined" || data === null) {
    return {
      success: true as const,
    }
  }

  if (Array.isArray(data)) {
    return {
      success: true as const,
      data,
    }
  }

  if (typeof data == "object" && "data" in data) {
    const { data: dataProp, ...rest } = data

    return {
      success: true as const,
      data: dataProp,
      ...rest,
    }
  }

  return {
    success: true as const,
    data,
  }
}

export function parseErrRes(err: unknown): FailRes {
  if (err instanceof BadRequestError) {
    return {
      success: false,
      error: err.message,
    }
  }

  if (err instanceof UnauthorizedError) {
    return {
      success: false,
      error: err.message,
    }
  }

  if (err instanceof ForbiddenError) {
    return {
      success: false,
      error: err.message,
    }
  }

  if (err instanceof NotFoundError) {
    return {
      success: false,
      error: err.message,
    }
  }

  if (err instanceof InternalError) {
    return {
      success: false,
      error: err.message,
    }
  }

  if (err instanceof ZodError) {
    return {
      success: false,
      error: formateZodError(err),
    }
  }

  return {
    success: false,
    error: "Internal error",
  }
}

export function okRes<T = unknown>(data?: T) {
  return Response.json(dataToRes(data))
}

export function errRes(msg: string = "Internal server error", code = 500) {
  const res: FailRes = {
    success: false,
    error: msg,
  }
  return Response.json(res, {
    status: code,
  })
}

export function badRequestRes(msg: string = "Bad request") {
  return errRes(msg, 400)
}

export function unauthorizedRes(msg: string = "Unauthorized") {
  return errRes(msg, 401)
}

export function internalErrorRes(err: unknown) {
  console.error(err)
  return errRes()
}

export function handleErrorRes(error: unknown): Response {
  if (error instanceof ZodError) {
    const msg = formateZodError(error)
    return errRes(msg, 400)
  }

  if (error instanceof BadRequestError) {
    return errRes(error.message, error.code)
  }

  if (error instanceof UnauthorizedError) {
    return errRes(error.message, error.code)
  }

  if (error instanceof ForbiddenError) {
    return errRes(error.message, error.code)
  }

  if (error instanceof NotFoundError) {
    return errRes(error.message, error.code)
  }

  return internalErrorRes(error)
}

export function isSuccessRes(res: unknown): boolean {
  if (typeof res !== "object" || res === null) {
    return false
  }

  if (!("success" in res)) {
    return false
  }

  return res.success === true
}
