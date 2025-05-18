import { Auth } from 'aws-amplify';
import api from '../../../services/api';

const authService = {
  // Sign in
  signIn: async (email, password) => {
    try {
      const user = await Auth.signIn(email, password);
      return user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  // Sign up
  signUp: async (userData) => {
    try {
      const { email, password, firstName, lastName, mobileNo, userType } = userData;
      
      const result = await Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
          given_name: firstName,
          family_name: lastName,
          phone_number: mobileNo,
          'custom:userType': userType
        }
      });
      
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  // Verify account
  verifyAccount: async (email, code) => {
    try {
      const result = await Auth.confirmSignUp(email, code);
      return result;
    } catch (error) {
      console.error('Verify account error:', error);
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const result = await Auth.forgotPassword(email);
      return result;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (email, code, newPassword) => {
    try {
      const result = await Auth.forgotPasswordSubmit(email, code, newPassword);
      return result;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  // Get current session
  getCurrentSession: async () => {
    try {
      const session = await Auth.currentSession();
      return session;
    } catch (error) {
      if (error !== 'No current user') {
        console.error('Get current session error:', error);
      }
      return null;
    }
  },

  // Get current authenticated user
  getCurrentUser: async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Refresh session
  refreshSession: async () => {
    try {
      const cognitoUser = await Auth.currentAuthenticatedUser();
      const currentSession = await Auth.currentSession();
      
      cognitoUser.refreshSession(
        currentSession.getRefreshToken(),
        (err, session) => {
          if (err) {
            throw err;
          }
          return session;
        }
      );
    } catch (error) {
      console.error('Refresh session error:', error);
      throw error;
    }
  },

  // Get profile image
  getProfileImage: async (username) => {
    try {
      const response = await api.get(`/get-profile-img?id=${username}`);
      return response.data;
    } catch (error) {
      console.error('Get profile image error:', error);
      return null;
    }
  }
};

export default authService;