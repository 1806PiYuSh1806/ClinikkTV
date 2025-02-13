const mediaModel = require("../models/media.model");

module.exports.createMedia = async ({
  title,
  description,
  url,
  type,
  uploadedBy,
}) => {
  if (!title || !description || !url || !type || !uploadedBy) {
    throw new Error("All feilds are required");
  }

  const media = mediaModel.create({
    title,
    description,
    url,
    type,
    uploadedBy,
  });

  return media;
};
