import { prisma } from "../utils/prisma";
import createHttpError from "http-errors";
import { verify_token } from "../utils/jwt";
import { NextFunction, Request, Response } from "express";

export default async function authenticator(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const access_token = req.headers.authorization.split(" ")[1];

    const payload = await verify_token("admin", access_token);

    const user_with_id = await prisma.user.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (user_with_id) {
      return next(createHttpError(403, "access denied"));
    }

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(createHttpError(403, "access denied, token expired"));
    }

    if (error.name === "JsonWebTokenError") {
      return next(createHttpError(403, "access denied, invalid token"));
    }

    return next(createHttpError(500, "something went wrong"));
  }
}
