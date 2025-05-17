'use strict';

const AWS = require('aws-sdk');

// Initialize AWS clients
const sns = new AWS.SNS();
const dynamoDB = new AWS.DynamoDB.DocumentClient({ 
  apiVersion: '2012-08-10' 
});

// Uncomment to enable actual Zoom integration
// const jwt = require("jsonwebtoken");
// const requestPromise = require("request-promise");

// Configuration constants
const CONFIG = {
  BOOKINGS_TABLE: 'bookingdetails',
  SLOTS_TABLE: 'slots',
  SNS_TOPIC_ARN: 'arn:aws:sns:eu-north-1:835032380954:sendBookingUpdate',
  ZOOM_API_KEY: 'mjmt52VBQ6m0JOd09TlxjA',    // Would move to environment variables in production
  ZOOM_API_SECRET: 'PX4EM63JBQjZBZUOW1vbex5PWIOJSqtH'  // Would move to environment variables in production
};

// CORS headers for all responses
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
  'Access-Control-Allow-Origin': '*'
};

/**
 * Updates booking status in DynamoDB
 * @param {string} bookingId - Booking ID to update
 * @param {string} status - New status value
 * @returns {Promise<boolean>} - Success status
 */
async function updateBookingStatus(bookingId, status) {
  const params = {
    TableName: CONFIG.BOOKINGS_TABLE,
    Key: {
      "bookingId": bookingId
    },
    UpdateExpression: "set bookingStatus = :status",
    ExpressionAttributeValues: {
      ":status": status
    }
  };

  try {
    await dynamoDB.update(params).promise();
    console.log(`Updated booking ${bookingId} to status ${status}`);
    return true;
  } catch (error) {
    console.error(`Error updating booking status for ${bookingId}:`, error);
    return false;
  }
}

/**
 * Updates slot status in DynamoDB
 * @param {string} slotId - Slot ID to update
 * @param {string} status - New status value
 * @returns {Promise<boolean>} - Success status
 */
async function updateSlotStatus(slotId, status) {
  const params = {
    TableName: CONFIG.SLOTS_TABLE,
    Key: {
      "id": slotId
    },
    UpdateExpression: "set slotstatus = :status",
    ExpressionAttributeValues: {
      ":status": status
    }
  };

  try {
    await dynamoDB.update(params).promise();
    console.log(`Updated slot ${slotId} to status ${status}`);
    return true;
  } catch (error) {
    console.error(`Error updating slot status for ${slotId}:`, error);
    return false;
  }
}

/**
 * Sends email notification via SNS
 * @param {string} emailIds - Recipient email addresses
 * @param {string} message - Email message body
 * @param {string} subject - Email subject
 * @param {string} topicArn - SNS topic ARN
 * @returns {Promise<boolean>} - Success status
 */
