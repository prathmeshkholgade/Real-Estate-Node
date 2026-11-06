const {
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = require("../config/s3");

const BUCKET = process.env.AWS_S3_BUCKET;


const uploadFileToS3 = async (file, folder = "properties/images") => {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    await s3.send(command);

    return fileName;
};


const getS3FileUrl = async (key) => {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
    });

    return await getSignedUrl(s3, command, {
        expiresIn: 3600,
    });
};


const deleteS3File = async (key) => {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
    });

    await s3.send(command);
};

module.exports = {
    uploadFileToS3,
    getS3FileUrl,
    deleteS3File,
};