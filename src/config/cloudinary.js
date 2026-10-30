
const cloudinary = require("cloudinary").v2;
console.log("process.env.CLOUDINARY_CLOUD_NAME");
console.log(process.env.CLOUDINARY_CLOUD_NAME);

cloudinary.config({
    debug: true,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;



























