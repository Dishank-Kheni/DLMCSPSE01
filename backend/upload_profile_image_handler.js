'use strict';

const AWS = require('aws-sdk');

// Configuration constants
const CONFIG = {
  BUCKET_NAME: 'unitedtutoring-profile-images',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB max size
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,PUT,POST',
  'Access-Control-Allow-Origin': '*'
};

// Initialize S3 client
const s3Client = new AWS.S3({
  params: { Bucket: CONFIG.BUCKET_NAME }
});

/**
 * Uploads a file to S3 bucket
 * @param {Object} uploadParams - S3 upload parameters
 * @returns {Promise<boolean>} - Success status
 */
async function uploadToS3(uploadParams) {
  try {
    await s3Client.putObject(uploadParams).promise();
    return true;
  } catch (error) {
    console.error('[S3 Error]', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

/**
 * Validates the image data
 * @param {Object} imageData - Image data from request
 * @throws {Error} If validation fails
 */
function validateImageData(imageData) {
  // Check if required fields exist
  if (!imageData || !imageData.file || !imageData.email) {
    throw new Error('Missing required fields: file or email');
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(imageData.email)) {
    throw new Error('Invalid email format');
  }
  
  // Extract content type from base64 data
  const contentTypeMatch = imageData.file.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
  if (!contentTypeMatch) {
    throw new Error('Invalid image format: missing content type');
  }
  
  const contentType = contentTypeMatch[1];
  
  // Validate mime type
  if (!CONFIG.ALLOWED_MIME_TYPES.includes(contentType)) {
    throw new Error(`Unsupported image format: ${contentType}. Allowed types: ${CONFIG.ALLOWED_MIME_TYPES.join(', ')}`);
  }
  
  // Estimate file size (base64 is roughly 4/3 the size of the actual data)
  const base64Data = imageData.file.replace(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/, '');
  const fileSize = Math.ceil(base64Data.length * 0.75);
  
  if (fileSize > CONFIG.MAX_FILE_SIZE) {
    throw new Error(`Image size exceeds the maximum allowed size of ${CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }
}

/**
 * Lambda handler for profile image upload
 * @param {Object} event - API Gateway Lambda event
 * @returns {Object} - API response
 */
exports.handler = async (event) => {
  console.log('Processing profile image upload request');
  
  try {
    // Parse request body
    if (!event.body) {
      return formatResponse(400, { error: 'Missing request body' });
    }
    
    const imageData = JSON.parse(JSON.parse(event.body));
    
    // Validate image data
    validateImageData(imageData);
    
    // Extract content type and prepare image buffer
    const contentType = imageData.file.substring(
      "data:".length, 
      imageData.file.indexOf(";base64")
    );
    
    const imageBuffer = Buffer.from(
      imageData.file.replace(/^data:image\/\w+;base64,/, ""), 
      'base64'
    );
    
    // Prepare S3 upload parameters
    const uploadParams = {
      Key: `${imageData.email}-profile`, // Add -profile suffix for clarity
      Body: imageBuffer,
      ContentEncoding: 'base64',
      ContentType: contentType,
      Metadata: {
        'uploaded-by': imageData.email,
        'upload-date': new Date().toISOString()
      }
    };
    
    // Upload to S3
    await uploadToS3(uploadParams);
    
    // Return success response
    return formatResponse(200, { 
      success: true, 
      message: 'Profile image uploaded successfully',
      imageUrl: `https://${CONFIG.BUCKET_NAME}.s3.amazonaws.com/${uploadParams.Key}`
    });
    
  } catch (error) {
    console.error('Error processing upload:', error);
    
    // Determine appropriate status code based on error
    const statusCode = error.message.includes('Invalid') ? 400 : 500;
    return formatResponse(statusCode, { 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Formats the API response
 * @param {number} statusCode - HTTP status code
 * @param {Object} body - Response body
 * @returns {Object} - Formatted response object
 */
function formatResponse(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body)
  };
}
