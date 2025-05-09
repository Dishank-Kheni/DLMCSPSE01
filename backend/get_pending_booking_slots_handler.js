'use strict';

const AWS = require('aws-sdk');

// Initialize AWS SDK clients
const dynamoDB = new AWS.DynamoDB({
  apiVersion: '2012-08-10'
});

// Configuration constants
const CONFIG = {
  TABLE_NAME: 'bookingdetails',
  STATUS_PENDING: 'PENDING'
};

// CORS headers for all responses
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
  'Access-Control-Allow-Origin': '*'
};

/**
 * Validates input parameters
 * @param {Object} params - Input parameters to validate
 * @throws {Error} If validation fails
 */
function validateParams(params) {
  if (!params) {
    throw new Error('Missing request parameters');
  }
  
  if (!params.teacherId && !params.tutorid) {
    throw new Error('Teacher ID is required');
  }
  
  if (!params.learnerId && !params.studentid) {
    throw new Error('Learner ID is required');
  }
}

/**
 * Gets pending booking slots from DynamoDB
 * @param {string} teacherId - Teacher ID
 * @param {string} learnerId - Learner ID
 * @returns {Promise<Array>} - Array of slot IDs
 */
async function getPendingBookingSlots(teacherId, learnerId) {
  const searchParams = {
    TableName: CONFIG.TABLE_NAME,
    FilterExpression: "#teacherId = :teacherIdValue AND #learnerId = :learnerIdValue AND #bookingstatus = :bookingstatusValue",
    ExpressionAttributeNames: {
      "#teacherId": "teacherId",     // Changed from tutorId
      "#learnerId": "learnerId",     // Changed from studentId
      "#bookingstatus": "bookingStatus"
    },
    ExpressionAttributeValues: {
      ":teacherIdValue": { "S": teacherId },  // Changed from tutorIdValue
      ":learnerIdValue": { "S": learnerId },  // Changed from studentIdValue
      ":bookingstatusValue": { "S": CONFIG.STATUS_PENDING }
    }
  };

  try {
    const data = await dynamoDB.scan(searchParams).promise();
    
    // Map the items to extract just the slot IDs
    const slotIdList = data.Items.map(item => item.slotId.S);
    
    console.log(`Retrieved ${slotIdList.length} pending booking slots successfully`);
    return slotIdList;
  } catch (error) {
    console.error('Error retrieving pending booking slots:', error);
    throw new Error(`Failed to retrieve pending booking slots: ${error.message}`);
  }
}

/**
 * Lambda handler for getting pending booking slots
 * @param {Object} event - API Gateway Lambda event
 * @returns {Object} - API response
 */
exports.handler = async (event) => {
  console.log('Processing pending booking slots request');
  
  try {
    // Parse request body
    if (!event.body) {
      return formatResponse(400, { 
        error: 'Missing request body' 
      });
    }
    
    const body = JSON.parse(event.body);
    
    // Support both naming conventions (backward compatibility)
    const teacherId = body.teacherId || body.tutorid;
    const learnerId = body.learnerId || body.studentid;
    
    try {
      validateParams({ teacherId, learnerId });
    } catch (error) {
      return formatResponse(400, { 
        error: error.message 
      });
    }
    
    // Get pending booking slots
    const slotIdList = await getPendingBookingSlots(teacherId, learnerId);
    
    // Return success response
    return formatResponse(200, slotIdList);
    
  } catch (error) {
    console.error('Error processing request:', error);
    return formatResponse(500, { 
      error: 'Error processing pending booking slots request',
      message: error.message
    });
  }
};

/**
 * Formats the API response
 * @param {number} statusCode - HTTP status code
 * @param {Object|Array} body - Response body
 * @returns {Object} - Formatted response object
 */
function formatResponse(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body)
  };
}
