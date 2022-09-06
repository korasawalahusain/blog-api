import createHttpError from "http-errors";
import { NextFunction, Request, Response } from "express";

export default function authenticator(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const access_token = req.headers?.authorization?.split(" ")[1] ?? null;

  if (!access_token) {
    next(createHttpError(403, "access token required"));
  }

  return next();
}
