const AWS = require("aws-sdk");

// Initialize AWS SDK clients once (outside the handler for reuse across invocations)
const documentClient = new AWS.DynamoDB.DocumentClient();
const dynamoDB = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

// Constants
const TABLES = {
  STUDENT: "students",
  TUTOR: "tutors",
  SKILLS: "skills",
};

// Standard headers for all responses
const CORS_HEADERS = {
  "Content-Type": "application/json",
  "access-control-allow-headers":
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "access-control-allow-methods": "OPTIONS,POST",
  "access-control-allow-origin": "*",
};

/**
 * Creates a new item in DynamoDB
 * @param {Object} params - Parameters for putItem operation
 * @returns {Promise<boolean>} - Success status of the operation
 */
async function createItem(params) {
  try {
    await dynamoDB.putItem(params).promise();
    return true;
  } catch (error) {
    console.error(`Error creating item: ${error.message}`);
    return false;
  }
}

/**
 * Updates an existing item in DynamoDB
 * @param {Object} params - Parameters for update operation
 * @returns {Promise<boolean>} - Success status of the operation
 */
async function updateItem(params) {
  try {
    await documentClient.update(params).promise();
    return true;
  } catch (error) {
    console.error(`Error updating item: ${error.message}`);
    return false;
  }
}

/**
 * Updates the skills table with tutor information
 * @param {string} skill - The skill to update
 * @param {string} email - The tutor's email
 * @returns {Promise<boolean>} - Success status of the operation
 */
async function updateTutorSkills(skill, email) {
  const skillsParams = {
    TableName: TABLES.SKILLS,
    Key: { skill: skill },
    UpdateExpression: "add tutors :t",
    ExpressionAttributeValues: {
      ":t": documentClient.createSet([email]),
    },
    ReturnValues: "UPDATED_NEW",
  };

  return await updateItem(skillsParams);
}

/**
 * Creates a DynamoDB attribute value
 * @param {string} value - Value to convert
 * @returns {Object} - DynamoDB formatted attribute
 */
function createAttribute(value) {
  return { S: String(value || "") };
}

/**
 * Prepares student item for DynamoDB
 * @param {Object} userData - User data
 * @returns {Object} - Formatted student item
 */
function prepareStudentItem(userData) {
  return {
    id: createAttribute(userData.email),
    firstName: createAttribute(userData.firstName),
    lastName: createAttribute(userData.lastName),
    mobileNo: createAttribute(userData.mobileNo),
    university: createAttribute(""),
    program: createAttribute(""),
    courses: createAttribute(""),
    startyear: createAttribute(""),
    endyear: createAttribute(""),
  };
}

/**
 * Prepares tutor item for DynamoDB
 * @param {Object} userData - User data
 * @returns {Object} - Formatted tutor item
 */
function prepareTutorItem(userData) {
  return {
    id: createAttribute(userData.email),
    firstName: createAttribute(userData.firstName),
    lastName: createAttribute(userData.lastName),
    mobileNo: createAttribute(userData.mobileNo),
    skills: createAttribute(""),
    expyears: createAttribute(""),
    expdesc: createAttribute(""),
  };
}

/**
 * Handles user registration
 * @param {Object} userData - User registration data
 * @returns {Promise<void>}
 */
async function handleRegistration(userData) {
  if (userData.register !== true) return;

  const userType = userData.userType;
  const tasks = [];

  // Prepare parameters for student and tutor tables
  const studentParams = {
    TableName: TABLES.STUDENT,
    Item: prepareStudentItem(userData),
  };

  const tutorParams = {
    TableName: TABLES.TUTOR,
    Item: prepareTutorItem(userData),
  };

  // Start registration operations concurrently based on user type
  if (userType.includes(",")) {
    tasks.push(createItem(studentParams));
    tasks.push(createItem(tutorParams));
  } else if (userType === "tutor") {
    tasks.push(createItem(tutorParams));
  } else {
    tasks.push(createItem(studentParams));
  }

  // Wait for all operations to complete
  await Promise.all(tasks);
}

/**
 * Handles profile updates for existing users
 * @param {Object} userData - User profile data to update
 * @returns {Promise<void>}
 */
async function handleProfileUpdate(userData) {
  if (userData.skills) {
    // Tutor profile update
    const tutorUpdateParams = {
      TableName: TABLES.TUTOR,
      Key: { id: userData.email },
      UpdateExpression:
        "set skills = :skills, expyears = :expyears, expdesc = :expdesc",
      ExpressionAttributeValues: {
        ":skills": userData.skills,
        ":expyears": userData.expyears,
        ":expdesc": userData.expdesc,
      },
      ReturnValues: "UPDATED_NEW",
    };

    await updateItem(tutorUpdateParams);

    // If skills are provided, we could also update the skills table
    // This potential enhancement is commented out as it depends on how skills are structured
    /*
    if (Array.isArray(userData.skills)) {
      const skillPromises = userData.skills.map(skill => updateTutorSkills(skill, userData.email));
      await Promise.all(skillPromises);
    }
    */
  } else {
    // Student profile update
    const studentUpdateParams = {
      TableName: TABLES.STUDENT,
      Key: { id: userData.email },
      UpdateExpression:
        "set university = :university, program = :program, courses = :courses, startyear = :startyear, endyear = :endyear",
      ExpressionAttributeValues: {
        ":university": userData.university,
        ":program": userData.program,
        ":courses": userData.courses,
        ":startyear": userData.startyear,
        ":endyear": userData.endyear,
      },
      ReturnValues: "UPDATED_NEW",
    };

    await updateItem(studentUpdateParams);
  }
}

/**
 * Lambda function handler
 */
exports.handler = async (event, context) => {
  let body;
  let statusCode = "200";

  try {
    body = JSON.parse(event.body);

    if (body.register) {
      await handleRegistration(body);
    } else {
      await handleProfileUpdate(body);
    }
  } catch (err) {
    statusCode = "400";
    body = { error: err.message || "Bad request" };
    console.error("Error processing request:", err);
  }

  return {
    statusCode,
    body: JSON.stringify(body),
    headers: CORS_HEADERS,
  };
};
