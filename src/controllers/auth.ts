import argon2 from "argon2";
import { sign_jwt } from "../utils/jwt";
import { prisma } from "../utils/prisma";
import createHttpError from "http-errors";
import { Request, Response, NextFunction } from "express";
import { login_user_schema, register_user_schema } from "../validations/auth";

export const register_user = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const registerUserDto = await register_user_schema.validateAsync(req.body);

    const user_with_username = await prisma.user.findFirst({
      where: { username: registerUserDto.username },
    });

    if (user_with_username) {
      return next(createHttpError(409, "user with username already exists"));
    }

    const new_user = await prisma.user.create({
      data: {
        username: registerUserDto.username,
        password: await argon2.hash(registerUserDto.password),
      },
    });

    const access_token = sign_jwt("user", new_user.id);

    return res.status(200).json({
      code: 200,
      success: true,
      message: "user created successfully",
      access_token,
    });
  } catch (error) {
    if (error.isJoi) {
      return next(createHttpError(400, "invalid username/password"));
    }
    return next(createHttpError(500, "something went wrong"));
  }
};

export const login_user = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const loginUserDto = await login_user_schema.validateAsync(req.body);

    const user_with_username = await prisma.user.findFirst({
      where: {
        username: loginUserDto.username,
      },
    });

    if (!user_with_username) {
      return next(createHttpError(404, "user with username not found"));
    }

    if (
      !(await argon2.verify(user_with_username.password, loginUserDto.password))
    ) {
      return next(createHttpError(401, "wrong password"));
    }

    const access_token = sign_jwt("user", user_with_username.id);

    return res.status(200).json({
      code: 200,
      success: true,
      message: "user logged in successfully",
      access_token,
    });
  } catch (error) {
    if (error.isJoi) {
      return next(createHttpError(400, "invalid username/password"));
    }
    return next(createHttpError(500, "something went wrong"));
  }
};
