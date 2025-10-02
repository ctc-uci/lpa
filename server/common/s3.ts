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

// Set AWS SDK to load config from environment
process.env.AWS_SDK_LOAD_CONFIG = "1";

// Verify credentials are available
if (!accessKeyId || !secretAccessKey) {
  console.error('AWS credentials missing:', {
    accessKeyId: !!accessKeyId,
    secretAccessKey: !!secretAccessKey,
    environment: process.env.NODE_ENV
  });
}

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
    // Check credentials before attempting upload
    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials not configured. Please check environment variables.');
    }

    if (!process.env.S3_BUCKET_NAME) {
      throw new Error('S3 bucket name not configured.');
    }

    // Generate a unique filename
    const fileName = crypto.randomBytes(16).toString("hex") + ".pdf";
    
    console.log('S3 Configuration:', {
      region: region,
      bucket: process.env.S3_BUCKET_NAME,
      hasAccessKey: !!accessKeyId,
      hasSecretKey: !!secretAccessKey,
      environment: process.env.NODE_ENV
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
    
    // Provide more specific error messages
    if (error.code === 'CredentialsError') {
      throw new Error('AWS credentials are invalid or expired. Please check your environment variables.');
    } else if (error.code === 'NoSuchBucket') {
      throw new Error(`S3 bucket '${process.env.S3_BUCKET_NAME}' does not exist.`);
    } else if (error.code === 'AccessDenied') {
      throw new Error('Access denied to S3 bucket. Please check your AWS permissions.');
    } else {
      throw new Error(`Failed to upload PDF: ${error.message}`);
    }
  }
}

export { s3, uploadPDF };
