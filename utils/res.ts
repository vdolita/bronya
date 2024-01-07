import { ZodError } from "zod";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "./error";

export function okRes<T extends Array<K> | Record<string, unknown>, K>(
  data?: T
) {
  if (typeof data === "undefined") {
    return Response.json({
      success: true,
    });
  }

  if ("data" in data) {
    const { data: dataProp, ...rest } = data;

    return Response.json({
      success: true,
      data: dataProp,
      ...rest,
    });
  }

  return Response.json({
    success: true,
    data,
  });
}

export function badRequestRes(err: BadRequestError = new BadRequestError()) {
  return Response.json(
    {
      error: err.message,
    },
    {
      status: err.code,
    }
  );
}

export function zodValidationRes(error: ZodError) {
  return Response.json(
    {
      error: error.message,
    },
    {
      status: 400,
    }
  );
}

export function unauthorizedRes(
  err: UnauthorizedError = new UnauthorizedError()
) {
  return Response.json(
    {
      error: err.message,
    },
    { status: err.code }
  );
}

export function forbiddenRes(err: ForbiddenError = new ForbiddenError()) {
  return Response.json(
    {
      error: err.message,
    },
    {
      status: err.code,
    }
  );
}

export function notfoundRes(err: NotFoundError = new NotFoundError()) {
  return Response.json(
    {
      error: err.message,
    },
    {
      status: err.code,
    }
  );
}

export function internalErrorRes(err: Error = new Error()) {
  return Response.json(
    {
      error: "Internal error",
    },
    {
      status: 500,
    }
  );
}

export function handleErrorRes(error: unknown): Response {
  if (error instanceof ZodError) {
    return zodValidationRes(error);
  }

  if (error instanceof BadRequestError) {
    return badRequestRes(error);
  }

  if (error instanceof UnauthorizedError) {
    return unauthorizedRes(error);
  }

  if (error instanceof ForbiddenError) {
    return forbiddenRes(error);
  }

  if (error instanceof NotFoundError) {
    return notfoundRes(error);
  }

  if (error instanceof Error) {
    return internalErrorRes(error);
  }

  return internalErrorRes(new Error("Unknown error"));
}
