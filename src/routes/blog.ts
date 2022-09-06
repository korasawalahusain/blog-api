import multer from "multer";
import {
  get_blog,
  create_blog,
  delete_blog,
  publish_blog,
  get_all_blogs,
} from "../controllers/blog";
import express, { Router } from "express";

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "uploads/");
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}.${uniqueSuffix}.${file.originalname}`);
  },
});

const upload = multer({ storage: storage });
const router: Router = express.Router();

router.get("/blogs/all", get_all_blogs);

router.get("/:id", get_blog);

router.delete("/:id", delete_blog);

router.post("/create", upload.single("main_image"), create_blog);

router.patch("/:id/publish", publish_blog);

export default router;
