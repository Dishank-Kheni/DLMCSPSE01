'use strict';

const AWS = require('aws-sdk');

// Initialize AWS SDK clients
AWS.config.update({
  region: 'eu-north-1'
});

const dynamoDB = new AWS.DynamoDB({
  apiVersion: '2012-08-10'
});

// Configuration constants
const CONFIG = {
  TEACHER_TABLE: 'teachers',  // Changed from 'tutor-details'
  LEARNER_TABLE: 'learners'   // Changed from 'student-details'
};

// CORS headers for all responses
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
  'Access-Control-Allow-Origin': '*'
};

/**
 * Gets a user's profile from DynamoDB
 * @param {string} tableName - Table to query
 * @param {string} userId - User ID to retrieve
 * @returns {Promise<Object|null>} - User profile or null if not found
 */
async function getUserProfile(tableName, userId) {
  const params = {
    TableName: tableName,
    Key: {
      'id': { S: userId }
    }
  };

  try {
    const result = await dynamoDB.getItem(params).promise();
    return result.Item;
  } catch (error) {
    console.error(`Error fetching user profile from ${tableName}:`, error);
    throw new Error(`Failed to retrieve user profile: ${error.message}`);
  }
}

/**
 * Formats a DynamoDB item into a standardized user profile
 * @param {Object} item - DynamoDB item
 * @param {string} userType - Type of user (teacher, learner, both)
 * @returns {Object} - Formatted user profile
 */
function formatUserProfile(item, userType) {
  const profile = {};
  
  // Common fields
  if (item.firstName) profile.firstName = item.firstName.S;
  if (item.lastName) profile.lastName = item.lastName.S;
  if (item.mobileNo) profile.mobileNo = item.mobileNo.S;
  if (item.id) profile.email = item.id.S;
  
  // Teacher-specific fields
  if (userType.includes('teacher') && item.skills) {
    profile.skills = item.skills.S;
    profile.expyears = item.expyears?.S;
    profile.expdesc = item.expdesc?.S;
  }
  
  // Learner-specific fields
  if (userType.includes('learner')) {
    if (item.courses) profile.courses = item.courses.S;
    if (item.program) profile.program = item.program.S;
    if (item.university) profile.university = item.university.S;
    if (item.startyear) profile.startyear = item.startyear.N || item.startyear.S;
    if (item.endyear) profile.endyear = item.endyear.N || item.endyear.S;
  }
  
  return profile;
}

/**
 * Searches for teachers by skills
 * @param {string} skillsQuery - Comma-separated list of skills to search for
 * @returns {Promise<Array>} - Array of matching teacher profiles
 */
async function searchTeachersBySkills(skillsQuery) {
  const teachers = new Set();
  
  try {
    // If empty query, return all teachers
    if (!skillsQuery || skillsQuery.trim() === ' ') {
      const params = {
        TableName: CONFIG.TEACHER_TABLE
      };
      
      const result = await dynamoDB.scan(params).promise();
      return result.Items.map(item => formatUserProfile(item, 'teacher'));
    }
    
    // Search for each skill
    const skills = skillsQuery.split(',').map(skill => skill.trim());
    
    for (const skill of skills) {
      const params = {
        TableName: CONFIG.TEACHER_TABLE,
        FilterExpression: 'contains(skills, :skill)',
        ExpressionAttributeValues: {
          ':skill': { S: skill }
        }
      };
      
      const result = await dynamoDB.scan(params).promise();
      
      // Add formatted results to set (avoids duplicates)
      result.Items.forEach(item => {
        teachers.add(JSON.stringify(formatUserProfile(item, 'teacher')));
      });
    }
    
    // Convert back from Set of JSON strings to array of objects
    return Array.from(teachers).map(json => JSON.parse(json));
  } catch (error) {
    console.error('Error searching for teachers:', error);
    throw new Error(`Failed to search for teachers: ${error.message}`);
  }
}

/**
 * Validates request body
 * @param {Object} body - Request body to validate
 * @returns {Object} - Validation result with error or success
 */
function validateRequest(body) {
  if (!body) {
    return { valid: false, error: 'Missing request body' };
  }
  
  // Check for required search parameters
  if (!body.id && !body.skills) {
    return { 
      valid: false, 
      error: 'Missing required parameters: either id (for profile) or skills (for search) is required' 
    };
  }
  
  // Additional validation for user profile requests
  if (body.id && !body.userType) {
    return { valid: false, error: 'User type is required when retrieving a profile' };
  }
  
  return { valid: true };
}

/**
 * Lambda handler for user profiles and teacher search
 * @param {Object} event - API Gateway Lambda event
 * @returns {Object} - API response
 */
exports.handler = async (event) => {
  console.log('Processing user profile or teacher search request');
  
  try {
    // Parse and validate request body
    if (!event.body) {
      return formatResponse(400, { 
        error: 'Missing request body' 
      });
    }
    
    const body = JSON.parse(event.body);
    const validation = validateRequest(body);
    
    if (!validation.valid) {
      return formatResponse(400, { error: validation.error });
    }
    
    // CASE 1: User profile request
    if (body.id) {
      const userId = body.id;
      const userType = body.userType.toLowerCase();
      
      // Handle different user types
      if (userType.includes(',')) {
        // User is both teacher and learner
        const teacherProfile = await getUserProfile(CONFIG.TEACHER_TABLE, userId);
        const learnerProfile = await getUserProfile(CONFIG.LEARNER_TABLE, userId);
        
        if (!teacherProfile || !learnerProfile) {
          return formatResponse(404, { error: 'User profile not found' });
        }
        
        // Combine profiles
        const profile = {
          ...formatUserProfile(teacherProfile, 'teacher'),
          ...formatUserProfile(learnerProfile, 'learner')
        };
        
        return formatResponse(200, profile);
      } else if (userType === 'teacher') {
        // User is a teacher
        const teacherProfile = await getUserProfile(CONFIG.TEACHER_TABLE, userId);
        
        if (!teacherProfile) {
          return formatResponse(404, { error: 'Teacher profile not found' });
        }
        
        return formatResponse(200, formatUserProfile(teacherProfile, 'teacher'));
      } else if (userType === 'learner') {
        // User is a learner
        const learnerProfile = await getUserProfile(CONFIG.LEARNER_TABLE, userId);
        
        if (!learnerProfile) {
          return formatResponse(404, { error: 'Learner profile not found' });
        }
        
        return formatResponse(200, formatUserProfile(learnerProfile, 'learner'));
      } else {
        return formatResponse(400, { error: 'Invalid user type' });
      }
    }
    
    // CASE 2: Teacher search request
    if (body.skills !== undefined) {
      const skillsQuery = body.skills;
      const teachers = await searchTeachersBySkills(skillsQuery);
      
      return formatResponse(200, { teachers });
    }
    
    // Should never reach here due to validation
    return formatResponse(400, { error: 'Invalid request parameters' });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return formatResponse(500, { 
      error: 'Error processing request',
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