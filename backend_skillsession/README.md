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

| Field              | Type   | Description                    |
| ------------------ | ------ | ------------------------------ |
| `booking_id`       | String | Primary key                    |
| `tutor_id`         | String | Foreign key to tutors table    |
| `student_id`       | String | Foreign key to students table  |
| `slot_id`          | String | Foreign key to slots table     |
| `booking_status`   | String | Status of the booking          |
| `request_created_at` | String | When the booking was requested |
| `booking_date`     | String | Date of the booking            |

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
