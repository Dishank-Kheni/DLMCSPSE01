// src/context/AuthContext.js
import { CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';
import { createContext, useContext, useEffect, useState } from 'react';
import poolDetails from '../config/cognito-config.json';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    username: null,
    firstName: null,
    lastName: null,
    mobileNo: null,
    userType: null,
    isTutor: false,
    isStudent: false,
    profileType: null,
  });

  // Load auth state from localStorage on app initialization
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuth({
        isAuthenticated: true,
        username: localStorage.getItem('username'),
        firstName: localStorage.getItem('firstnameCloud'),
        lastName: localStorage.getItem('lastnameCloud'),
        mobileNo: localStorage.getItem('mobilenoCloud'),
        userType: localStorage.getItem('userType'),
        isTutor: localStorage.getItem('tutor') === 'tutor',
        isStudent: localStorage.getItem('student') === 'student',
        profileType: localStorage.getItem('tutor') === 'tutor' ? 'tutor' : 'student'
      });
    }
  }, []);

  const logoutUser = () => {
    const userPool = new CognitoUserPool(poolDetails);
    const cognitoUser = new CognitoUser({
      Username: auth.username,
      Pool: userPool
    });
    
    cognitoUser.signOut();
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('firstnameCloud');
    localStorage.removeItem('lastnameCloud');
    localStorage.removeItem('mobilenoCloud');
    localStorage.removeItem('userType');
    localStorage.removeItem('tutor');
    localStorage.removeItem('student');
    
    // Reset auth state
    setAuth({
      isAuthenticated: false,
      username: null,
      firstName: null,
      lastName: null,
      mobileNo: null,
      userType: null,
      isTutor: false,
      isStudent: false,
      profileType: null
    });
  };

  const setProfileType = (type) => {
    setAuth(prev => ({
      ...prev,
      profileType: type
    }));
  };

  return (
    <AuthContext.Provider value={{ 
      auth, 
      setAuth, 
      logoutUser,
      setProfileType
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);