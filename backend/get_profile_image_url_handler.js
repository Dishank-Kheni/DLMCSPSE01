'use strict';

const AWS = require('aws-sdk');

// Initialize S3 client
const s3 = new AWS.S3();

// Configuration constants
const CONFIG = {
  BUCKET_NAME: 'skillsession-profile-images',
  URL_EXPIRATION_SECONDS: 300,  // 5 minutes
  DEFAULT_PROFILE_KEY: 'default-profile-image.png'  // Fallback image
};

// CORS headers for all responses
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET',
  'Access-Control-Allow-Origin': '*'
};

/**
 * Generates a signed URL for an S3 object
 * @param {string} objectKey - The S3 object key
 * @returns {Promise<string>} - The signed URL
 */
async function getSignedImageUrl(objectKey) {
  try {
    // Check if object exists first to avoid returning invalid URLs
    await s3.headObject({
      Bucket: CONFIG.BUCKET_NAME,
      Key: objectKey
    }).promise();
    
    // Generate the signed URL
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: CONFIG.BUCKET_NAME,
      Key: objectKey,
      Expires: CONFIG.URL_EXPIRATION_SECONDS
    });
    
    console.log(`Generated signed URL for ${objectKey}`);
    return signedUrl;
  } catch (error) {
    console.log(`Object not found or error for key ${objectKey}: ${error.message}`);
    
    // If the requested image doesn't exist, return the default image URL
    if (error.code === 'NotFound' && objectKey !== CONFIG.DEFAULT_PROFILE_KEY) {
      console.log('Returning default image URL instead');
      return getSignedImageUrl(CONFIG.DEFAULT_PROFILE_KEY);
    }
    
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
}

/**
 * Validates the provided email or ID
 * @param {string} id - The ID to validate
 * @returns {boolean} - Whether the ID is valid
 */
function validateId(id) {
  // Basic validation - ensure it's not empty and reasonable length
  return id && typeof id === 'string' && id.length >= 3 && id.length <= 255;
}

/**
 * Lambda handler for getting profile image URLs
 * @param {Object} event - API Gateway Lambda event
 * @returns {Object} - API response with signed URL
 */
exports.handler = async (event) => {
  console.log('Processing profile image URL request');
  
  try {
    // Validate input parameters
    if (!event.queryStringParameters || !event.queryStringParameters.id) {
      return formatResponse(400, { 
        error: 'Missing required parameter: id (email or user ID)' 
      });
    }
    
    const id = event.queryStringParameters.id;
    
    if (!validateId(id)) {
      return formatResponse(400, { 
        error: 'Invalid ID format' 
      });
    }
    
    // Generate object key - either use directly or append profile suffix
    const objectKey = id.includes('-profile') ? id : `${id}-profile`;
    
    // Get signed URL
    const signedUrl = await getSignedImageUrl(objectKey);
    
    // Return successful response
    return formatResponse(200, { 
      url: signedUrl,
      expiresIn: CONFIG.URL_EXPIRATION_SECONDS,
      objectKey: objectKey
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return formatResponse(500, { 
      error: 'Error generating profile image URL',
      message: error.message 
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
