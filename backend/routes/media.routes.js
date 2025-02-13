const express = require("express");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const Media = require("../models/media.model");
const crypto = require("crypto");
const authMiddleware = require("../middlewares/auth.middleware");
const mediaController = require("../controllers/media.controller");

const router = express.Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const storage = multer.memoryStorage();
const upload = multer({ storage });
console.log("Media Controller:", mediaController);

router.post(
  "/upload",
  authMiddleware.authUser,
  upload.single("file"),
  mediaController.uploadMedia
);

module.exports = router;
