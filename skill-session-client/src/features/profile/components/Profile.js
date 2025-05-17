import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import profileService from '../../../services/profileService';
import '../styles/Profile.css';
import GeneralForm from './GeneralForm';
import StudentForm from './StudentForm';
import TutorForm from './TutorForm';

// Student form validation schema
const studentValidator = Yup.object().shape({
  university: Yup.string().required('University name is required.'),
  program: Yup.string().required('Program name is required.'),
  startYear: Yup.number().required('Start year is required.'),
  endYear: Yup.number()
    .required('End year is required.')
    .moreThan(Yup.ref('startYear'), 'End year should be greater than start year'),
});

// Tutor form validation schema
const tutorValidator = Yup.object().shape({
  desc: Yup.string().required('Description is required.'),
  fieldExperience: Yup.number().min(0, 'Experience must be positive')
});

// Initial values for the general form
const generalInitialValues = {
  firstName: localStorage.getItem('firstnameCloud') || '',
  lastName: localStorage.getItem('lastnameCloud') || '',
  email: localStorage.getItem('username') || '',
  mobileNo: localStorage.getItem('mobilenoCloud') || ''
};

// Initial values for the student form
const studentInitialValues = {
  university: '',
  program: '',
  startYear: 0,
  endYear: 0
};

// Initial values for the tutor form
const tutorInitialValues = {
  desc: '',
  fieldExperience: 0
};

const Profile = () => {
  // State management
  const [skills, setSkills] = useState([]);
  const [skillOptions, setSkillOptions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [profilePic, setProfilePic] = useState('');
  const [tutorValues, setTutorValues] = useState(tutorInitialValues);
  const [studentValues, setStudentValues] = useState(studentInitialValues);

  useEffect(() => {
    // Load profile image and user details
    const loadProfileData = async () => {
      try {
        // Load profile image
        const username = localStorage.getItem('username');
        if (username) {
          const imageUrl = await profileService.getProfileImage(username);
          setProfilePic(imageUrl);
        }

        // Load user details
        const userType = localStorage.getItem('userType');
        if (username && userType) {
          const userData = await profileService.getUserDetails({
            id: username,
            userType
          });

          // Handle tutor data
          if (localStorage.getItem('tutor')) {
            setTutorValues({
              desc: userData.expdesc || '',
              fieldExperience: parseInt(userData.expyears) || 0
            });

            // Process skills
            if (userData.skills) {
              const skillsArr = userData.skills.split(',');
              const formattedSkills = skillsArr.map(skill => ({
                value: skill,
                label: skill.toUpperCase()
              }));
              setSkillOptions(formattedSkills);
              setSkills(formattedSkills);
            }
          }

          // Handle student data
          if (localStorage.getItem('student')) {
            setStudentValues({
              university: userData.university || '',
              program: userData.program || '',
              startYear: userData.startyear || 0,
              endYear: userData.endyear || 0
            });

            // Process courses
            if (userData.courses) {
              const coursesArr = userData.courses.split(',');
              const formattedCourses = coursesArr.map(course => ({
                value: course,
                label: course.toUpperCase()
              }));
              setCourseOptions(formattedCourses);
              setCourses(formattedCourses);
            }
          }
        }
      } catch (error) {
        toast.error('Failed to load profile data');
        console.error('Error loading profile data:', error);
      }
    };

    loadProfileData();
  }, []);

  // File upload handler for profile picture
  const handleFileUpload = (file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle form submissions
  const handleGeneralSubmit = async () => {
    try {
      const username = localStorage.getItem('username');
      if (!username || !profilePic) return;
      
      await profileService.uploadProfileImage({
        file: profilePic,
        email: username
      });
      
      toast.success('Profile picture updated successfully');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update profile picture');
      console.error('Error updating profile picture:', error);
    }
  };

  const handleTutorSubmit = async (values) => {
    try {
      // Format skills as comma-separated string
      let skillStr = skills.map(skill => skill.value).join(',');
      
      const data = {
        userType: localStorage.getItem('userType'),
        email: localStorage.getItem('username'),
        skills: skillStr,
        expyears: values.fieldExperience.toString(),
        expdesc: values.desc
      };
      
      await profileService.updateTutorDetails(data);
      toast.success('Tutor details updated successfully');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update tutor details');
      console.error('Error updating tutor details:', error);
    }
  };

  const handleStudentSubmit = async (values) => {
    try {
      // Format courses as comma-separated string
      let courseStr = courses.map(course => course.value).join(',');
      
      const data = {
        userType: localStorage.getItem('userType'),
        email: localStorage.getItem('username'),
        university: values.university,
        program: values.program,
        courses: courseStr,
        startyear: values.startYear,
        endyear: values.endYear
      };
      
      await profileService.updateStudentDetails(data);
      toast.success('Student details updated successfully');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update student details');
      console.error('Error updating student details:', error);
    }
  };

  return (
    <div className="profile-container">
      <h2 className="text-center mb-4">Profile Management</h2>
      
      {/* General Form */}
      <div className="card mb-4">
        <div className="card-body">
          <Formik
            initialValues={generalInitialValues}
            onSubmit={handleGeneralSubmit}
          >
            {(formikProps) => (
              <GeneralForm
                {...formikProps}
                profilePic={profilePic}
                onFileChange={handleFileUpload}
              />
            )}
          </Formik>
        </div>
      </div>
      
      {/* Conditional rendering of Tutor Form */}
      {localStorage.getItem('tutor') && (
        <div className="card mb-4">
          <div className="card-body">
            <Formik
              initialValues={tutorValues}
              validationSchema={tutorValidator}
              onSubmit={handleTutorSubmit}
              enableReinitialize={true}
            >
              {(formikProps) => (
                <TutorForm
                  {...formikProps}
                  skills={skills}
                  setSkills={setSkills}
                  skillOptions={skillOptions}
                />
              )}
            </Formik>
          </div>
        </div>
      )}
      
      {/* Conditional rendering of Student Form */}
      {localStorage.getItem('student') && (
        <div className="card mb-4">
          <div className="card-body">
            <Formik
              initialValues={studentValues}
              validationSchema={studentValidator}
              onSubmit={handleStudentSubmit}
              enableReinitialize={true}
            >
              {(formikProps) => (
                <StudentForm
                  {...formikProps}
                  courses={courses}
                  setCourses={setCourses}
                  courseOptions={courseOptions}
                />
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;