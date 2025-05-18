// src/features/student/services/studentService.js
import api from '../../../services/api';

const studentService = {
  // Get list of all tutors
  getTutorList: async () => {
    try {
      const response = await api.get('/get-tutor-list');
      return response.data;
    } catch (error) {
      console.error('Error fetching tutor list:', error);
      throw error;
    }
  },

  // Get tutor details including availability
  getTutorDetails: async (tutorId) => {
    try {
      const response = await api.post('/get-user-details', {
        id: tutorId,
        userType: 'tutor'
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching tutor details:', error);
      throw error;
    }
  },

  // Get tutor availability
  getTutorAvailability: async (tutorId) => {
    try {
      const response = await api.get(`/get-availability?id=${tutorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tutor availability:', error);
      throw error;
    }
  },

  // Book a slot with a tutor
  bookTutorSlot: async (data) => {
    try {
      const response = await api.post('/save-slot-booking', data);
      return response.data;
    } catch (error) {
      console.error('Error booking tutor slot:', error);
      throw error;
    }
  },

  // Get student's bookings
  getStudentBookings: async (studentId) => {
    try {
      const response = await api.post('/get-student-bookings', {
        id: studentId
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching student bookings:', error);
      throw error;
    }
  }
};

export default studentService;