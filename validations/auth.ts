import Joi from "joi";

export const register_user_schema = Joi.object({
  username: Joi.string().trim().required().min(4).max(16),
  password: Joi.string().trim().required().min(4).max(16),
});

export const login_user_schema = Joi.object({
  username: Joi.string().trim().required().min(4).max(16),
  password: Joi.string().trim().required().min(4).max(16),
});
