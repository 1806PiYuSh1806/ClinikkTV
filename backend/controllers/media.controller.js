const Media = require("../models/media.model");
const mediaService = require("../services/media.service");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

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

module.exports.listMedia = async (req, res) => {
  try {
    const mediaList = await Media.find().select("-__v");
    res.status(200).json({ media: mediaList });
  } catch (error) {
    console.error("List Media Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await Media.findById(id).select("-__v");

    if (!media) return res.status(404).json({ message: "Media not found" });

    res.status(200).json({ media });
  } catch (error) {
    console.error("Error fetching media by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.streamMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await Media.findById(id);

    if (!media) return res.status(404).json({ message: "Media not found" });

    const s3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `media/${media.url.split("/").pop()}`,
    };

    const command = new GetObjectCommand(s3Params);
    const response = await s3.send(command);

    res.setHeader("Content-Type", response.ContentType);
    res.setHeader("Content-Length", response.ContentLength);
    res.setHeader("Accept-Ranges", "bytes");

    response.Body.pipe(res);
  } catch (error) {
    console.error("Streaming Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.likeMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const media = await Media.findById(id);
    if (!media) return res.status(404).json({ message: "Media not found" });

    const alreadyLiked = media.likes.includes(userId);
    if (alreadyLiked) {
      return res.status(400).json({ message: "You already liked this media" });
    }

    media.likes.push(userId);
    await media.save();

    res
      .status(200)
      .json({ message: "Liked successfully", likes: media.likes.length });
  } catch (error) {
    console.error("Like Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.unlikeMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const media = await Media.findById(id);
    if (!media) return res.status(404).json({ message: "Media not found" });

    if (!media.likes.includes(userId)) {
      return res.status(400).json({ message: "You haven't liked this media" });
    }

    media.likes = media.likes.filter((like) => like.toString() !== userId);
    await media.save();

    res
      .status(200)
      .json({ message: "Unliked successfully", likes: media.likes.length });
  } catch (error) {
    console.error("Unlike Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
