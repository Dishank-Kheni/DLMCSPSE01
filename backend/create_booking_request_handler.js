'use strict';

const AWS = require('aws-sdk');

// Initialize the DynamoDB client
const dynamoDB = new AWS.DynamoDB({
  apiVersion: '2012-08-10'
});

// Configuration constants
const CONFIG = {
  TABLE_NAME: 'bookingdetails',
  STATUS_PENDING: 'PENDING',
  BOOKING_PREFIX: 'b'
};

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
  'Access-Control-Allow-Origin': '*'
};

/**
 * Validates booking request data
 * @param {Object} bookingData - Data to validate
 * @throws {Error} If validation fails
 */
function validateBookingData(bookingData) {
  const requiredFields = ['teacherId', 'learnerId', 'slotId', 'slotDate'];
  
  for (const field of requiredFields) {
    if (!bookingData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // Validate date format (ISO string or valid date format)
  try {
    new Date(bookingData.slotDate).toISOString();
  } catch (error) {
    throw new Error('Invalid date format for slotDate');
  }
}

/**
 * Generates a unique booking ID
 * @returns {string} The generated booking ID
 */
function generateBookingId() {
  // More robust ID generation - combines timestamp and random numbers
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${CONFIG.BOOKING_PREFIX}${timestamp}${randomStr}`;
}

/**
 * Saves booking details to DynamoDB
 * @param {Object} bookingData - Booking data to save
 * @returns {Promise<boolean>} Success status
 */
async function saveBooking(bookingData) {
  const {
    bookingId,
    teacherId,
    learnerId,
    slotId,
    slotDate,
    status
  } = bookingData;
  
  const requestDate = new Date().toISOString();
  
  const params = {
    TableName: CONFIG.TABLE_NAME,
    Item: {
      'bookingId': { S: bookingId },
      'teacherId': { S: teacherId },
      'learnerId': { S: learnerId },
      'bookingStatus': { S: status },
      'slotId': { S: slotId },
      'requestMadeOn': { S: requestDate },
      'slotDate': { S: slotDate }
    }
  };
  
  try {
    await dynamoDB.putItem(params).promise();
    return true;
  } catch (error) {
    console.error('DynamoDB error:', error);
    throw new Error(`Failed to save booking: ${error.message}`);
  }
}

/**
 * Lambda handler for booking request creation
 * @param {Object} event - API Gateway Lambda event
 * @returns {Object} - API response
 */
exports.handler = async (event) => {
  console.log('Processing booking request creation');
  
  try {
    // Parse and validate request body
    if (!event.body) {
      return formatResponse(400, {
        success: false,
        message: 'Missing request body'
      });
    }
    
    const body = JSON.parse(event.body);
    
    // Transform field names (tutor → teacher, student → learner)
    const bookingData = {
      teacherId: body.tutorid || body.teacherId,
      learnerId: body.studentid || body.learnerId,
      slotId: body.slotid || body.slotId,
      slotDate: body.slotDate
    };
    
    // Validate booking data
    try {
      validateBookingData(bookingData);
    } catch (error) {
      return formatResponse(400, {
        success: false,
        message: error.message
      });
    }
    
    // Generate booking ID and set status
    const bookingId = generateBookingId();
    bookingData.bookingId = bookingId;
    bookingData.status = CONFIG.STATUS_PENDING;
    
    // Save the booking to DynamoDB
    await saveBooking(bookingData);
    
    // Return success response
    return formatResponse(200, {
      success: true,
      message: 'Booking request has been sent to the teacher for approval',
      bookingId: bookingId
    });
    
  } catch (error) {
    console.error('Error processing booking request:', error);
    return formatResponse(500, {
      success: false,
      message: 'Error while processing booking request',
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
