import { createContext, useContext, useEffect, useState } from 'react';
import authService from '../features/auth/services/authService';

// Create the context
const AuthContext = createContext();

// Create a custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    isLoading: true,
    username: '',
    firstName: '',
    lastName: '',
    mobileNo: '',
    userType: '',
    isTutor: false,
    isStudent: false,
    profileType: '', // 'tutor' or 'student' for users with both roles
    profilePic: ''
  });

  // On component mount, check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Try to get current session
        const session = await authService.getCurrentSession();
        
        if (session) {
          const userInfo = session.getIdToken().payload;
          
          // Set user data from token
          setAuth({
            isAuthenticated: true,
            isLoading: false,
            username: userInfo.email,
            firstName: userInfo.given_name || '',
            lastName: userInfo.family_name || '',
            mobileNo: userInfo.phone_number || '',
            userType: userInfo['custom:userType'] || '',
            isTutor: userInfo['custom:userType']?.includes('tutor') || false,
            isStudent: userInfo['custom:userType']?.includes('student') || false,
            profileType: userInfo['custom:userType']?.includes('tutor') ? 'tutor' : 'student',
            profilePic: ''
          });
          
          // Try to get profile picture if available
          try {
            const profileImg = await authService.getProfileImage(userInfo.email);
            if (profileImg) {
              setAuth(prev => ({...prev, profilePic: profileImg}));
            }
          } catch (error) {
            console.error('Failed to load profile image:', error);
          }
        } else {
          setAuth(prev => ({...prev, isAuthenticated: false, isLoading: false}));
        }
      } catch (error) {
        console.error('Auth status check failed:', error);
        setAuth(prev => ({...prev, isAuthenticated: false, isLoading: false}));
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (userData) => {
    setAuth({
      isAuthenticated: true,
      isLoading: false,
      username: userData.username,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      mobileNo: userData.mobileNo || '',
      userType: userData.userType || '',
      isTutor: userData.userType?.includes('tutor') || false,
      isStudent: userData.userType?.includes('student') || false,
      profileType: userData.profileType || (userData.userType?.includes('tutor') ? 'tutor' : 'student'),
      profilePic: userData.profilePic || ''
    });
  };

  // Logout function
  const logoutUser = async () => {
    try {
      await authService.signOut();
      
      // Reset auth state
      setAuth({
        isAuthenticated: false,
        isLoading: false,
        username: '',
        firstName: '',
        lastName: '',
        mobileNo: '',
        userType: '',
        isTutor: false,
        isStudent: false,
        profileType: '',
        profilePic: ''
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Function to set profile type (for users who are both tutor and student)
  const setProfileType = (type) => {
    if (type === 'tutor' || type === 'student') {
      setAuth(prev => ({...prev, profileType: type}));
    }
  };

  // The value that will be provided to consumers of this context
  const value = {
    auth: {
      ...auth,
      setProfileType
    },
    login,
    logoutUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};