'use strict';

const AWS = require('aws-sdk');

// Initialize AWS SDK clients
const dynamoDB = new AWS.DynamoDB({
  apiVersion: '2012-08-10'
});

// Configuration constants
const CONFIG = {
  SLOTS_TABLE: 'slots',
  MAX_RESULTS: 100
};

// CORS headers for all responses
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
  'Access-Control-Allow-Origin': '*'
};

/**
 * Validates the request parameters
 * @param {Object} body - Request body to validate
 * @throws {Error} If validation fails
 */
function validateRequest(body) {
  if (!body) {
    throw new Error('Missing request body');
  }
  
  // Support both naming conventions for backward compatibility
  const teacherId = body.teacherId || body.userid || body.tutorId;
  
  if (!teacherId) {
    throw new Error('Teacher ID is required');
  }
  
  return { teacherId };
}

/**
 * Gets all slots for a teacher from DynamoDB
 * @param {string} teacherId - Teacher ID to query
 * @returns {Promise<Array>} - Array of slot objects
 */
async function getTeacherSlots(teacherId) {
  console.log(`Retrieving slots for teacher: ${teacherId}`);
  
  const searchParams = {
    TableName: CONFIG.SLOTS_TABLE,
    FilterExpression: "#teacherId = :teacherIdValue",
    ExpressionAttributeNames: {
      "#teacherId": "teacherId"  // Changed from tutorID
    },
    ExpressionAttributeValues: {
      ":teacherIdValue": {
        "S": teacherId
      }
    }
  };
  
  try {
    // Handle pagination for large result sets
    let items = [];
    let lastEvaluatedKey;
    
    do {
      if (lastEvaluatedKey) {
        searchParams.ExclusiveStartKey = lastEvaluatedKey;
      }
      
      const data = await dynamoDB.scan(searchParams).promise();
      
      if (data.Items && data.Items.length > 0) {
        items = items.concat(data.Items);
      }
      
      lastEvaluatedKey = data.LastEvaluatedKey;
    } while (lastEvaluatedKey);
    
    console.log(`Found ${items.length} slots for teacher ${teacherId}`);
    
    // Map DynamoDB items to simpler objects
    return items.map(item => ({
      id: item.id?.S || '',
      date: item.date?.S || '',
      startTime: item.startTime?.S || '',
      endTime: item.endTime?.S || '',
      status: item.slotstatus?.S || '',
      teacherId: item.teacherId?.S || ''  // Changed from tutorID
    }));
    
  } catch (error) {
    console.error('Error retrieving teacher slots:', error);
    throw new Error(`Failed to retrieve slots: ${error.message}`);
  }
}

/**
 * Lambda handler for getting teacher slots
 * @param {Object} event - API Gateway Lambda event
 * @returns {Object} - API response with slots
 */
exports.handler = async (event) => {
  console.log('Processing teacher slots request');
  
  try {
    // Parse and validate request body
    if (!event.body) {
      return formatResponse(400, { 
        error: 'Missing request body' 
      });
    }
    
    const body = JSON.parse(event.body);
    
    try {
      const { teacherId } = validateRequest(body);
      
      // Get teacher slots
      const slots = await getTeacherSlots(teacherId);
      
      // Return success response
      if (slots.length > 0) {
        return formatResponse(200, slots);
      } else {
        return formatResponse(404, { 
          message: "No slots found for this teacher" 
        });
      }
    } catch (validationError) {
      return formatResponse(400, { 
        error: validationError.message 
      });
    }
    
  } catch (error) {
    console.error('Error processing request:', error);
    return formatResponse(500, { 
      error: 'Error retrieving teacher slots',
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
