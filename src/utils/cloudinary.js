import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      response_type: "auto",
    });
    fs.unlinkSync(localFilePath);

    // console.log("file has been uploaded successfully", response);
    return response;
  } catch (error) {
    console.log(`cloudanary ${process.env.CLOUDINARY_NAME}`, error);
    fs.unlinkSync(localFilePath);
    return null;
  }
};

// cloudinary.v2.uploader.upload(
//   "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" },
//   function (error, result) {
//     console.log(result);
//   }
// );

// Function to delete an image from Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl) {
    throw new Error("Image URL is required");
  }

  const publicId = extractPublicId(imageUrl); // Extract public ID from the image URL
  if (!publicId) {
    throw new Error("Invalid image URL");
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(result);
    return result;
  } catch (error) {
    throw new Error("Failed to delete image from Cloudinary");
  }
};

// Function to extract the public ID from the Cloudinary image URL
const extractPublicId = (imageUrl) => {
  const regex = /(?:image\/upload\/)(.*)(?=\/)/;
  const match = imageUrl.match(regex);
  return match ? match[1] : null;
};

export { deleteFromCloudinary, uploadOnCloudinary };
