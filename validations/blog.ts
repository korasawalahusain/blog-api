import Joi from "joi";

export const create_blog_schema = Joi.object({
  title: Joi.string().trim().min(10).max(50),
  body: Joi.string().trim(),
});
