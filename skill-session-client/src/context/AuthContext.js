import { createContext, useEffect, useState } from 'react';
import AuthService from '../services/authService';

// Create the context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Auth state
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    profileType: null,
  });

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isAuthenticated = AuthService.isAuthenticated();
        
        if (isAuthenticated) {
          const username = localStorage.getItem('username');
          const userType = localStorage.getItem('userType');
          
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: {
              username,
              userType,
              isTutor: localStorage.getItem('tutor') !== null,
              isStudent: localStorage.getItem('student') !== null,
            },
            profileType: localStorage.getItem('profileType') || null,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            profileType: null,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          profileType: null,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      await AuthService.signIn(email, password);
      
      const username = localStorage.getItem('username');
      const userType = localStorage.getItem('userType');
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: {
          username,
          userType,
          isTutor: localStorage.getItem('tutor') !== null,
          isStudent: localStorage.getItem('student') !== null,
        },
        profileType: null,
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    AuthService.signOut();
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      profileType: null,
    });
  };

  const setProfileType = (type) => {
    localStorage.setItem('profileType', type);
    setAuthState({
      ...authState,
      profileType: type,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        setProfileType,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};