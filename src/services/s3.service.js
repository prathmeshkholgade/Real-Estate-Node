const {
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = require("../config/s3");

const BUCKET = process.env.AWS_S3_BUCKET;

class S3Service {
    async uploadFileToS3(file, folder = "properties/images") {
        const fileName = `${folder}/${Date.now()}-${file.originalname}`;

        const command = new PutObjectCommand({
            Bucket: BUCKET,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
        });

        await s3.send(command);

        return fileName;
    }

    async getS3FileUrl(key) {
        const command = new GetObjectCommand({
            Bucket: BUCKET,
            Key: key,
        });

        return await getSignedUrl(s3, command, {
            expiresIn: 3600,
        });
    }

    async deleteS3File(key) {
        const command = new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: key,
        });

        await s3.send(command);
    }
}

const s3Service = new S3Service();

s3Service.uploadFileToS3 = s3Service.uploadFileToS3.bind(s3Service);
s3Service.getS3FileUrl = s3Service.getS3FileUrl.bind(s3Service);
s3Service.deleteS3File = s3Service.deleteS3File.bind(s3Service);
s3Service.uploadFile = s3Service.uploadFileToS3;
s3Service.getFileUrl = s3Service.getS3FileUrl;
s3Service.deleteFile = s3Service.deleteS3File;

module.exports = s3Service;
