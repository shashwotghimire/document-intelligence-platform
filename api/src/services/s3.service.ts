import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import crypto from "crypto";

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET!,
  },
});

export const uploadToS3 = async (file: Express.Multer.File) => {
  const fileKey = `uploads/${crypto.randomUUID()}-${file.originalname}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );
  return {
    key: fileKey,
    // bucket: process.env.AWS_S3_BUCKET!,
  };
};
