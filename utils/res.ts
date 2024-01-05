import { ZodError } from "zod";

export function unauthorizedRes(msg = "Unauthorized") {
  return Response.json(
    {
      error: msg,
    },
    { status: 401 }
  );
}

export function notfoundRes(msg = "Not found") {
  return Response.json(
    {
      error: msg,
    },
    {
      status: 404,
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

export function internalErrorRes(msg = "Internal error") {
  return Response.json(
    {
      error: msg,
    },
    {
      status: 500,
    }
  );
}

export function badRequestRes(msg = "Bad request") {
  return Response.json(
    {
      error: msg,
    },
    {
      status: 400,
    }
  );
}
