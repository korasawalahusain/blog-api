import argon2 from "argon2";
import { prisma } from "../utils/prisma";
import createHttpError from "http-errors";
import { create_user_schema } from "../validations/user";
import { NextFunction, Request, Response } from "express";

export const create_user = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const createUserDto = await create_user_schema.validateAsync(req.body);

    const user_with_username = await prisma.user.findFirst({
      where: { username: createUserDto.username },
    });

    if (user_with_username) {
      return next(createHttpError(409, "user with username already exists"));
    }

    const new_user = await prisma.user.create({
      data: {
        username: createUserDto.username,
        password: await argon2.hash(createUserDto.password),
      },
    });

    return res.status(200).json({
      code: 200,
      success: true,
      message: "user created successfully",
      new_user,
    });
  } catch (error) {
    if (error.isJoi) {
      return next(createHttpError(400, "invalid username/password"));
    }
    return next(createHttpError(500, "something went wrong"));
  }
};

export const delete_user = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;

    const user_with_username = await prisma.user.findUnique({
      where: { username },
    });

    if (!user_with_username) {
      return next(createHttpError(404, `user with ${username} not found`));
    }

    const deleted_user = await prisma.user.delete({
      where: { username },
    });

    return res.status(200).json({
      code: 200,
      success: true,
      message: "user deleted successfully",
      deleted_user,
    });
  } catch (error) {
    return next(createHttpError(500, "something went wrong"));
  }
};

export const get_users = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(200).json({
    code: 200,
    success: true,
    message: "succefully fetched users",
    users: await prisma.user.findMany({}),
  });
};

export const follow_user = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const follower_id = req.user_id;
    const { username: following_username } = req.params;

    const user_with_username = await prisma.user.findUnique({
      where: {
        username: following_username,
      },
    });

    if (!user_with_username) {
      return next(
        createHttpError(404, `user with ${following_username} not found`)
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: follower_id,
        },
        data: {
          following: {
            connect: {
              username: following_username,
            },
          },
        },
      }),
      prisma.user.update({
        where: {
          username: following_username,
        },
        data: {
          followers: {
            connect: {
              id: follower_id,
            },
          },
        },
      }),
    ]);

    return res.status(201).json({
      code: 201,
      success: true,
      message: "user followed successfully",
    });
  } catch (error) {
    return next(createHttpError(500, "something went wrong"));
  }
};

export const unfollow_user = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const follower_id = req.user_id;
    const { username: following_username } = req.params;

    const user_with_username = await prisma.user.findUnique({
      where: {
        username: following_username,
      },
    });

    if (!user_with_username) {
      return next(
        createHttpError(404, `user with ${following_username} not found`)
      );
    }

    const follower_following = await prisma.user.findFirst({
      where: {
        id: follower_id,
        following: {
          some: {
            username: following_username,
          },
        },
      },
    });

    if (!follower_following) {
      return next(createHttpError(409, "not following"));
    }

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: follower_id,
        },
        data: {
          following: {
            disconnect: {
              username: following_username,
            },
          },
        },
      }),
      prisma.user.update({
        where: {
          username: following_username,
        },
        data: {
          followers: {
            disconnect: {
              id: follower_id,
            },
          },
        },
      }),
    ]);

    return res.status(201).json({
      code: 201,
      success: true,
      message: "user unfollowed successfully",
    });
  } catch (error) {
    return next(createHttpError(500, "something went wrong"));
  }
};

export const get_user = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;

    const user_with_username = await prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        status: true,
        followers: {
          select: {
            username: true,
            status: true,
          },
        },
        following: {
          select: {
            username: true,
            status: true,
          },
        },
      },
    });

    if (!user_with_username) {
      return next(createHttpError(404, `user with ${username} not found`));
    }

    return res.status(200).json({
      code: 200,
      success: true,
      message: "user found successfully",
      user: user_with_username,
    });
  } catch (error) {
    return next(createHttpError(500, "something went wrong"));
  }
};
