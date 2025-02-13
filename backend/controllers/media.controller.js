const Media = require("../models/media.model");
const mediaService = require("../services/media.service");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const randomFileName = (originalName) => {
  const ext = originalName.split(".").pop();
  return `media/${crypto.randomUUID()}.${ext}`;
};

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "File upload failed" });

    const { title, description } = req.body;
    if (!title || !description)
      return res
        .status(400)
        .json({ message: "Title and description are required" });

    // Generate unique file key
    const fileKey = randomFileName(req.file.originalname);

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: "public-read",
    };

    await s3.send(new PutObjectCommand(uploadParams));

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    const media = await mediaService.createMedia({
      title,
      description,
      url: fileUrl,
      type: req.file.mimetype.startsWith("video") ? "video" : "audio",
      uploadedBy: req.user.id,
    });

    res
      .status(200)
      .json({ message: "File uploaded successfully", media: media });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
