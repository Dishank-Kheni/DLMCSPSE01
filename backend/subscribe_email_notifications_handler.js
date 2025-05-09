'use strict';

const AWS = require('aws-sdk');
const sns = new AWS.SNS();

// Configuration constants
const CONFIG = {
  TOPIC_ARN: 'arn:aws:sns:eu-north-1:861474768799:sendBookingUpdate',
  PROTOCOL: 'email'
};

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
  'Access-Control-Allow-Origin': '*'
};

/**
 * Subscribes an email address to an SNS topic
 * @param {Object} params - Subscription parameters
 * @returns {Promise<string|boolean>} - Subscription ARN or false on failure
 */
async function subscribe(params) {
  try {
    const data = await sns.subscribe(params).promise();
    console.log('Subscription created:', data);
    return data.SubscriptionArn;
  } catch (error) {
    console.error('Subscription error:', error);
    throw new Error(`Failed to subscribe: ${error.message}`);
  }
}

/**
 * Sets filter policy attributes on a subscription
 * @param {Object} params - Filter policy parameters
 * @returns {Promise<boolean>} - Success status
 */
async function setSubscriptionAttributes(params) {
  try {
    const data = await sns.setSubscriptionAttributes(params).promise();
    console.log('Filter policy set:', data);
    return true;
  } catch (error) {
    console.error('Set attributes error:', error);
    throw new Error(`Failed to set filter policy: ${error.message}`);
  }
}

/**
 * Validates an email address
 * @param {string} email - Email to validate
 * @returns {boolean} - Validation result
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Lambda handler for email notification subscription
 * @param {Object} event - API Gateway Lambda event
 * @returns {Object} - API response
 */
exports.handler = async (event) => {
  console.log('Processing subscription request');
  
  try {
    // Validate input parameters
    if (!event.queryStringParameters || !event.queryStringParameters.id) {
      return formatResponse(400, { 
        error: 'Missing required parameter: id (email address)' 
      });
    }
    
    const emailAddress = event.queryStringParameters.id;
    
    // Validate email format
    if (!validateEmail(emailAddress)) {
      return formatResponse(400, { 
        error: 'Invalid email format' 
      });
    }
    
    // Prepare subscription parameters
    const subscribeParams = {
      Protocol: CONFIG.PROTOCOL,
      TopicArn: CONFIG.TOPIC_ARN,
      Endpoint: emailAddress,
      ReturnSubscriptionArn: true
    };
    
    // Create subscription
    const subscriptionArn = await subscribe(subscribeParams);
    
    // Set filter policy for the subscription
    const filterPolicyParams = {
      AttributeName: 'FilterPolicy',
      SubscriptionArn: subscriptionArn,
      AttributeValue: JSON.stringify({ email: [emailAddress] })
    };
    
    await setSubscriptionAttributes(filterPolicyParams);
    
    // Return success response
    return formatResponse(200, { 
      success: true, 
      message: 'Subscribed successfully',
      subscriptionArn: subscriptionArn,
      email: emailAddress
    });
    
  } catch (error) {
    console.error('Error processing subscription:', error);
    return formatResponse(500, { 
      success: false, 
      error: error.message || 'Internal server error' 
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
