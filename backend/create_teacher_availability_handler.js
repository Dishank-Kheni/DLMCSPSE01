'use strict';

const AWS = require('aws-sdk');
const moment = require('moment');

// Initialize AWS SDK clients
const dynamoDB = new AWS.DynamoDB({
  apiVersion: '2012-08-10'
});

// Configuration constants
const CONFIG = {
  AVAILABILITY_TABLE: 'availability',
  SLOTS_TABLE: 'slots',
  SLOT_DURATION_MINUTES: 60,
  SLOT_PREFIX: 'S',
  SLOT_STATUS_OPEN: 'OPEN'
};

// CORS headers for all responses
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
  'Access-Control-Allow-Origin': '*'
};

/**
 * Validates the availability data
 * @param {Object} data - Data to validate
 * @throws {Error} If validation fails
 */
function validateAvailabilityData(data) {
  const { id, date, startTime, endTime } = data;
  
  if (!id) throw new Error('Teacher ID is required');
  if (!date) throw new Error('Date is required');
  if (!startTime) throw new Error('Start time is required');
  if (!endTime) throw new Error('End time is required');

  // Validate time format
  if (!moment(startTime, 'HH:mm', true).isValid()) {
    throw new Error('Invalid start time format. Please use 24-hour format (HH:mm)');
  }
  
  if (!moment(endTime, 'HH:mm', true).isValid()) {
    throw new Error('Invalid end time format. Please use 24-hour format (HH:mm)');
  }

  // Validate date format
  if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
    throw new Error('Invalid date format. Please use YYYY-MM-DD');
  }

  // Validate time range
  const start = moment(startTime, 'HH:mm');
  const end = moment(endTime, 'HH:mm');
  
  if (!end.isAfter(start)) {
    throw new Error('End time must be after start time');
  }

  // Validate minimum slot duration
  const duration = moment.duration(end.diff(start)).asMinutes();
  if (duration < CONFIG.SLOT_DURATION_MINUTES) {
    throw new Error(`Time range must be at least ${CONFIG.SLOT_DURATION_MINUTES} minutes`);
  }
}

/**
 * Checks if availability already exists
 * @param {string} teacherId - Teacher ID
 * @param {string} date - Date string
 * @returns {Promise<boolean>} - Whether availability exists
 */
async function checkAvailabilityExists(teacherId, date) {
  const key = teacherId + date;
  
  const params = {
    TableName: CONFIG.AVAILABILITY_TABLE,
    Key: {
      'id': { S: key }
    }
  };
  
  try {
    const data = await dynamoDB.getItem(params).promise();
    return !!data.Item;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw new Error(`Failed to check existing availability: ${error.message}`);
  }
}

/**
 * Saves teacher availability to DynamoDB
 * @param {string} startTime - Start time (HH:mm)
 * @param {string} endTime - End time (HH:mm)
 * @param {string} date - Date (YYYY-MM-DD)
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<boolean>} - Success status
 */
async function saveAvailability(startTime, endTime, date, teacherId) {
  const availabilityItem = {
    'id': { S: teacherId + date },
    'date': { S: date },
    'startTime': { S: startTime },
    'endTime': { S: endTime },
    'teacherId': { S: teacherId }  // Added teacherId as a separate attribute for queries
  };

  const params = {
    TableName: CONFIG.AVAILABILITY_TABLE,
    Item: availabilityItem
  };

  try {
    await dynamoDB.putItem(params).promise();
    return true;
  } catch (error) {
    console.error('Error saving availability:', error);
    throw new Error(`Failed to save availability: ${error.message}`);
  }
}

/**
 * Saves individual time slots to DynamoDB
 * @param {string} startTime - Start time (HH:mm)
 * @param {string} endTime - End time (HH:mm)
 * @param {string} teacherId - Teacher ID
 * @param {string} date - Date (YYYY-MM-DD)
 * @returns {Promise<boolean>} - Success status
 */
async function saveSlotDetails(startTime, endTime, teacherId, date) {
  // Calculate number of slots
  const slotDuration = CONFIG.SLOT_DURATION_MINUTES;
  let slotNumber = 1;
  let currentStart = moment(startTime, 'HH:mm');
  let currentEnd = moment(startTime, 'HH:mm').add(slotDuration, 'minutes');
  const finalEnd = moment(endTime, 'HH:mm');
  
  const slots = [];

  // Create slots until we reach the end time
  while (currentEnd.isSameOrBefore(finalEnd)) {
    const slotId = `${CONFIG.SLOT_PREFIX}${slotNumber}${date}${teacherId}`;
    
    const slot = {
      PutRequest: {
        Item: {
          'id': { S: slotId },
          'startTime': { S: currentStart.format('HH:mm') },
          'endTime': { S: currentEnd.format('HH:mm') },
          'slotstatus': { S: CONFIG.SLOT_STATUS_OPEN },
          'teacherId': { S: teacherId },  // Changed from tutorID to teacherId
          'date': { S: date }
        }
      }
    };
    
    slots.push(slot);
    
    // Move to next slot
    currentStart = moment(currentEnd);
    currentEnd = moment(currentStart).add(slotDuration, 'minutes');
    slotNumber++;
  }

  // No slots to save
  if (slots.length === 0) {
    return true;
  }

  const params = {
    RequestItems: {
      [CONFIG.SLOTS_TABLE]: slots
    }
  };

  try {
    await dynamoDB.batchWriteItem(params).promise();
    return true;
  } catch (error) {
    console.error('Error saving slots:', error);
    throw new Error(`Failed to save time slots: ${error.message}`);
  }
}

/**
 * Lambda handler for teacher availability creation
 * @param {Object} event - API Gateway Lambda event
 * @returns {Object} - API response
 */
exports.handler = async (event) => {
  console.log('Processing teacher availability creation request');
  
  try {
    // Parse request body
    if (!event.body) {
      return formatResponse(400, {
        success: false,
        message: 'Missing request body'
      });
    }
    
    const body = JSON.parse(event.body);
    
    // Transform field names (tutorId → teacherId)
    const availabilityData = {
      id: body.id || body.tutorId || body.teacherId,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime
    };
    
    // Validate availability data
    try {
      validateAvailabilityData(availabilityData);
    } catch (error) {
      return formatResponse(400, {
        success: false,
        message: error.message
      });
    }
    
    const { id: teacherId, date, startTime, endTime } = availabilityData;
    
    // Check if availability already exists
    const availabilityExists = await checkAvailabilityExists(teacherId, date);
    
    if (availabilityExists) {
      return formatResponse(409, {
        success: false,
        message: 'Availability already exists for this date',
        itemFound: true
      });
    }
    
    // Save availability and slots
    await saveAvailability(startTime, endTime, date, teacherId);
    await saveSlotDetails(startTime, endTime, teacherId, date);
    
    // Return success response
    return formatResponse(201, {
      success: true,
      message: 'Availability and time slots created successfully',
      itemFound: false
    });
    
  } catch (error) {
    console.error('Error processing availability creation:', error);
    return formatResponse(500, {
      success: false,
      message: 'Error while processing availability creation',
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
