import argon2 from "argon2";
import { sign_jwt } from "../utils/jwt";
import { prisma } from "../utils/prisma";
import createHttpError from "http-errors";
import {
  login_admin_schema,
  register_admin_schema,
} from "../validations/admin";
import { Request, Response, NextFunction } from "express";

export const register_admin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const createAdminDto = await register_admin_schema.validateAsync(req.body);

    const admin_with_username = await prisma.admin.findFirst({
      where: { username: createAdminDto.username },
    });

    if (admin_with_username) {
      return next(createHttpError(409, "admin with username already exists"));
    }

    const new_admin = await prisma.admin.create({
      data: {
        username: createAdminDto.username,
        password: await argon2.hash(createAdminDto.password),
      },
    });

    const access_token = sign_jwt("admin", new_admin.id);

    return res.status(200).json({
      code: 200,
      success: true,
      message: "admin created successfully",
      access_token,
    });
  } catch (error) {
    if (error.isJoi) {
      return next(createHttpError(400, "invalid username/password"));
    }
    console.log(error);
    return next(createHttpError(500, "something went wrong"));
  }
};

export const login_admin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const loginAdminDto = await login_admin_schema.validateAsync(req.body);

    const admin_with_username = await prisma.admin.findFirst({
      where: {
        username: loginAdminDto.username,
      },
    });

    if (!admin_with_username) {
      return next(createHttpError(404, "admin with username not found"));
    }

    if (
      !(await argon2.verify(
        admin_with_username.password,
        loginAdminDto.password
      ))
    ) {
      return next(createHttpError(401, "wrong password"));
    }

    const access_token = sign_jwt("admin", admin_with_username.id);

    return res.status(200).json({
      code: 200,
      success: true,
      message: "admin logged in successfully",
      access_token,
    });
  } catch (error) {
    if (error.isJoi) {
      return next(createHttpError(400, "invalid username/password"));
    }
    return next(createHttpError(500, "something went wrong"));
  }
};
