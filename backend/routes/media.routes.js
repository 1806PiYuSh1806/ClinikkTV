const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middlewares/auth.middleware");
const mediaController = require("../controllers/media.controller");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/upload",
  authMiddleware.authUser,
  upload.single("file"),
  mediaController.uploadMedia
);

router.get("/list", authMiddleware.authUser, mediaController.listMedia);
router.get("/list/:id", authMiddleware.authUser, mediaController.getMedia);

router.get("/stream/:id", authMiddleware.authUser, mediaController.streamMedia);
router.post("/:id/like", authMiddleware.authUser, mediaController.likeMedia);
router.post(
  "/:id/unlike",
  authMiddleware.authUser,
  mediaController.unlikeMedia
);

module.exports = router;
