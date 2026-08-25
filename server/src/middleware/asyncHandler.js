/**
 * Express 4 does not catch rejected promises from route handlers — an async
 * throw hangs the request instead of reaching the error middleware. Every async
 * handler goes through this.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
