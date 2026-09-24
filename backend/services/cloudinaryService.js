const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadImage(buffer, originalName) {
  if (!process.env.CLOUDINARY_CLOUD_NAME) return null;
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'cirs', resource_type: 'image', public_id: `${Date.now()}-${originalName.replace(/\W+/g,'-')}` },
      (error, result) => error ? reject(error) : resolve(result.secure_url)
    );
    stream.end(buffer);
  });
}

module.exports = { uploadImage };
