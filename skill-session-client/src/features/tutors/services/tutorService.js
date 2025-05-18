// src/features/tutor/services/tutorService.js
import api from '../../../services/api';

const tutorService = {
  // Get tutor's availability slots
  getAvailability: async (tutorId) => {
    try {
      const response = await api.get(`/get-availability?id=${tutorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching availability:', error);
      throw error;
    }
  },

  // Save new availability slot
  saveAvailability: async (data) => {
    try {
      const response = await api.post('/save-availability', data);
      return response.data;
    } catch (error) {
      console.error('Error saving availability:', error);
      throw error;
    }
  },

  // Get tutor's booking requests
  getBookings: async (tutorId) => {
    try {
      const response = await api.post('/get-tutor-bookings', {
        id: tutorId
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  // Update booking status (confirm/reject)
  updateBookingStatus: async (data) => {
    try {
      const response = await api.post('/update-booking-status', data);
      return response.data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }
};

export default tutorService;