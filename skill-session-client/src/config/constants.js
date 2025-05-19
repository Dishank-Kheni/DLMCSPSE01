// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  SIGN_UP: '/save-user-details',
  SIGN_IN: '/signin',
  
  // Tutor
  SAVE_AVAILABILITY: '/save-availability',
  GET_AVAILABILITY: '/get-availability',
  GET_TUTOR_BOOKINGS: '/get-tutor-bookings',
  UPDATE_BOOKING: '/updaterequest',
  
  // Student
  SAVE_SLOT_BOOKING: '/saveslot-booking',
  GET_BOOKING_SLOT_PENDING: '/getbookingslotinpending',
  
  // Profile
  GET_USER_DETAILS: '/get-user-details',
  SAVE_USER_DETAILS: '/save-user-details',
  GET_PROFILE_IMAGE: '/get-profile-img',
  SAVE_PROFILE_IMAGE: '/save-profile-img',
  SUBSCRIBE_EMAIL: '/subscribeforemail',
  
  // Slots
  GET_SLOT_DETAILS: '/getslotdetails',
};

// Booking statuses
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRM: 'CONFIRM',
  REJECT: 'REJECT',
  EXPIRED: 'EXPIRED',
};

// User Types
export const USER_TYPE = {
  TUTOR: 'tutor',
  STUDENT: 'student',
};


export const API_BASE_URL = 'https://cj7g8r0lhl.execute-api.eu-north-1.amazonaws.com/Production'; // Update this to your actual API base URL