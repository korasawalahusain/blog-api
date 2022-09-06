import { prisma } from "../utils/prisma";
import createHttpError from "http-errors";
import { verify_token } from "../utils/jwt";
import { NextFunction, Response } from "express";

export default async function authenticator(
  req: any,
  _res: Response,
  next: NextFunction
) {
  try {
    const access_token = req.headers.authorization.split(" ")[1];

    const payload = await verify_token("user", access_token);

    const admin_with_id = await prisma.admin.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (admin_with_id) {
      return next(createHttpError(403, "access denied"));
    }

    const user_with_id = await prisma.user.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (!user_with_id) {
      return next(createHttpError(403, "access denied"));
    }

    req.user_id = user_with_id.id;
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
