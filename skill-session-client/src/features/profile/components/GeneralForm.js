// src/features/profile/components/GeneralForm.js
import { Spin } from 'antd';
import { Field, Form, Formik } from 'formik';
import { toast } from 'react-toastify';
import { useProfileImage } from '../hooks/useProfileImage';
import profileService from '../services/profileService';

const GeneralForm = ({ userData }) => {
  const { image, handleImageChange, isUploading } = useProfileImage(userData.profileImage);

  const handleSubmit = async (values) => {
    try {
      await profileService.uploadProfileImage({
        file: image,
        email: userData.email
      });
      toast.success('Profile picture updated successfully');
    } catch (error) {
      toast.error('Failed to update profile picture');
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="mb-0">General Information</h5>
      </div>
      <div className="card-body">
        <Formik
          initialValues={{
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            mobileNo: userData.mobileNo || ''
          }}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="form-group mb-3">
                <label htmlFor="firstName">First Name</label>
                <Field
                  type="text"
                  name="firstName"
                  className="form-control"
                  readOnly
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="lastName">Last Name</label>
                <Field
                  type="text"
                  name="lastName"
                  className="form-control"
                  readOnly
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="email">Email</label>
                <Field
                  type="email"
                  name="email"
                  className="form-control"
                  readOnly
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="mobileNo">Mobile Number</label>
                <Field
                  type="text"
                  name="mobileNo"
                  className="form-control"
                  readOnly
                />
              </div>

              <div className="profile-image-container mb-3 text-center">
                {isUploading ? (
                  <Spin />
                ) : (
                  <img
                    src={image || "https://via.placeholder.com/150"}
                    alt="Profile"
                    className="profile-image rounded-circle"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                )}
              </div>

              <div className="form-group mb-3">
                <label htmlFor="profileImage">Profile Picture</label>
                <input
                  type="file"
                  id="profileImage"
                  name="profileImage"
                  className="form-control"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>

              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || isUploading}
                >
                  {isSubmitting ? "Updating..." : "Update Profile Picture"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default GeneralForm;