// src/features/profile/pages/Profile.js
import { Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import GeneralForm from '../components/GeneralForm';
import StudentForm from '../components/StudentForm';
import TutorForm from '../components/TutorForm';
import profileService from '../services/profileService';
import '../styles/Profile.css';

const Profile = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    profileImage: '',
    firstName: '',
    lastName: '',
    email: '',
    mobileNo: '',
    // Student data
    university: '',
    program: '',
    courses: '',
    startyear: '',
    endyear: '',
    // Tutor data
    skills: '',
    expyears: '',
    expdesc: ''
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Get profile image
        const imageUrl = await profileService.getProfileImage(auth.username);
        
        // Get user details
        const userDetails = await profileService.getUserDetails(
          auth.username,
          auth.userType
        );
        
        setUserData({
          ...userData,
          profileImage: imageUrl,
          firstName: auth.firstName,
          lastName: auth.lastName,
          email: auth.username,
          mobileNo: auth.mobileNo,
          // Map other fields from API response
          ...userDetails
        });
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (auth.username) {
      loadUserData();
    }
  }, [auth]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spin size="large" />
        <p className="mt-3">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2 className="text-center mb-4">Profile Management</h2>
      
      {/* General Information Form */}
      <GeneralForm userData={userData} />
      
      {/* Conditional rendering based on user type */}
      {auth.isTutor && <TutorForm tutorData={userData} />}
      
      {auth.isStudent && <StudentForm studentData={userData} />}
    </div>
  );
};

export default Profile;