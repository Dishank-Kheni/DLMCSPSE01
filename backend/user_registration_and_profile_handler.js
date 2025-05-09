'use strict';

const AWS = require('aws-sdk');

// Initialize AWS SDK clients once (for improved performance across invocations)
const dynamoDB = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

// Configuration constants
const TABLES = {
  LEARNER: 'learners',  // Changed from 'students'
  TEACHER: 'teachers',  // Changed from 'tutors'
  SKILLS: 'skills'
};

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
  'Access-Control-Allow-Origin': '*'
};

/**
 * Database service with methods for DynamoDB operations
 */
class DatabaseService {
  /**
   * Creates a new item in DynamoDB
   * @param {string} tableName - Name of the table
   * @param {Object} item - Item to create
   * @returns {Promise<boolean>} - Success status
   */
  async createItem(tableName, item) {
    try {
      const params = {
        TableName: tableName,
        Item: item
      };
      await dynamoDB.putItem(params).promise();
      return true;
    } catch (error) {
      console.error(`[DB Error] Create item failed: ${error.message}`);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  /**
   * Updates an existing item in DynamoDB
   * @param {Object} params - Update parameters
   * @returns {Promise<Object>} - Updated attributes
   */
  async updateItem(params) {
    try {
      const result = await docClient.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error(`[DB Error] Update item failed: ${error.message}`);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  /**
   * Updates skills table with teacher information
   * @param {string} skill - The skill name
   * @param {string} teacherEmail - The teacher's email
   * @returns {Promise<Object>} - Updated attributes
   */
  async updateTeacherSkill(skill, teacherEmail) {  // Changed from updateTutorSkill
    const params = {
      TableName: TABLES.SKILLS,
      Key: { skill },
      UpdateExpression: 'ADD teachers :teacher',  // Changed from tutors :tutor
      ExpressionAttributeValues: {
        ':teacher': docClient.createSet([teacherEmail])  // Changed from :tutor
      },
      ReturnValues: 'UPDATED_NEW'
    };
    return this.updateItem(params);
  }
}

/**
 * User service with methods for user management
 */
class UserService {
  constructor(dbService) {
    this.db = dbService;
  }

  /**
   * Creates attribute values for DynamoDB
   * @param {string} value - Value to convert
   * @returns {Object} - DynamoDB attribute
   */
  _createAttribute(value = '') {
    return { S: String(value) };
  }

  /**
   * Validates user data for registration
   * @param {Object} userData - User data to validate
   * @throws {Error} If validation fails
   */
  _validateUserData(userData) {
    const requiredFields = ['email', 'firstName', 'lastName', 'userType'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    const validUserTypes = ['learner', 'teacher', 'learner,teacher', 'teacher,learner'];  // Changed from student/tutor
    if (!validUserTypes.includes(userData.userType)) {
      throw new Error(`Invalid userType: ${userData.userType}`);
    }
  }
  
  /**
   * Prepares a user object for learner table
   * @param {Object} userData - User data
   * @returns {Object} - Formatted learner item
   */
  _prepareLearnerItem(userData) {  // Changed from _prepareStudentItem
    return {
      id: this._createAttribute(userData.email),
      firstName: this._createAttribute(userData.firstName),
      lastName: this._createAttribute(userData.lastName),
      mobileNo: this._createAttribute(userData.mobileNo),
      university: this._createAttribute(userData.university || ''),
      program: this._createAttribute(userData.program || ''),
      courses: this._createAttribute(userData.courses || ''),
      startyear: this._createAttribute(userData.startyear || ''),
      endyear: this._createAttribute(userData.endyear || '')
    };
  }

  /**
   * Prepares a user object for teacher table
   * @param {Object} userData - User data
   * @returns {Object} - Formatted teacher item
   */
  _prepareTeacherItem(userData) {  // Changed from _prepareTutorItem
    return {
      id: this._createAttribute(userData.email),
      firstName: this._createAttribute(userData.firstName),
      lastName: this._createAttribute(userData.lastName),
      mobileNo: this._createAttribute(userData.mobileNo),
      skills: this._createAttribute(userData.skills || ''),
      expyears: this._createAttribute(userData.expyears || ''),
      expdesc: this._createAttribute(userData.expdesc || '')
    };
  }

  /**
   * Handles user registration
   * @param {Object} userData - Registration data
   * @returns {Promise<Object>} - Result object
   */
  async registerUser(userData) {
    this._validateUserData(userData);
    
    const { userType } = userData;
    const operations = [];
    
    // Determine which tables need updating based on user type
    if (userType.includes('learner')) {  // Changed from student
      operations.push(
        this.db.createItem(TABLES.LEARNER, this._prepareLearnerItem(userData))  // Changed from STUDENT, _prepareStudentItem
      );
    }
    
    if (userType.includes('teacher')) {  // Changed from tutor
      operations.push(
        this.db.createItem(TABLES.TEACHER, this._prepareTeacherItem(userData))  // Changed from TUTOR, _prepareTutorItem
      );
    }
    
    // Run all database operations in parallel
    await Promise.all(operations);
    return { success: true, message: 'User registered successfully' };
  }

  /**
   * Updates learner profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} - Updated attributes
   */
  async updateLearnerProfile(profileData) {  // Changed from updateStudentProfile
    const { email } = profileData;
    
    // Validate required email
    if (!email) throw new Error('Email is required for profile updates');
    
    const updateParams = {
      TableName: TABLES.LEARNER,  // Changed from STUDENT
      Key: { id: email },
      UpdateExpression: 'SET university = :u, program = :p, courses = :c, startyear = :s, endyear = :e',
      ExpressionAttributeValues: {
        ':u': profileData.university || '',
        ':p': profileData.program || '',
        ':c': profileData.courses || '',
        ':s': profileData.startyear || '',
        ':e': profileData.endyear || ''
      },
      ReturnValues: 'UPDATED_NEW'
    };
    
    return this.db.updateItem(updateParams);
  }

  /**
   * Updates teacher profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} - Updated attributes
   */
  async updateTeacherProfile(profileData) {  // Changed from updateTutorProfile
    const { email, skills } = profileData;
    
    // Validate required email
    if (!email) throw new Error('Email is required for profile updates');
    
    const updateParams = {
      TableName: TABLES.TEACHER,  // Changed from TUTOR
      Key: { id: email },
      UpdateExpression: 'SET skills = :s, expyears = :y, expdesc = :d',
      ExpressionAttributeValues: {
        ':s': profileData.skills || '',
        ':y': profileData.expyears || '',
        ':d': profileData.expdesc || ''
      },
      ReturnValues: 'UPDATED_NEW'
    };
    
    const result = await this.db.updateItem(updateParams);
    
    // Update individual skills if provided as an array
    if (Array.isArray(skills) && skills.length > 0) {
      const skillUpdates = skills.map(skill => 
        this.db.updateTeacherSkill(skill, email)  // Changed from updateTutorSkill
      );
      await Promise.all(skillUpdates);
    }
    
    return result;
  }
}

/**
 * Lambda function handler
 */
exports.handler = async (event, context) => {
  // Initialize services
  const dbService = new DatabaseService();
  const userService = new UserService(dbService);

  try {
    // Parse and validate request body
    if (!event.body) {
      return formatResponse(400, { 
        error: 'Missing request body' 
      });
    }
    
    const body = JSON.parse(event.body);
    
    // Handle the appropriate action
    let result;
    if (body.register === true) {
      result = await userService.registerUser(body);
    } else if (body.email) {
      // Determine profile type and update accordingly
      if (body.skills !== undefined) {
        result = await userService.updateTeacherProfile(body);  // Changed from updateTutorProfile
      } else {
        result = await userService.updateLearnerProfile(body);  // Changed from updateStudentProfile
      }
    } else {
      return formatResponse(400, { 
        error: 'Invalid request: missing required fields' 
      });
    }
    
    return formatResponse(200, result);
  } catch (error) {
    console.error('Error processing request:', error);
    
    // Determine appropriate status code based on error type
    const statusCode = error.message.includes('validation') ? 400 : 500;
    const errorMessage = statusCode === 400 ? error.message : 'Internal server error';
    
    return formatResponse(statusCode, { error: errorMessage });
  }
};

/**
 * Formats the API response with appropriate status code and CORS headers
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
