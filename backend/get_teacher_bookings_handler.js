'use strict';

const AWS = require('aws-sdk');

// Initialize AWS SDK clients
const dynamoDB = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  region: 'eu-north-1'
});

// Configuration constants
const CONFIG = {
  BOOKINGS_TABLE: 'bookingdetails',
  MAX_ITEMS_PER_QUERY: 100
};

// CORS headers for all responses
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
  'Access-Control-Allow-Origin': '*'
};

/**
 * Gets slot details from DynamoDB
 * @param {string} slotId - ID of the slot to retrieve
 * @returns {Promise<Object>} - Slot details
 */
async function getSlotDetails(slotId) {
  if (!slotId) {
    console.warn('Empty slotId provided to getSlotDetails');
    return null;
  }
  
  const params = {
    TableName: 'slots',
    Key: {
      'id': { S: slotId }
    }
  };

  try {
    const data = await dynamoDB.getItem(params).promise();
    return data.Item;
  } catch (error) {
    console.error(`Error retrieving slot ${slotId}:`, error);
    return null;
  }
}

/**
 * Gets all teacher bookings from DynamoDB
 * @param {string} teacherId - Teacher ID to query
 * @returns {Promise<Array>} - Array of booking objects
 */
async function getTeacherBookings(teacherId) {
  if (!teacherId) {
    throw new Error('Teacher ID is required');
  }

  console.log(`Getting bookings for teacher: ${teacherId}`);
  
  try {
    // Note: In production, we should use a GSI instead of scan for better performance
    const params = {
      TableName: CONFIG.BOOKINGS_TABLE,
      FilterExpression: "teacherId = :id",  // Changed from tutorId to teacherId
      ExpressionAttributeValues: {
        ":id": { S: teacherId }
      }
    };
    
    // Handle pagination for large result sets
    let items = [];
    let lastEvaluatedKey;
    
    do {
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }
      
      const result = await dynamoDB.scan(params).promise();
      
      if (result.Items && result.Items.length > 0) {
        items = items.concat(result.Items);
      }
      
      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);
    
    console.log(`Found ${items.length} bookings for teacher ${teacherId}`);
    
    // Map items to more usable format and add slot details if needed
    const bookings = items.map(item => {
      // Convert DynamoDB format to plain JavaScript object
      return {
        bookingId: item.bookingId?.S || '',
        teacherId: item.teacherId?.S || '',  // Changed from tutorId
        learnerId: item.learnerId?.S || '',  // Changed from studentId
        slotId: item.slotId?.S || '',
        bookingStatus: item.bookingStatus?.S || '',
        slotDate: item.slotDate?.S || '',
        requestMadeOn: item.requestMadeOn?.S || ''
      };
    });
    
    return bookings;
  } catch (error) {
    console.error('Error fetching teacher bookings:', error);
    throw new Error(`Failed to retrieve bookings: ${error.message}`);
  }
}

/**
 * Lambda handler for getting teacher bookings
 * @param {Object} event - API Gateway Lambda event
 * @returns {Object} - API response
 */
exports.handler = async (event) => {
  console.log('Processing teacher bookings request');
  
  try {
    // Validate input parameters
    if (!event.queryStringParameters || !event.queryStringParameters.id) {
      return formatResponse(400, { 
        error: 'Missing required parameter: id (teacher ID)' 
      });
    }
    
    const teacherId = event.queryStringParameters.id;
    
    // Get teacher bookings
    const bookings = await getTeacherBookings(teacherId);
    
    // Return success response
    return formatResponse(200, { bookings });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return formatResponse(500, { 
      error: 'Error retrieving teacher bookings',
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
