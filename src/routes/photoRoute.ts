import { Router } from "express";
import {
  uploadPhoto,
  getMyPhotos,
  getUserPhotos,
  deletePhoto,
  getAllUserPhotos,
} from "../controllers/photoController";
import upload from "../middlewares/uploadMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getAllUserPhotos);
router.post("/", authMiddleware, upload.single("photo"), uploadPhoto);
router.get("/me", authMiddleware, getMyPhotos);
router.get("/user/:id", getUserPhotos);
router.delete("/:id", authMiddleware, deletePhoto);

export default router;
