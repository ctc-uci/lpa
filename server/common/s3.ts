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
  // generate a unique name for PDF
  const fileName = crypto.randomBytes(16).toString("hex") + ".pdf";

  // set up s3 params with proper content type
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Expires: 60,
    ContentType: 'application/pdf',
    ACL: 'public-read'
  };

  // get a s3 upload url
  const uploadURL = s3.getSignedUrl("putObject", params);

  return uploadURL;
};

const uploadPDF = async (file) => {
  try {
    // Generate a unique filename
    const fileName = crypto.randomBytes(16).toString("hex") + ".pdf";
    
    console.log('S3 Configuration:', {
      region: region,
      bucket: process.env.S3_BUCKET_NAME,
      hasAccessKey: !!accessKeyId,
      hasSecretKey: !!secretAccessKey
    });

    // Upload directly using AWS SDK
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: 'application/pdf',
      ACL: 'public-read'
    };

    console.log('Uploading to S3 with params:', {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      ContentType: 'application/pdf',
      BodySize: file.buffer.length
    });

    const result = await s3.upload(uploadParams).promise();
    console.log('PDF uploaded successfully to:', result.Location);
    return result.Location;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`Failed to upload PDF: ${error.message}`);
  }
}

export { s3, uploadPDF };
