import express, { Router } from "express";
import { login_user, register_user } from "../controllers/auth";

const router: Router = express.Router();

router.post("/login", login_user);

router.post("/register", register_user);

export default router;
