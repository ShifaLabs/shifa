import axios from "axios";

export const imageUpload = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile); // ⚠️ Cloudinary uses "file"
    formData.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET);

    const { data } = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
    );

    return data.secure_url;
  } catch (error) {
    console.error("Image upload failed:", error);
    throw error;
  }
};
