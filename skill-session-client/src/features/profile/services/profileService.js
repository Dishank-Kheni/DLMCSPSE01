// src/features/profile/services/profileService.js
import api from '../../../services/api';

const profileService = {
  // Get user profile details
  getUserDetails: async (userId, userType) => {
    try {
      const response = await api.post('/get-user-details', {
        id: userId,
        userType: userType
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  },

  // Get profile image
  getProfileImage: async (userId) => {
    try {
      const response = await api.get(`/get-profile-img?id=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile image:', error);
      throw error;
    }
  },

  // Update tutor details
  updateTutorProfile: async (data) => {
    try {
      const response = await api.post('/save-user-details', data);
      return response.data;
    } catch (error) {
      console.error('Error updating tutor profile:', error);
      throw error;
    }
  },

  // Update student details
  updateStudentProfile: async (data) => {
    try {
      const response = await api.post('/save-user-details', data);
      return response.data;
    } catch (error) {
      console.error('Error updating student profile:', error);
      throw error;
    }
  },

  // Upload profile image
  uploadProfileImage: async (data) => {
    try {
      const response = await api.put('/save-profile-img', data);
      return response.data;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }
};

export default profileService;