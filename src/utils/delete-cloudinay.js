import cloudinary from "cloudinary";

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: "YOUR_CLOUD_NAME",
  api_key: "YOUR_API_KEY",
  api_secret: "YOUR_API_SECRET",
});

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

export default deleteFromCloudinary;
