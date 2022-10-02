import express, { Router } from "express";
import { AdminAuth, UserAuth } from "../middlewares";
import {
  get_user,
  get_users,
  create_user,
  delete_user,
  follow_user,
  unfollow_user,
} from "../controllers/user";

const router: Router = express.Router();

router.get("/users/all", AdminAuth, get_users);

router.post("/create", AdminAuth, create_user);

router.delete("/:username", AdminAuth, delete_user);

router.get("/:username", UserAuth, get_user);

router.put("/:username/follow", UserAuth, follow_user);

router.put("/:username/unfollow", UserAuth, unfollow_user);

export default router;
