import crypto from "crypto";
import { prisma } from "../utils/prisma";
import createHttpError from "http-errors";
import { create_blog_schema } from "../validations/blog";
import { NextFunction, Request, Response } from "express";

export const create_blog = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const createBlogDto = await create_blog_schema.validateAsync(req.body);
    const { user_id } = req;

    const created_blog = await prisma.blog.create({
      data: {
        title: createBlogDto.title,
        slug: createBlogDto.title
          .toLowerCase()
          .replaceAll(" ", "-")
          .concat(`-${crypto.randomBytes(5).toString("hex")}`),
        body: createBlogDto.body,
        author: {
          connect: {
            id: user_id,
          },
        },
        published: false,
        main_image: `http://localhost:4000/public/${req.file.filename}`,
      },
    });

    return res.status(200).json({
      code: 200,
      success: true,
      message: "blog drafted successfully",
      dreafted_blog: created_blog,
    });
  } catch (error) {
    if (error.isJoi) {
      return next(createHttpError(400, "invalid input values"));
    }

    console.log(error);
    return next(createHttpError(500, "something went wrong"));
  }
};

export const delete_blog = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: blog_id } = req.params;
    const { user_id } = req;

    const blog_found = await prisma.blog.findFirst({
      where: {
        id: blog_id,
      },
    });

    if (!blog_found) {
      return next(createHttpError(404, "blog not found"));
    }

    if (blog_found.author_id !== user_id) {
      return next(
        createHttpError(403, "access denied, not the owner of the blog")
      );
    }

    await prisma.blog.delete({
      where: {
        id: blog_id,
      },
    });

    return res.status(200).json({
      code: 200,
      success: true,
      message: "blog deleted successfully",
      deleted_blog: blog_found,
    });
  } catch (error) {
    if (error.isJoi) {
      return next(createHttpError(400, "invalid input values"));
    }

    return next(createHttpError(500, "something went wrong"));
  }
};

export const publish_blog = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: blog_id } = req.params;
    const { user_id } = req;

    const blog_found = await prisma.blog.findFirst({
      where: {
        id: blog_id,
      },
    });

    if (!blog_found) {
      return next(createHttpError(404, "blog not found"));
    }

    if (blog_found.author_id !== user_id) {
      return next(
        createHttpError(403, "access denied, not the owner of the blog")
      );
    }

    await prisma.blog.update({
      where: {
        id: blog_id,
      },
      data: {
        published: true,
        published_at: new Date().toISOString(),
      },
    });

    return res.status(200).json({
      code: 200,
      success: true,
      message: "blog published successfully",
      deleted_blog: blog_found,
    });
  } catch (error) {
    if (error.isJoi) {
      return next(createHttpError(400, "invalid input values"));
    }

    return next(createHttpError(500, "something went wrong"));
  }
};

export const get_blog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: blog_id } = req.params;

  const blog_found = await prisma.blog.findFirst({
    where: {
      id: blog_id,
      published: true,
    },
  });

  if (!blog_found) {
    return next(createHttpError(404, "blog not found"));
  }

  return res.status(200).json({
    code: 200,
    success: true,
    message: "blog found successfully",
    blog: blog_found,
  });
};

export const get_all_blogs = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = req.user_id;

    const following_blogs = await prisma.user.findFirst({
      where: {
        id: user_id,
      },
      select: {
        following: {
          select: {
            blogs: true,
          },
        },
      },
    });

    return res.status(200).json({
      code: 200,
      success: true,
      message: "blogs fetched successfully",
      blogs: following_blogs.following
        .map((data) => data.blogs)
        .flat()
        .filter((blog) => blog.published === true),
    });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "something went wrong"));
  }
};
