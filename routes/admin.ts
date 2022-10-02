import express, { Router } from "express";
import { login_admin, register_admin } from "../controllers/admin";

const router: Router = express.Router();

router.post("/login", login_admin);

router.post("/register", register_admin);

export default router;
