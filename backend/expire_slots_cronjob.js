'use strict';

const AWS = require('aws-sdk');
const moment = require('moment');

// Configuration constants
const CONFIG = {
  REGION: process.env.AWS_REGION || 'eu-north-1',
  SLOTS_TABLE: 'slots',
  STATUS_EXPIRED: 'EXPIRED',
  BATCH_SIZE: 25  // Process in batches to avoid timeout
};

// Initialize AWS clients with proper configuration
AWS.config.update({ region: CONFIG.REGION });
const dynamoDB = new AWS.DynamoDB({
  apiVersion: '2012-08-10'
});
const docClient = new AWS.DynamoDB.DocumentClient();

/**
 * Updates a slot status in DynamoDB
 * @param {string} slotId - The slot ID to update
 * @param {string} status - New status value
 * @returns {Promise<boolean>} - Success status
 */
async function updateSlotStatus(slotId, status) {
  const params = {
    TableName: CONFIG.SLOTS_TABLE,
    Key: { 'id': slotId },
    UpdateExpression: 'set slotstatus = :s',
    ExpressionAttributeValues: { ':s': status },
    ReturnValues: 'UPDATED_NEW'
  };

  try {
    await docClient.update(params).promise();
    console.log(`Updated slot ${slotId} to ${status}`);
    return true;
  } catch (error) {
    console.error(`Failed to update slot ${slotId}:`, error);
    return false;
  }
}

/**
 * Gets all active slots from DynamoDB
 * @returns {Promise<Array>} - Array of slot items
 */
async function getActiveSlots() {
  // We could optimize this by using a GSI on slotstatus
  // or by adding a filter expression to only get non-expired slots
  const params = {
    TableName: CONFIG.SLOTS_TABLE,
    FilterExpression: 'slotstatus <> :expiredStatus',
    ExpressionAttributeValues: {
      ':expiredStatus': { S: CONFIG.STATUS_EXPIRED }
    }
  };

  try {
    // Handle pagination for large tables
    let items = [];
    let lastEvaluatedKey;
    
    do {
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }
      
      const result = await dynamoDB.scan(params).promise();
      items = items.concat(result.Items || []);
      lastEvaluatedKey = result.LastEvaluatedKey;
      
    } while (lastEvaluatedKey);
    
    return items;
  } catch (error) {
    console.error('Error fetching slots:', error);
    throw error;
  }
}

/**
 * Determines if a slot has expired based on date and time
 * @param {string} slotDate - The slot date in YYYY-MM-DD format
 * @param {string} slotEndTime - The slot end time in HH:mm format
 * @returns {boolean} - Whether the slot has expired
 */
function isSlotExpired(slotDate, slotEndTime) {
  // Create moment objects for comparisons
  const now = moment();
  
  // Parse the slot date and time
  const slotDateTime = moment(`${slotDate} ${slotEndTime}`, 'YYYY-MM-DD HH:mm');
  
  // A slot is expired if its end time is in the past
  return now.isAfter(slotDateTime);
}

/**
 * Main function to update expired slot statuses
 * @returns {Promise<object>} - Summary of results
 */
async function updateExpiredSlots() {
  console.log('Starting expired slots update process...');
  
  const results = {
    processed: 0,
    expired: 0,
    failed: 0
  };
  
  try {
    // Get all active slots
    const slots = await getActiveSlots();
    results.processed = slots.length;
    
    console.log(`Processing ${slots.length} active slots`);
    
    // Process slots in batches to avoid timeout
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const slotId = slot.id.S;
      const slotDate = slot.date.S;
      const slotEndTime = slot.endTime.S;
      
      if (isSlotExpired(slotDate, slotEndTime)) {
        console.log(`Slot ${slotId} has expired (${slotDate} ${slotEndTime})`);
        
        const success = await updateSlotStatus(slotId, CONFIG.STATUS_EXPIRED);
        if (success) {
          results.expired++;
        } else {
          results.failed++;
        }
      }
    }
    
    console.log(`Expired slots update complete: ${results.expired} slots expired, ${results.failed} updates failed`);
    return results;
  } catch (error) {
    console.error('Error in updateExpiredSlots:', error);
    throw error;
  }
}

/**
 * Lambda function handler for the cron job
 */
exports.handler = async (event, context) => {
  console.log('Starting expired slots cron job');
  
  try {
    const results = await updateExpiredSlots();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Expired slots processed successfully',
        results
      })
    };
  } catch (error) {
    console.error('Cron job failed:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error processing expired slots',
        error: error.message
      })
    };
  }
};
