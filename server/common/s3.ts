// TODO: keep file only if using s3 file upload

import crypto from "crypto";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_S3_REGION
    : process.env.PROD_S3_REGION;
const accessKeyId =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_S3_ACCESS_KEY_ID
    : process.env.PROD_S3_ACCESS_KEY_ID;
const secretAccessKey =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_SECRET_ACCESS_KEY
    : process.env.PROD_S3_SECRET_ACCESS_KEY;

// initialize a S3 instance
const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
  },
});

const getS3UploadURL = async () => {
  // generate a unique name for image
  const fileName = crypto.randomBytes(16).toString("hex");

  // set up s3 params
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
  });

  // get a s3 upload url
  const uploadURL = await getSignedUrl(s3, command, { expiresIn: 60 });

  return uploadURL;
};

const uploadPDF = async (file: Buffer) => {
  const uploadURL = await getS3UploadURL();

  const response = await fetch(uploadURL, {
    method: 'PUT',
    body: file.buffer,
    headers: {
      'Content-Type': 'application/pdf'
    }
  });

  let fileURL = ""
  if (response.ok) {
    // The URL where your PDF is now accessible (remove the query parameters)
    fileURL = uploadURL.split('?')[0] || "";
    console.log('PDF uploaded successfully to:', fileURL);
  } else {
    console.error('Failed to upload PDF:', response.statusText);
    throw new Error('Failed to upload PDF');
  }
  return fileURL;
}

export { s3, uploadPDF };
