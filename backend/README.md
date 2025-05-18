Dishank-Kheni: could you write a good read me file for this landa backend?

Workspace: Collecting workspace information# SkillSession Backend API

A serverless backend implementation for the SkillSession tutoring platform built with AWS Lambda, DynamoDB, and API Gateway.

## Overview

SkillSession is a platform connecting learners with teachers for online tutoring sessions. This backend provides all the necessary APIs to support the core features of the platform, including user registration, profile management, availability scheduling, session booking, and real-time notifications.

## Architecture

The application follows a serverless architecture using:

- **AWS Lambda** - For executing code in response to events
- **Amazon DynamoDB** - For data persistence
- **Amazon API Gateway** - For RESTful API endpoints
- **Amazon S3** - For profile image storage
- **Amazon SNS** - For email notifications
- **AWS Cognito** - For user authentication

## API Endpoints

The backend provides the following API endpoints:

### User Management
- **POST /save-user-details** - Register new users and update user profiles
- **POST /get-user-profiles-and-teacher-search** - Retrieve user profiles and search for teachers by skills

### Profile Images
- **PUT /save-profile-img** - Upload profile images to S3
- **GET /get-profile-img-url** - Generate signed URLs for profile images

### Availability and Scheduling
- **POST /create-availability** - Create teacher availability windows
- **POST /get-teacher-slots** - Retrieve available time slots for a teacher

### Booking Management
- **POST /create-booking-request** - Create a booking request for a teacher
- **GET /get-pending-booking-slots** - Get pending booking requests
- **POST /process-booking-response** - Accept or reject booking requests
- **GET /get-teacher-bookings** - Retrieve bookings for a teacher

### Notifications
- **GET /subscribe-email-notifications** - Subscribe users to email notifications

## Getting Started

### Prerequisites
- Node.js 20.x
- AWS CLI configured with appropriate credentials
- AWS SAM CLI (for local development)

### Deployment

The backend is deployed using the AWS CloudFormation templates located in the cloud directory:

1. Deploy the backend resources:
   ```bash
   aws cloudformation deploy --template-file cloud/backend_resources.yaml --stack-name skill-session-backend --capabilities CAPABILITY_IAM
   ```

2. Deploy the client hosting environment:
   ```bash
   aws cloudformation deploy --template-file cloud/elasticbeanstalk.yaml --stack-name skill-session-client --capabilities CAPABILITY_IAM
   ```

### Local Development

For local development and testing:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Use AWS SAM to run functions locally:
   ```bash
   sam local invoke [FunctionName] -e events/[event.json]
   ```

## Table Structure

### `students`

| Field              | Type   | Description                           |
| ------------------ | ------ | ------------------------------------- |
| `student_id`       | String | Primary key                           |
| `email`            | String | Unique identifier for the student     |
| `first_name`       | String | Student's first name                  |
| `last_name`        | String | Student's last name                   |
| `mobile_number`    | String | Student's contact number              |
| `university_name`  | String | University the student attends        |
| `program_name`     | String | Academic program of the student       |
| `enrolled_courses` | String | Courses the student is taking         |
| `start_year`       | String | Year when student began their program |
| `end_year`         | String | Expected graduation year              |

### `skill_session_tutors`

| Field                    | Type   | Description                       |
| ------------------------ | ------ | --------------------------------- |
| `tutor_id`               | String | Primary key                       |
| `email`                  | String | Unique identifier for the tutor   |
| `first_name`             | String | Tutor's first name                |
| `last_name`              | String | Tutor's last name                 |
| `mobile_number`          | String | Tutor's contact number            |
| `teaching_skills`        | String | Skills the tutor can teach        |
| `experience_years`       | String | Years of experience               |
| `experience_description` | String | Description of tutor's experience |

### `skills`

| Field          | Type   | Description                                 |
| -------------- | ------ | ------------------------------------------- |
| `skill_id`     | String | Primary key                                 |
| `skill_name`   | String | Name of the skill                           |
| `tutor_emails` | Set    | Set of emails of tutors teaching this skill |

### `bookings`

| Field                | Type   | Description                    |
| -------------------- | ------ | ------------------------------ |
| `booking_id`         | String | Primary key                    |
| `tutor_id`           | String | Foreign key to tutors table    |
| `student_id`         | String | Foreign key to students table  |
| `slot_id`            | String | Foreign key to slots table     |
| `booking_status`     | String | Status of the booking          |
| `request_created_at` | String | When the booking was requested |
| `booking_date`       | String | Date of the booking            |

### `slots`

| Field         | Type   | Description                 |
| ------------- | ------ | --------------------------- |
| `slot_id`     | String | Primary key                 |
| `start_time`  | String | Start time of the slot      |
| `end_time`    | String | End time of the slot        |
| `slot_status` | String | Status of the slot          |
| `tutor_id`    | String | Foreign key to tutors table |
| `slot_date`   | String | Date of the slot            |

### `availability`

| Field             | Type   | Description                 |
| ----------------- | ------ | --------------------------- |
| `availability_id` | String | Primary key                 |
| `tutor_id`        | String | Foreign key to tutors table |
| `date`            | String | Date of availability        |
| `start_time`      | String | Start time of availability  |
| `end_time`        | String | End time of availability    |

## File Structure

```
backend/
├── create_booking_request_handler.js    # Creates booking requests
├── create_teacher_availability_handler.js  # Manages teacher availability
├── expire_slots_cronjob.js             # Cleans up expired slots
├── get_pending_booking_slots_handler.js # Gets pending booking requests
├── get_profile_image_url_handler.js    # Generates S3 image URLs
├── get_teacher_bookings_handler.js     # Gets bookings for teachers
├── get_teacher_slots_handler.js        # Retrieves available slots
├── get_user_profiles_and_teacher_search_handler.js # User profiles & search
├── process_booking_response_handler.js # Handles booking responses
├── subscribe_email_notifications_handler.js # Manages email subscriptions
├── upload_profile_image_handler.js     # Uploads profile images
├── user_registration_and_profile_handler.js # Handles user registration
└── package.json                        # Project configuration
```

## Technologies

- Node.js
- AWS Lambda
- AWS DynamoDB
- AWS API Gateway
- AWS S3
- AWS SNS
- AWS Cognito
- AWS CloudFormation

## License

ISC