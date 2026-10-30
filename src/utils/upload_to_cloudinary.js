
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

const uploadToCloudinary = (file, folder = "properties") =>
    new Promise((resolve, reject) => {
        if (!file?.buffer) {
            return reject(new Error("File buffer is missing"));
        }

        const resourceType = file.mimetype.startsWith("video/")
            ? "video"
            : "image";

        const uploadStream = cloudinary.uploader.upload_stream(
            { folder, resource_type: resourceType },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                if (!result) {
                    return reject(new Error("Missing Cloudinary result"));
                }

                resolve({
                    url: result.secure_url,
                    public_id: result.public_id,
                    resource_type: result.resource_type,
                    format: result.format,
                    bytes: result.bytes,
                });
            }
        );

        const readable = Readable.from(file.buffer);

        readable.on("error", (error) => {
            uploadStream.destroy(error);
            reject(error);
        });

        uploadStream.on("error", reject);

        readable.pipe(uploadStream);
    });

module.exports = uploadToCloudinary;
