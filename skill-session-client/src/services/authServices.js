import {
    AuthenticationDetails,
    CognitoUser,
    CognitoUserAttribute,
    CognitoUserPool
} from 'amazon-cognito-identity-js';
import pooldetails from '../config/cognito';

// Create the Cognito User Pool instance
const userPool = new CognitoUserPool(pooldetails);

const AuthService = {
  // Sign up a new user
  signUp: async (userData) => {
    const { email, password, firstName, lastName, mobileno, userType } = userData;
    
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({ Name: 'given_name', Value: firstName }),
        new CognitoUserAttribute({ Name: 'family_name', Value: lastName }),
        new CognitoUserAttribute({ Name: 'phone_number', Value: mobileno }),
        new CognitoUserAttribute({ Name: 'custom:userType', Value: userType }),
        new CognitoUserAttribute({ Name: 'email', Value: email })
      ];

      userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  },

  // Sign in a user
  signIn: async (email, password) => {
    const authenticationData = {
      Username: email,
      Password: password,
    };
    
    const authenticationDetails = new AuthenticationDetails(authenticationData);
    const userData = {
      Username: email,
      Pool: userPool
    };
    
    const cognitoUser = new CognitoUser(userData);
    
    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          // Get the tokens
          const accessToken = result.getAccessToken().getJwtToken();
          const idToken = result.getIdToken().getJwtToken();
          
          // Store tokens and user data
          localStorage.setItem('token', idToken);
          localStorage.setItem('username', email);
          
          // Extract user type from token payload
          const payload = idToken.split('.')[1];
          const decodedPayload = JSON.parse(atob(payload));
          
          // Store user type 
          if (decodedPayload['custom:userType']) {
            const userType = decodedPayload['custom:userType'];
            localStorage.setItem('userType', userType);
            
            // Store tutor/student flags
            if (userType.includes('tutor')) {
              localStorage.setItem('tutor', 'tutor');
            }
            if (userType.includes('student')) {
              localStorage.setItem('student', 'student');
            }
          }
          
          resolve(result);
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  },

  // Sign out the current user
  signOut: () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userType');
    localStorage.removeItem('tutor');
    localStorage.removeItem('student');
  },

  // Verify user account with confirmation code
  verifyAccount: (email, code) => {
    const userData = {
      Username: email,
      Pool: userPool
    };
    
    const cognitoUser = new CognitoUser(userData);
    
    return new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  },

  // Request a password reset
  forgotPassword: (email) => {
    const userData = {
      Username: email,
      Pool: userPool
    };
    
    const cognitoUser = new CognitoUser(userData);
    
    return new Promise((resolve, reject) => {
      cognitoUser.forgotPassword({
        onSuccess: (data) => {
          resolve(data);
        },
        onFailure: (err) => {
          reject(err);
        },
        inputVerificationCode: (data) => {
          resolve(data);
        }
      });
    });
  },

  // Reset password using verification code
  resetPassword: (email, code, newPassword) => {
    const userData = {
      Username: email,
      Pool: userPool
    };
    
    const cognitoUser = new CognitoUser(userData);
    
    return new Promise((resolve, reject) => {
      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => {
          resolve(true);
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  },

  // Get current authenticated user
  getCurrentUser: () => {
    return userPool.getCurrentUser();
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },

  // Resend confirmation code
  resendConfirmationCode: (email) => {
    const userData = {
      Username: email,
      Pool: userPool
    };
    
    const cognitoUser = new CognitoUser(userData);
    
    return new Promise((resolve, reject) => {
      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }
};

export default AuthService;