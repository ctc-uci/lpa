// TODO: keep file only if using s3 file upload

import crypto from "crypto";

import aws from "aws-sdk";

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
const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: "v4",
});

const getS3UploadURL = async () => {
  // generate a unique name for image
  const fileName = crypto.randomBytes(16).toString("hex");

  // set up s3 params
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Expires: 60,
  };

  // get a s3 upload url
  const uploadURL = s3.getSignedUrl("putObject", params);

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