async function sendEmailNotification(emailIds, message, subject, topicArn) {
  const params = {
    Message: message,
    MessageAttributes: {
      'email': {
        DataType: 'String',
        StringValue: emailIds
      }
    },
    MessageStructure: 'string',
    Subject: subject,
    TopicArn: topicArn
  };

  try {
    const result = await sns.publish(params).promise();
    console.log(`Email notification sent successfully: ${result.MessageId}`);
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
}

/**
 * Generates Zoom meeting link for a session
 * @returns {Promise<Object>} - Object containing teacher and learner meeting links
 */
async function generateZoomLink() {
  // For development/testing, return static links
  // In production, uncomment the actual implementation
  return {
    teacherLink: "https://us05web.zoom.us/j/89052075978?pwd=1v7ZlM7qb2GnyrhR8nbEwSKT6rzE56.1",
    learnerLink: "https://us05web.zoom.us/j/89052075978?pwd=1v7ZlM7qb2GnyrhR8nbEwSKT6rzE56.1"
  };
  
  /* Actual implementation - uncomment for production use
  try {
    // Generate JWT token for Zoom API
    const payload = {
      iss: CONFIG.ZOOM_API_KEY,
      exp: new Date().getTime() + 5000
    };
    
    const token = jwt.sign(payload, CONFIG.ZOOM_API_SECRET);
    const email = "your-zoom-account@example.com"; // Use account email or from environment variables
    
    const options = {
      method: "POST",
      uri: `https://api.zoom.us/v2/users/${email}/meetings`,
      body: {
        topic: "Tutoring Session",
        type: 1,  // Instant meeting
        settings: {
          host_video: true,
          participant_video: true
        }
      },
      auth: {
        bearer: token
      },
      headers: {
        "User-Agent": "Zoom-API-JWT-Request",
        "content-type": "application/json"
      },
      json: true
    };
    
    const response = await requestPromise(options);
    
    return {
      teacherLink: response.start_url,
      learnerLink: response.join_url
    };
  } catch (error) {
    console.error("Error generating Zoom link:", error);
    throw error;
  }
  */
}

/**
 * Validates the booking response data
 * @param {Object} data - Data to validate
 * @throws {Error} If validation fails
 */
function validateBookingResponse(data) {
  if (!data) {
    throw new Error('Missing request data');
  }
  
  const requiredFields = ['bookingId', 'teacherId', 'learnerId', 'slotId', 'action'];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  const validActions = ['CONFIRM', 'REJECT'];
  if (!validActions.includes(data.action)) {
    throw new Error(`Invalid action: ${data.action}. Must be one of: ${validActions.join(', ')}`);
  }
}

/**
 * Handles booking confirmation
 * @param {Object} data - Booking data
 * @returns {Promise<boolean>} - Success status
 */
async function handleBookingConfirmation(data) {
  const { bookingId, teacherId, learnerId, slotId } = data;
  
  try {
    // Update slot and booking status
    await updateSlotStatus(slotId, "BOOKED");
    await updateBookingStatus(bookingId, "CONFIRM");
    
    // Generate Zoom meeting links
    const links = await generateZoomLink();
    
    // Send email notifications with Zoom links
    const subject = "Your Booking is Confirmed";
    
    await sendEmailNotification(
      teacherId, 
      `Your tutoring session has been confirmed. Join using this link: ${links.teacherLink}`, 
      subject, 
      CONFIG.SNS_TOPIC_ARN
    );
    
    await sendEmailNotification(
      learnerId, 
      `Your booking request has been accepted. Join using this link: ${links.learnerLink}`, 
      subject, 
      CONFIG.SNS_TOPIC_ARN
    );
    
    return true;
  } catch (error) {
    console.error('Error handling booking confirmation:', error);
    return false;
  }
}

/**
 * Handles booking rejection
 * @param {Object} data - Booking data
 * @returns {Promise<boolean>} - Success status
 */
async function handleBookingRejection(data) {
  const { bookingId, learnerId } = data;
  
  try {
    // Update booking status
    await updateBookingStatus(bookingId, "REJECT");
    
    // Send rejection notification to learner
    const subject = "Your Booking Request Has Been Declined";
    const message = "Unfortunately, the teacher is unable to accommodate this session. Please try booking another time slot.";
    
    await sendEmailNotification(learnerId, message, subject, CONFIG.SNS_TOPIC_ARN);
    
    return true;
  } catch (error) {
    console.error('Error handling booking rejection:', error);
    return false;
  }
}

/**
 * Lambda handler for processing booking responses
 * @param {Object} event - API Gateway Lambda event
 * @returns {Object} - API response
 */
exports.handler = async (event) => {
  console.log('Processing booking response');
  
  try {
    // Parse and validate request body
    if (!event.body) {
      return formatResponse(400, { 
        success: false,
        message: 'Missing request body' 
      });
    }
    
    const body = JSON.parse(event.body);
    
    // Transform field names (tutorId → teacherId, studentId → learnerId)
    const bookingData = {
      bookingId: body.bookingId,
      teacherId: body.teacherId || body.tutorId,
      learnerId: body.learnerId || body.studentId,
      slotId: body.slotId,
      action: body.action
    };
    
    try {
      validateBookingResponse(bookingData);
    } catch (error) {
      return formatResponse(400, {
        success: false,
        message: error.message
      });
    }
    
    // Process based on action type
    let success = false;
    
    if (bookingData.action === 'CONFIRM') {
      success = await handleBookingConfirmation(bookingData);
    } else if (bookingData.action === 'REJECT') {
      success = await handleBookingRejection(bookingData);
    }
    
    if (success) {
      return formatResponse(200, {
        success: true,
        message: `Booking ${bookingData.action.toLowerCase()}ed successfully`
      });
    } else {
      return formatResponse(500, {
        success: false,
        message: `Failed to process booking ${bookingData.action.toLowerCase()}`
      });
    }
    
  } catch (error) {
    console.error('Error processing booking response:', error);
    return formatResponse(500, {
      success: false,
      message: 'Error processing booking response',
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