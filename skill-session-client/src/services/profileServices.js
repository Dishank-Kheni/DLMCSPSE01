import api from './api';

const ProfileService = {
  // Get user profile
  getUserProfile: async (userId, userType) => {
    const data = {
      id: userId,
      userType
    };
    
    const response = await api.post('/get-user-details', data);
    return response.data;
  },
  
  // Update user profile
  updateUserProfile: async (profileData) => {
    const response = await api.post('/save-user-details', profileData);
    return response.data;
  },
  
  // Get profile image
  getProfileImage: async (userId) => {
    const response = await api.get(`/get-profile-img?id=${userId}`);
    return response.data;
  },
  
  // Upload profile image
  uploadProfileImage: async (imageData) => {
    const response = await api.post('/save-profile-img', imageData);
    return response.data;
  },
  
  // Subscribe for email notifications
  subscribeToNotifications: async (email) => {
    const response = await api.post('/subscribeforemail', { email });
    return response.data;
  }
};

export default ProfileService;