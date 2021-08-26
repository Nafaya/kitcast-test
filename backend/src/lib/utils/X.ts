export default class X extends Error {
  code: string
  constructor(message: string, code: string) {
    super();
    this.message = message || 'Something went wrong. Try again later';
    this.code = code || 'UNKNOWN';
  }
}

export class NotFoundError extends X {
  constructor(message: string) {
    super(message, 'NOT_FOUND');
  }
}

export class BadRequestError extends X {
  constructor(message: string) {
    super(message, 'DAB_REQUEST');
  }
}

export class ValidationError extends X {
  constructor(message: string) {
    super(message, 'VALIDATION');
  }
}

export class ForbiddenError extends X {
  constructor(message: string) {
    super(message, 'FORBIDDEN');
  }
}
