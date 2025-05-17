// src/features/auth/services/authService.js
import {
    AuthenticationDetails,
    CognitoUser,
    CognitoUserAttribute,
    CognitoUserPool
} from 'amazon-cognito-identity-js';
import poolDetails from '../../../config/cognito-config.json';

const userPool = new CognitoUserPool(poolDetails);

export const authService = {
  // Sign up a new user
  signUp: (userData) => {
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({ Name: 'given_name', Value: userData.firstName }),
        new CognitoUserAttribute({ Name: 'family_name', Value: userData.lastName }),
        new CognitoUserAttribute({ Name: 'phone_number', Value: userData.mobileNo }),
        new CognitoUserAttribute({ Name: 'custom:userType', Value: userData.userType })
      ];

      userPool.signUp(
        userData.email,
        userData.password,
        attributeList,
        null,
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            localStorage.setItem('username', userData.email);
            resolve(result);
          }
        }
      );
    });
  },

  // Sign in user
  signIn: (email, password) => {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          // Store user data in local storage
          localStorage.setItem('token', result.getIdToken().getJwtToken());
          localStorage.setItem('username', result.getIdToken().payload.email);
          localStorage.setItem('firstnameCloud', result.getIdToken().payload.given_name);
          localStorage.setItem('lastnameCloud', result.getIdToken().payload.family_name);
          localStorage.setItem('mobilenoCloud', result.getIdToken().payload.phone_number);
          localStorage.setItem('userType', result.getIdToken().payload['custom:userType']);
          
          // Set user type based on custom attribute
          if (result.getIdToken().payload['custom:userType'].includes('tutor')) {
            localStorage.setItem('tutor', 'tutor');
          }
          if (result.getIdToken().payload['custom:userType'].includes('student')) {
            localStorage.setItem('student', 'student');
          }
          
          resolve(result);
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  },

  // Verify user account
  verifyAccount: (email, code) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  // Request password reset
  forgotPassword: (email) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.forgotPassword({
        onSuccess: (data) => {
          resolve(data);
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  },

  // Reset password with code
  resetPassword: (email, code, newPassword) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => {
          resolve();
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  }
};