// create a custom BadRequestError class
export class BadRequestError extends Error {
  code = 400;

  constructor(message: string = "Bad request") {
    super(message);
    this.name = "BadRequestError";
  }
}

// create a custom UnauthorizedError class
export class UnauthorizedError extends Error {
  code = 401;

  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

// create a custom ForbiddenError class
export class ForbiddenError extends Error {
  code = 403;

  constructor(message: string = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

// create a custom NotFoundError class
export class NotFoundError extends Error {
  code = 404;

  constructor(message: string = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

// create a custom InternalError class
export class InternalError extends Error {
  code = 500;

  constructor(message: string = "Internal error") {
    super(message);
    this.name = "InternalError";
  }
}
